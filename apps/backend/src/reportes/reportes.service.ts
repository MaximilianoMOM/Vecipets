
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reporte, EstadoAprobacionReporte, EstadoReporte } from './reporte.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CrearReporteDto } from './dto/crear-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async crear(dto: CrearReporteDto, usuarioId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario.');
    }

    if (
      usuario.rol !== 'CIUDADANO' ||
      !usuario.correoVerificado ||
      usuario.estadoAprobacion !== 'APROBADO'
    ) {
      throw new ForbiddenException(
        'No tienes autorización para crear reportes.',
      );
    }

    const reporte = this.reporteRepository.create({
      ...dto,
      raza: dto.raza ?? null,
      usuario,
      estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
      estado: EstadoReporte.PENDIENTE,
      esTurbo: false,
      turboActivadaEn: null,
      turboVenceEn: null,
    });

    return await this.reporteRepository.save(reporte);
  }
}
