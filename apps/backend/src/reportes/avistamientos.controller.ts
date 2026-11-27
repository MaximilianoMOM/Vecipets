import {
  BadRequestException, Body, ConflictException, Controller, Get, Header, Inject,
  NotFoundException, Param, ParseIntPipe, Patch, Post, StreamableFile, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { Usuario } from '../usuarios/usuario.entity';
import { AlmacenamientoService } from './almacenamiento.service';
import { Avistamiento } from './avistamiento.entity';
import { CrearAvistamientoDto, ModerarAvistamientoDto } from './dto/crear-avistamiento.dto';
import { EstadoAprobacionReporte, EstadoReporte, Reporte, TipoReporte } from './reporte.entity';

const reportePublico = {
  tipo: TipoReporte.PERDIDA,
  estadoAprobacion: EstadoAprobacionReporte.APROBADO,
  estado: EstadoReporte.PUBLICO,
};
const extensiones: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

@Controller('reportes/:reporteId/avistamientos')
export class AvistamientosController {
  constructor(
    @InjectRepository(Avistamiento) private readonly avistamientos: Repository<Avistamiento>,
    @Inject(DataSource) private readonly dataSource: DataSource,
    @Inject(AlmacenamientoService) private readonly almacenamiento: AlmacenamientoService,
  ) {}

  @Get()
  async listar(@Param('reporteId', ParseIntPipe) reporteId: number) {
    const publicado = await this.dataSource.getRepository(Reporte).existsBy({
      id: reporteId, tipo: TipoReporte.PERDIDA, estadoAprobacion: EstadoAprobacionReporte.APROBADO,
      estado: EstadoReporte.PUBLICO,
    });
    if (!publicado) throw new NotFoundException('Reporte de pérdida no disponible.');
    const resultados = await this.avistamientos.find({
      where: { reporte: { id: reporteId }, visible: true },
      relations: { usuario: true },
      order: { fechaAvistamiento: 'DESC', id: 'DESC' },
    });
    return resultados.map((item) => ({
      id: item.id,
      autor: item.usuario.nombre,
      barrioSector: item.barrioSector,
      comentario: item.comentario,
      fechaAvistamiento: item.fechaAvistamiento,
      latitud: Number(item.latitud.toFixed(3)),
      longitud: Number(item.longitud.toFixed(3)),
      tieneImagen: !!item.imagenTipo,
    }));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  @UseInterceptors(FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  async crear(
    @Param('reporteId', ParseIntPipe) reporteId: number,
    @UsuarioAutenticado() sesion: { sub: number },
    @Body() dto: CrearAvistamientoDto,
    @UploadedFile() foto?: { buffer: Buffer; mimetype: string },
  ) {
    const fecha = new Date(dto.fechaAvistamiento);
    if (!Number.isFinite(fecha.getTime()) || fecha.getTime() > Date.now()) throw new BadRequestException('La fecha del avistamiento debe estar en el pasado.');
    const imagenTipo = foto ? extensiones[this.almacenamiento.validarBuffer(foto.buffer, foto.mimetype)] : null;
    const buffer = foto?.buffer;
    const firmaValida = !buffer || (
      (imagenTipo === 'image/jpeg' && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
      (imagenTipo === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
      (imagenTipo === 'image/webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
    );
    if (!firmaValida) {
      throw new BadRequestException('El tipo de imagen no coincide con el archivo.');
    }
    return this.dataSource.transaction(async (manager) => {
      const usuario = await manager.findOne(Usuario, { where: { id: sesion.sub }, lock: { mode: 'pessimistic_write' } });
      if (!usuario?.correoVerificado) throw new BadRequestException('Verifica tu correo antes de enviar un avistamiento.');
      const reporte = await manager.findOne(Reporte, {
        where: { id: reporteId, ...reportePublico }, lock: { mode: 'pessimistic_write' },
      });
      if (!reporte) throw new NotFoundException('El reporte no acepta avistamientos.');
      const repo = manager.getRepository(Avistamiento);
      const usuarioFiltro = { usuario: { id: usuario.id } };
      const repetido = await repo.existsBy({
        ...usuarioFiltro, reporte: { id: reporteId }, fechaAvistamiento: fecha, comentario: dto.comentario,
      });
      const recientes = await repo.countBy({
        ...usuarioFiltro, creadoEn: MoreThan(new Date(Date.now() - 10 * 60_000)),
      });
      if (repetido || recientes >= 3) throw new ConflictException('Ya enviaste este avistamiento o alcanzaste el límite. Intenta más tarde.');
      const item = await repo.save(repo.create({
        ...dto, fechaAvistamiento: fecha, usuario, reporte, imagenTipo, imagen: foto?.buffer ?? null,
      }));
      return { id: item.id };
    });
  }

  @Get(':id/imagen')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async imagen(@Param('reporteId', ParseIntPipe) reporteId: number, @Param('id', ParseIntPipe) id: number) {
    const item = await this.avistamientos.createQueryBuilder('avistamiento')
      .addSelect('avistamiento.imagen')
      .innerJoin('avistamiento.reporte', 'reporte')
      .where('avistamiento.id = :id AND avistamiento.visible = true', { id })
      .andWhere('reporte.id = :reporteId AND reporte.estado = :estado AND reporte.estadoAprobacion = :estadoAprobacion AND reporte.tipo = :tipo', { reporteId, ...reportePublico })
      .getOne();
    if (!item?.imagen || !item.imagenTipo) throw new NotFoundException('Imagen no disponible.');
    return new StreamableFile(item.imagen, { type: item.imagenTipo });
  }

  @Patch(':id/moderacion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async moderar(@Param('reporteId', ParseIntPipe) reporteId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: ModerarAvistamientoDto) {
    const item = await this.avistamientos.findOneBy({ id, reporte: { id: reporteId } });
    if (!item) throw new NotFoundException('Avistamiento no encontrado.');
    await this.avistamientos.update(id, { visible: dto.visible });
    return { id, visible: dto.visible };
  }
}
