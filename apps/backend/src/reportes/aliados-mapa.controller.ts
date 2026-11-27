import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { Jornada } from '../jornadas/jornada.entity';
import { IsNull, Not } from 'typeorm';
import { EstadoAprobacionReporte, EstadoReporte, Reporte } from './reporte.entity';
import { AliadoMapa } from './aliado-mapa.entity';

@Controller('mapa')
export class AliadosMapaController {
  constructor(
    @InjectRepository(AliadoMapa) private readonly aliados: Repository<AliadoMapa>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get('reportes')
  async reportes() {
    const rows = await this.dataSource.getRepository(Reporte).find({
      where: { estado: EstadoReporte.PUBLICO, estadoAprobacion: EstadoAprobacionReporte.APROBADO, latitud: Not(IsNull()), longitud: Not(IsNull()) },
      select: {
        id: true, nombre: true, especie: true, tipo: true, latitud: true, longitud: true,
        barrioSector: true, ciudad: true, imagenUrl: true, fechaEvento: true,
        esTurbo: true, turboVenceEn: true,
      },
      order: { creadoEn: 'DESC', id: 'DESC' },
    });
    return rows.map((row) => ({
      ...row,
      latitud: Number(Number(row.latitud).toFixed(3)),
      longitud: Number(Number(row.longitud).toFixed(3)),
    }));
  }

  @Get('aliados')
  listar() {
    return this.aliados.findBy({ publicado: true });
  }

  @Get('aliados/:id')
  async detalle(@Param('id', ParseIntPipe) id: number) {
    const aliado = await this.aliados.findOneBy({ id, publicado: true });
    if (!aliado) throw new NotFoundException('Aliado no disponible.');
    const jornadas = aliado.tipo === 'veterinaria'
      ? await this.dataSource.getRepository(Jornada).find({
          select: { id: true, titulo: true, fechaTexto: true, horaTexto: true },
          where: {
            activa: true, veterinaria: aliado.nombre, direccion: aliado.direccion,
            fechaFin: MoreThan(new Date()), cuposDisponibles: MoreThan(0),
          },
          order: { fechaInicio: 'ASC' },
        })
      : [];
    return { ...aliado, jornadas };
  }
}
