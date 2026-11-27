
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
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

    const estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
    const estado = EstadoReporte.PENDIENTE;

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

      if (decision.aprobada && !decision.errorServicio) {
        mensajeValidacion =
          'Imagen validada. El reporte está pendiente de revisión por el administrador.';
      }
    }

    if (esTurboDeseado) {
      mensajeValidacion = 'Reporte registrado como pendiente de pago de Alerta Turbo ($15.000 COP).';
    }

    let reporte: Reporte;
    const borradorIdNum = dto.borradorId ? Number(dto.borradorId) : null;

    if (borradorIdNum && Number.isSafeInteger(borradorIdNum)) {
      const existente = await this.reporteRepository.findOne({
        where: { id: borradorIdNum, usuario: { id: usuarioId } },
      });

      if (existente) {
        if (existente.enviadoRevision || existente.estado !== EstadoReporte.PENDIENTE) {
          throw new ConflictException('Este reporte ya no está disponible como borrador.');
        }
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

    reporte.enviadoRevision = !esTurboDeseado;
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
        reporte: this.serializarReporte({ ...guardado, usuario }),
        borradorId: guardado.id,
        pago: resultadoPago.pago,
        checkout: (resultadoPago as any).checkout,
        checkoutUrl: resultadoPago.checkoutUrl,
        esTurbo: true,
      };
    }

    return {
      mensaje: 'Tu reporte fue recibido y está pendiente de revisión.',
      validacion: {
        estadoAprobacion,
        estadoReporte: estado,
        detalles: mensajeValidacion,
      },
      reporte: this.serializarReporte({ ...guardado, usuario }),
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
      reporte: this.serializarReporte(reporte),
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
    const esBorrador = reporte.estado === EstadoReporte.PENDIENTE && !reporte.enviadoRevision;
    if (!esBorrador && reporte.estado !== EstadoReporte.RECHAZADO) {
      throw new ConflictException('Este reporte ya no está disponible para enviar a revisión.');
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
      if (dto.latitud !== undefined) reporte.latitud = dto.latitud;
      if (dto.longitud !== undefined) reporte.longitud = dto.longitud;
      if (dto.direccion !== undefined) reporte.direccion = dto.direccion?.trim() || null;
      if (dto.latitud !== undefined) reporte.latitud = dto.latitud;
      if (dto.longitud !== undefined) reporte.longitud = dto.longitud;
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
    reporte.enviadoRevision = true;

    const guardado = await this.reporteRepository.save(reporte);

    return {
      mensaje: pagoAprobado
        ? 'Reporte enviado con Alerta Turbo activa. Queda pendiente de aprobación por el administrador.'
        : 'Reporte enviado con éxito. Queda pendiente de aprobación por el administrador.',
      reporte: this.serializarReporte(guardado),
      esTurbo: reporte.esTurbo,
      estadoAprobacion: reporte.estadoAprobacion,
      estado: reporte.estado,
    };
  }

  // OBTENER REPORTES PÚBLICOS
  async obtenerParaModeracion() {
    const reportes = await this.reporteRepository.find({
      where: { enviadoRevision: true },
      relations: { usuario: true },
      order: { creadoEn: 'DESC' },
    });
    return reportes.map((reporte) => this.serializarReporte(reporte));
  }

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
      datos: filtrados.slice(inicio, inicio + limite).map((reporte) => this.serializarReportePublico(reporte)),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  // OBTENER REPORTES DEL CIUDADANO
  async obtenerMisReportes(usuarioId: number) {
    const reportes = await this.reporteRepository.find({
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
    return reportes.map((reporte) => this.serializarReporte(reporte));
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

    return esPropietario || esAdmin
      ? this.serializarReporte(reporte)
      : this.serializarReportePublico(reporte);
  }

  private serializarReportePublico({ usuario, ...reporte }: Reporte) {
    return { ...reporte, usuario: { id: usuario.id } };
  }

  private serializarReporte({ usuario, ...reporte }: Reporte) {
    return { ...reporte, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo } };
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
    const campos = (Object.keys(dto) as (keyof ActualizarReporteDto)[])
      .filter((campo) => dto[campo] !== undefined);

    if (esAdmin) {
      const decision = dto.estadoAprobacion;
      if (
        campos.length !== 1 ||
        (decision !== EstadoAprobacionReporte.APROBADO && decision !== EstadoAprobacionReporte.RECHAZADO)
      ) {
        throw new ForbiddenException('El administrador solo puede aprobar o rechazar la publicación.');
      }
      const pendiente = reporte.enviadoRevision && reporte.estado === EstadoReporte.PENDIENTE &&
        reporte.estadoAprobacion === EstadoAprobacionReporte.PENDIENTE;
      if (!pendiente) {
        throw new ConflictException('El reporte ya no está disponible para esta acción.');
      }
      return this.guardarModeracion(reporte, {
        estadoAprobacion: decision,
        estado: decision === EstadoAprobacionReporte.APROBADO ? EstadoReporte.PUBLICO : EstadoReporte.RECHAZADO,
      });
    }

    if (dto.estadoAprobacion !== undefined) {
      throw new ForbiddenException(
        'Solo un administrador puede modificar la aprobación.',
      );
    }

    if (dto.estado) {
      if (![EstadoReporte.RESUELTO, EstadoReporte.CERRADO].includes(dto.estado)) {
        throw new ForbiddenException(
          'El propietario solo puede marcar su reporte como RESUELTO o CERRADO.',
        );
      }
      if (reporte.estadoAprobacion !== EstadoAprobacionReporte.APROBADO ||
        ![EstadoReporte.PUBLICO, EstadoReporte.RESUELTO].includes(reporte.estado)) {
        throw new ConflictException('Solo puedes resolver o cerrar un reporte aprobado.');
      }
      if (campos.length !== 1) {
        throw new BadRequestException('Actualiza el estado por separado de los datos del reporte.');
      }
      return this.guardarModeracion(reporte, { estado: dto.estado });
    }

    if (![EstadoReporte.PENDIENTE, EstadoReporte.RECHAZADO].includes(reporte.estado)) {
      throw new ConflictException('Solo puedes editar los datos de un reporte pendiente o rechazado.');
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

    const cambios = Object.fromEntries(
      campos.map((campo) => [campo, reporte[campo]]),
    ) as Partial<Omit<Reporte, 'usuario'>>;
    if (!Object.keys(cambios).length) return this.serializarReporte(reporte);
    return this.guardarModeracion(reporte, cambios);
  }

  private async guardarModeracion(
    reporte: Reporte,
    cambios: Partial<Omit<Reporte, 'usuario'>>,
  ) {
    const resultado = await this.reporteRepository.update({
      id: reporte.id,
      estado: reporte.estado,
      estadoAprobacion: reporte.estadoAprobacion,
      enviadoRevision: reporte.enviadoRevision,
    }, cambios);
    if (!resultado.affected) {
      throw new ConflictException('El reporte cambió. Recarga la página e intenta de nuevo.');
    }
    return this.serializarReporte({ ...reporte, ...cambios });
  }
}
