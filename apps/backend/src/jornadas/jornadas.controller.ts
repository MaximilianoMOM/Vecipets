import { BadRequestException, Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CrearJornadaDto } from './crear-jornada.dto';
import { Jornada } from './jornada.entity';

const fechaColombia = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' });
const horaColombia = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short', timeZone: 'America/Bogota' });

@Controller('jornadas')
export class JornadasController {
  constructor(
    @InjectRepository(Jornada) private readonly jornadas: Repository<Jornada>,
    private readonly usuarios: UsuariosService,
  ) {}

  @Get()
  async listar() {
    const jornadas = await this.jornadas.createQueryBuilder('jornada')
      .innerJoin('jornada.organizador', 'organizador')
      .where('jornada.fin > :ahora', { ahora: new Date() })
      .andWhere('jornada.activa = true')
      .andWhere('organizador.estadoAprobacion = :estado', { estado: 'APROBADO' })
      .orderBy('jornada.inicio', 'ASC')
      .addOrderBy('jornada.id', 'ASC')
      .getMany();

    return jornadas.map(({ id, titulo, veterinaria, comuna, direccion, inicio, fin, cuposDisponibles, precioCentavos, precioApartadoCentavos }) => ({
      id, titulo, veterinaria, comuna, direccion, inicio, fin,
      cupos: cuposDisponibles,
      precioCop: precioCentavos / 100,
      precioApartadoCop: precioApartadoCentavos / 100,
    }));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA')
  async publicar(
    @Body() datos: CrearJornadaDto,
    @UsuarioAutenticado() veterinaria: { sub: number },
  ) {
    const inicio = new Date(datos.inicio);
    const fin = new Date(datos.fin);
    if (!(inicio.getTime() > Date.now())) {
      throw new BadRequestException('La jornada debe comenzar en una fecha y hora futuras.');
    }
    if (!(fin.getTime() > inicio.getTime())) {
      throw new BadRequestException('La fecha y hora de cierre deben ser posteriores al inicio.');
    }

    const cuenta = await this.usuarios.obtenerPorId(veterinaria.sub);
    if (!cuenta) throw new NotFoundException('No se encontró la cuenta organizadora.');
    const precioApartadoCop = datos.precioCop === 0 ? 2000 : datos.cupos > 50 ? 10000 : 5000;
    const jornada = await this.jornadas.save(
      this.jornadas.create({
        titulo: datos.titulo,
        comuna: datos.comuna,
        direccion: datos.direccion,
        inicio,
        fin,
        organizadorId: cuenta.id,
        veterinaria: cuenta.nombre,
        fechaTexto: fechaColombia.format(inicio),
        horaTexto: horaColombia.formatRange(inicio, fin),
        cuposTotales: datos.cupos,
        cuposDisponibles: datos.cupos,
        precioCentavos: datos.precioCop * 100,
        precioApartadoCentavos: precioApartadoCop * 100,
      }),
    );
    return { id: jornada.id };
  }
}
