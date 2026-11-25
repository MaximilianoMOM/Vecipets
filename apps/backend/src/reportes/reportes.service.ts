
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
import { PagosService } from '../pagos/pagos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EstadoPago } from '../pagos/pago.entity';

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

    private readonly pagosService: PagosService,

    private readonly notificacionesService: NotificacionesService,
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

    const esTurboDeseado =
      dto.esTurbo === true ||
      dto.esTurbo === 'true' ||
      dto.esTurbo === '1';

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

      // Rechazar inmediatamente si la imagen contiene contenido inapropiado
      if (
        decision.motivo &&
        (decision.motivo.toLowerCase().includes('inapropiad') ||
          decision.motivo.toLowerCase().includes('adulto') ||
          decision.motivo.toLowerCase().includes('violencia'))
      ) {
        throw new BadRequestException(
          `Fotografía rechazada por seguridad: ${decision.motivo}`,
        );
      }

      if (esTurboDeseado) {
        // En Alerta Turbo, el reporte se guarda internamente como PENDIENTE sin ser público
        // hasta que el pago en Wompi sea confirmado.
        estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
        estado = EstadoReporte.PENDIENTE;
        mensajeValidacion =
          'Reporte registrado como pendiente de pago de Alerta Turbo ($15.000 COP).';
      } else if (decision.aprobada && !decision.errorServicio) {
        // Reporte gratuito aprobado automáticamente por análisis de imagen
        estadoAprobacion = EstadoAprobacionReporte.APROBADO;
        estado = EstadoReporte.PUBLICO;
        mensajeValidacion =
          'Identificación de mascota aprobada automáticamente.';
      } else {
        estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
        estado = EstadoReporte.PENDIENTE;
      }
    } else if (esTurboDeseado) {
      estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
      estado = EstadoReporte.PENDIENTE;
    }

    let reporte: Reporte;
    const borradorIdNum = dto.borradorId ? Number(dto.borradorId) : null;

    if (borradorIdNum && Number.isSafeInteger(borradorIdNum)) {
      const existente = await this.reporteRepository.findOne({
        where: { id: borradorIdNum, usuario: { id: usuarioId } },
      });

      if (existente) {
        reporte = existente;
        reporte.tipo = dto.tipo;
        reporte.nombre = dto.nombre.trim();
        reporte.especie = dto.especie;
        reporte.raza = dto.raza?.trim() || null;
        reporte.color = dto.color?.trim() || null;
        reporte.tamano = dto.tamano?.trim() || null;
        reporte.sexo = dto.sexo?.trim() || null;
        reporte.edad = dto.edad?.trim() || null;
        reporte.descripcion = dto.descripcion.trim();
        reporte.fechaEvento = dto.fechaEvento;
        reporte.departamento = dto.departamento?.trim() || null;
        reporte.ciudad = dto.ciudad?.trim() || null;
        reporte.barrioSector = dto.barrioSector.trim();
        if (imagenUrl) reporte.imagenUrl = imagenUrl;
        reporte.latitud = dto.latitud ?? null;
        reporte.longitud = dto.longitud ?? null;
        reporte.direccion = dto.direccion?.trim() || null;
        reporte.referencia = dto.referencia?.trim() || null;
        reporte.recompensa =
          dto.recompensa !== undefined && dto.recompensa !== null && dto.recompensa !== ''
            ? Number(dto.recompensa)
            : null;
        reporte.estadoAprobacion = estadoAprobacion;
        reporte.estado = estado;
      } else {
        reporte = this.reporteRepository.create({
          tipo: dto.tipo,
          nombre: dto.nombre.trim(),
          especie: dto.especie,
          raza: dto.raza?.trim() || null,
          color: dto.color?.trim() || null,
          tamano: dto.tamano?.trim() || null,
          sexo: dto.sexo?.trim() || null,
          edad: dto.edad?.trim() || null,
          descripcion: dto.descripcion.trim(),
          fechaEvento: dto.fechaEvento,
          departamento: dto.departamento?.trim() || null,
          ciudad: dto.ciudad?.trim() || null,
          barrioSector: dto.barrioSector.trim(),
          imagenUrl,
          latitud: dto.latitud ?? null,
          longitud: dto.longitud ?? null,
          direccion: dto.direccion?.trim() || null,
          referencia: dto.referencia?.trim() || null,
          recompensa:
            dto.recompensa !== undefined && dto.recompensa !== null && dto.recompensa !== ''
              ? Number(dto.recompensa)
              : null,
          usuario,
          estadoAprobacion,
          estado,
          esTurbo: false,
          turboActivadaEn: null,
          turboVenceEn: null,
        });
      }
    } else {
      reporte = this.reporteRepository.create({
        tipo: dto.tipo,
        nombre: dto.nombre.trim(),
        especie: dto.especie,
        raza: dto.raza?.trim() || null,
        color: dto.color?.trim() || null,
        tamano: dto.tamano?.trim() || null,
        sexo: dto.sexo?.trim() || null,
        edad: dto.edad?.trim() || null,
        descripcion: dto.descripcion.trim(),
        fechaEvento: dto.fechaEvento,
        departamento: dto.departamento?.trim() || null,
        ciudad: dto.ciudad?.trim() || null,
        barrioSector: dto.barrioSector.trim(),
        imagenUrl,
        latitud: dto.latitud ?? null,
        longitud: dto.longitud ?? null,
        direccion: dto.direccion?.trim() || null,
        referencia: dto.referencia?.trim() || null,
        recompensa:
          dto.recompensa !== undefined && dto.recompensa !== null && dto.recompensa !== ''
            ? Number(dto.recompensa)
            : null,
        usuario,
        estadoAprobacion,
        estado,
        esTurbo: false,
        turboActivadaEn: null,
        turboVenceEn: null,
      });
    }

    const guardado = await this.reporteRepository.save(reporte);

    // Si el usuario seleccionó Alerta Turbo, generar la transacción asociada con Wompi
    if (esTurboDeseado) {
      const resultadoPago = await this.pagosService.crearPagoAlertaTurbo(
        usuarioId,
        guardado.id,
      );

      return {
        mensaje:
          'Borrador guardado correctamente. Procede a Wompi para realizar el pago de Alerta Turbo.',
        validacion: {
          estadoAprobacion,
          estadoReporte: estado,
          detalles: mensajeValidacion,
        },
        reporte: guardado,
        borradorId: guardado.id,
        pago: resultadoPago.pago,
        checkout: (resultadoPago as any).checkout,
        checkoutUrl: resultadoPago.checkoutUrl,
        esTurbo: true,
      };
    }

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
      borradorId: guardado.id,
    };
  }

  // ==========================================
  // CONSULTAR BORRADOR CON ESTADO DE PAGO
  // ==========================================
  async obtenerBorrador(id: number, usuarioId: number) {
    const reporte = await this.reporteRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: { usuario: true },
    });

    if (!reporte) {
      throw new NotFoundException('No se encontró el borrador o no te pertenece.');
    }

    const pago = await this.pagosService.consultarPagoPorReporte(usuarioId, id);
    const pagoAprobado = pago?.estado === EstadoPago.APROBADO;

    return {
      reporte,
      pago,
      pagoAprobado,
      mensaje: pagoAprobado
        ? 'Pago aprobado. Alerta Turbo activada para este reporte'
        : 'Borrador cargado correctamente.',
    };
  }

  // ==========================================
  // CONFIRMAR Y PUBLICAR REPORTE BORRADOR
  // ==========================================
  async publicarBorrador(
    id: number,
    usuarioId: number,
    dto?: ActualizarReporteDto,
  ) {
    const reporte = await this.reporteRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: { usuario: true },
    });

    if (!reporte) {
      throw new NotFoundException('No se encontró el reporte o no te pertenece.');
    }

    // Aplicar modificaciones finales si el usuario editó algún campo antes de enviar
    if (dto) {
      if (dto.nombre !== undefined) reporte.nombre = dto.nombre.trim();
      if (dto.especie !== undefined) reporte.especie = dto.especie;
      if (dto.raza !== undefined) reporte.raza = dto.raza?.trim() || null;
      if (dto.color !== undefined) reporte.color = dto.color?.trim() || null;
      if (dto.tamano !== undefined) reporte.tamano = dto.tamano?.trim() || null;
      if (dto.sexo !== undefined) reporte.sexo = dto.sexo?.trim() || null;
      if (dto.edad !== undefined) reporte.edad = dto.edad?.trim() || null;
      if (dto.descripcion !== undefined) reporte.descripcion = dto.descripcion.trim();
      if (dto.fechaEvento !== undefined) reporte.fechaEvento = dto.fechaEvento;
      if (dto.barrioSector !== undefined) reporte.barrioSector = dto.barrioSector.trim();
      if (dto.departamento !== undefined) reporte.departamento = dto.departamento?.trim() || null;
      if (dto.ciudad !== undefined) reporte.ciudad = dto.ciudad?.trim() || null;
      if (dto.direccion !== undefined) reporte.direccion = dto.direccion?.trim() || null;
      if (dto.referencia !== undefined) reporte.referencia = dto.referencia?.trim() || null;
      if (dto.recompensa !== undefined) {
        reporte.recompensa =
          dto.recompensa !== null && dto.recompensa !== ''
            ? Number(dto.recompensa)
            : null;
      }
    }

    // Verificar si existe pago aprobado de Alerta Turbo para este reporte
    const pagoTurbo = await this.pagosService.consultarPagoPorReporte(usuarioId, id);
    const pagoAprobado = pagoTurbo?.estado === EstadoPago.APROBADO;

    if (pagoAprobado) {
      const fechaActivacion = new Date();
      const fechaVencimiento = new Date(fechaActivacion);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);

      reporte.esTurbo = true;
      reporte.turboActivadaEn = fechaActivacion;
      reporte.turboVenceEn = fechaVencimiento;

      // Generar notificación informativa para el administrador
      await this.notificacionesService.registrarNotificacionPagoTurbo({
        titulo: 'Nuevo pago de Alerta Turbo',
        usuarioNombre: reporte.usuario?.nombre || 'Ciudadano VeciPets',
        reporteId: reporte.id,
        monto: '$15.000 COP',
        referencia: pagoTurbo.referencia,
        fechaPago: fechaActivacion,
        estado: 'Aprobado',
        enlaceReporte: `/reportes/${reporte.id}`,
      });
    }

    // El reporte queda formalmente enviado y en estado PENDIENTE de aprobación por el administrador
    reporte.estado = EstadoReporte.PENDIENTE;
    reporte.estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;

    const guardado = await this.reporteRepository.save(reporte);

    return {
      mensaje: pagoAprobado
        ? 'Reporte enviado con Alerta Turbo activa. Queda pendiente de aprobación por el administrador.'
        : 'Reporte enviado con éxito. Queda pendiente de aprobación por el administrador.',
      reporte: guardado,
      esTurbo: reporte.esTurbo,
      estadoAprobacion: reporte.estadoAprobacion,
      estado: reporte.estado,
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
    if (dto.color !== undefined) reporte.color = dto.color;
    if (dto.tamano !== undefined) reporte.tamano = dto.tamano;
    if (dto.sexo !== undefined) reporte.sexo = dto.sexo;
    if (dto.edad !== undefined) reporte.edad = dto.edad;

    if (dto.descripcion !== undefined) {
      reporte.descripcion = dto.descripcion.trim();
    }

    if (dto.fechaEvento !== undefined) {
      reporte.fechaEvento = dto.fechaEvento;
    }

    if (dto.barrioSector !== undefined) {
      reporte.barrioSector = dto.barrioSector.trim();
    }
    if (dto.departamento !== undefined) reporte.departamento = dto.departamento;
    if (dto.ciudad !== undefined) reporte.ciudad = dto.ciudad;

    if (dto.latitud !== undefined) reporte.latitud = dto.latitud;
    if (dto.longitud !== undefined) reporte.longitud = dto.longitud;
    if (dto.direccion !== undefined) reporte.direccion = dto.direccion;
    if (dto.referencia !== undefined) reporte.referencia = dto.referencia;
    if (dto.recompensa !== undefined) {
      reporte.recompensa = dto.recompensa ? Number(dto.recompensa) : null;
    }

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
