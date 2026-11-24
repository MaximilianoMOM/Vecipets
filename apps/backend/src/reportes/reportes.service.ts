
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Reporte,
  EstadoAprobacionReporte,
  EstadoReporte,
} from './reporte.entity';

import { Usuario } from '../usuarios/usuario.entity';

import { CrearReporteDto } from './dto/crear-reporte.dto';
import { ActualizarReporteDto } from './dto/actualizar-reporte.dto';
import { FiltrarReportesDto } from './dto/filtrar-reportes.dto';

import { AlmacenamientoService } from './almacenamiento.service';

import {
  ValidacionImagenesService,
  ArchivoImagen,
} from '../validacion-imagenes/validacion-imagenes.service';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly almacenamientoService: AlmacenamientoService,

    private readonly validacionImagenesService: ValidacionImagenesService,
  ) {}

  // CREAR REPORTE
  async crear(
    dto: CrearReporteDto,
    usuarioId: number,
    archivo?: ArchivoImagen,
  ) {
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
        'Solo los ciudadanos verificados y aprobados pueden crear reportes.',
      );
    }

    if (!archivo?.buffer?.length && !dto.imagenUrl?.trim()) {
      throw new BadRequestException(
        'Debes adjuntar una fotografía para crear el reporte.',
      );
    }

    let imagenUrl = dto.imagenUrl?.trim() ?? '';

    let estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
    let estado = EstadoReporte.PENDIENTE;

    let mensajeValidacion =
      'El reporte está pendiente de revisión administrativa.';

    if (archivo?.buffer?.length) {
      imagenUrl = await this.almacenamientoService.guardarImagen(
        archivo.buffer,
        archivo.mimetype,
      );

      const decision =
        await this.validacionImagenesService.validarImagenReporte(archivo);

      mensajeValidacion = decision.motivo;

      if (decision.aprobada && !decision.errorServicio) {
        estadoAprobacion = EstadoAprobacionReporte.APROBADO;
        estado = EstadoReporte.PUBLICO;

        mensajeValidacion =
          'Roboflow identificó una mascota con suficiente confianza.';
      } else {
        estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
        estado = EstadoReporte.PENDIENTE;
      }
    }

    const reporte = this.reporteRepository.create({
      tipo: dto.tipo,
      nombre: dto.nombre.trim(),
      especie: dto.especie,
      raza: dto.raza?.trim() || null,
      descripcion: dto.descripcion.trim(),
      fechaEvento: dto.fechaEvento,
      barrioSector: dto.barrioSector.trim(),
      imagenUrl,
      latitud: dto.latitud ?? null,
      longitud: dto.longitud ?? null,
      direccion: dto.direccion?.trim() || null,
      referencia: dto.referencia?.trim() || null,
      recompensa: dto.recompensa ?? null,
      usuario,
      estadoAprobacion,
      estado,
      esTurbo: false,
      turboActivadaEn: null,
      turboVenceEn: null,
    });

    const guardado = await this.reporteRepository.save(reporte);

    return {
      mensaje:
        estado === EstadoReporte.PUBLICO
          ? 'Tu reporte fue publicado correctamente.'
          : 'Tu reporte fue recibido y está pendiente de revisión.',
      validacion: {
        estadoAprobacion,
        estadoReporte: estado,
        detalles: mensajeValidacion,
      },
      reporte: guardado,
    };
  }

  // OBTENER REPORTES PÚBLICOS
  async obtenerPublicos(filtros: FiltrarReportesDto) {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 50;

    const reportes = await this.reporteRepository.find({
      where: {
        estado: EstadoReporte.PUBLICO,
        estadoAprobacion: EstadoAprobacionReporte.APROBADO,
      },
      relations: {
        usuario: true,
      },
      order: {
        creadoEn: 'DESC',
      },
    });

    const busqueda = filtros.busqueda?.toLowerCase().trim();

    const filtrados = reportes.filter((reporte) => {
      if (filtros.tipo && reporte.tipo !== filtros.tipo) {
        return false;
      }

      if (
        filtros.especie &&
        reporte.especie.toLowerCase() !== filtros.especie.toLowerCase()
      ) {
        return false;
      }

      if (
        filtros.barrioSector &&
        !reporte.barrioSector
          .toLowerCase()
          .includes(filtros.barrioSector.toLowerCase())
      ) {
        return false;
      }

      if (busqueda) {
        const coincide =
          reporte.nombre.toLowerCase().includes(busqueda) ||
          reporte.descripcion.toLowerCase().includes(busqueda) ||
          reporte.barrioSector.toLowerCase().includes(busqueda);

        if (!coincide) return false;
      }

      return true;
    });

    const ahora = new Date();

    filtrados.sort((a, b) => {
      const turboA =
        a.esTurbo && !!a.turboVenceEn && a.turboVenceEn > ahora;

      const turboB =
        b.esTurbo && !!b.turboVenceEn && b.turboVenceEn > ahora;

      if (turboA !== turboB) {
        return turboA ? -1 : 1;
      }

      return b.creadoEn.getTime() - a.creadoEn.getTime();
    });

    const total = filtrados.length;
    const inicio = (pagina - 1) * limite;

    return {
      datos: filtrados.slice(inicio, inicio + limite),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  // OBTENER REPORTES DEL CIUDADANO
  async obtenerMisReportes(usuarioId: number) {
    return this.reporteRepository.find({
      where: {
        usuario: { id: usuarioId },
      },
      relations: {
        usuario: true,
      },
      order: {
        creadoEn: 'DESC',
      },
    });
  }

  // OBTENER UN REPORTE POR ID
  async obtenerPorId(
    id: number,
    usuarioId?: number,
    esAdmin = false,
  ) {
    const reporte = await this.reporteRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
      },
    });

    if (!reporte) {
      throw new NotFoundException('No se encontró el reporte.');
    }

    const esPublico =
      reporte.estado === EstadoReporte.PUBLICO &&
      reporte.estadoAprobacion === EstadoAprobacionReporte.APROBADO;

    const esPropietario = reporte.usuario.id === usuarioId;

    if (!esPublico && !esPropietario && !esAdmin) {
      throw new ForbiddenException(
        'No tienes permiso para consultar este reporte.',
      );
    }

    return reporte;
  }

  // ACTUALIZAR REPORTE
  async actualizar(
    id: number,
    dto: ActualizarReporteDto,
    usuarioId: number,
    esAdmin = false,
  ) {
    const reporte = await this.reporteRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
      },
    });

    if (!reporte) {
      throw new NotFoundException('No se encontró el reporte.');
    }

    const esPropietario = reporte.usuario.id === usuarioId;

    if (!esAdmin && !esPropietario) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este reporte.',
      );
    }

    if (!esAdmin) {
      if (
        dto.estado &&
        ![EstadoReporte.RESUELTO, EstadoReporte.CERRADO].includes(dto.estado)
      ) {
        throw new ForbiddenException(
          'El propietario solo puede marcar su reporte como RESUELTO o CERRADO.',
        );
      }

      if (dto.estadoAprobacion !== undefined) {
        throw new ForbiddenException(
          'Solo un administrador puede modificar la aprobación.',
        );
      }
    }

    if (dto.tipo !== undefined) reporte.tipo = dto.tipo;
    if (dto.nombre !== undefined) reporte.nombre = dto.nombre.trim();
    if (dto.especie !== undefined) reporte.especie = dto.especie;
    if (dto.raza !== undefined) reporte.raza = dto.raza;

    if (dto.descripcion !== undefined) {
      reporte.descripcion = dto.descripcion.trim();
    }

    if (dto.fechaEvento !== undefined) {
      reporte.fechaEvento = dto.fechaEvento;
    }

    if (dto.barrioSector !== undefined) {
      reporte.barrioSector = dto.barrioSector.trim();
    }

    if (dto.latitud !== undefined) reporte.latitud = dto.latitud;
    if (dto.longitud !== undefined) reporte.longitud = dto.longitud;
    if (dto.direccion !== undefined) reporte.direccion = dto.direccion;
    if (dto.referencia !== undefined) reporte.referencia = dto.referencia;

    if (esAdmin) {
      if (dto.estadoAprobacion !== undefined) {
        reporte.estadoAprobacion = dto.estadoAprobacion;

        if (
          dto.estadoAprobacion === EstadoAprobacionReporte.APROBADO
        ) {
          reporte.estado = EstadoReporte.PUBLICO;
        } else if (
          dto.estadoAprobacion === EstadoAprobacionReporte.RECHAZADO
        ) {
          reporte.estado = EstadoReporte.RECHAZADO;
        } else {
          reporte.estado = EstadoReporte.PENDIENTE;
        }
      } else if (dto.estado !== undefined) {
        reporte.estado = dto.estado;
      }
    } else if (dto.estado !== undefined) {
      reporte.estado = dto.estado;
    }

    return this.reporteRepository.save(reporte);
  }
}
