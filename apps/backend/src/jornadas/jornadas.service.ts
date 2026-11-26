import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, LessThanOrEqual, type EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Jornada } from './jornada.entity';

import {
  ReservaJornada,
  EstadoReservaJornada,
  MENSAJE_RESERVA_EN_REVISION,
} from './reserva-jornada.entity';

import { CrearReservaJornadaDto } from './dto/crear-reserva-jornada.dto';

import {
  Pago,
  EstadoPago,
  ConceptoPago,
} from '../pagos/pago.entity';

import { Usuario } from '../usuarios/usuario.entity';
import { WompiService } from '../pagos/wompi.service';
import { MENSAJE_PAGO_EN_CONFIRMACION, PagosService, referenciaOriginalPago } from '../pagos/pagos.service';
import {
  calcularApartadoCentavos,
  calcularSaldoPendienteCentavos,
} from './tarifas-jornada.util';

// ==========================================
// REGLAS DE NEGOCIO
// ==========================================

const RESERVA_EXPIRACION_MINUTOS = 30;

@Injectable()
export class JornadasService {
  constructor(
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,

    @InjectRepository(ReservaJornada)
    private readonly reservaRepository: Repository<ReservaJornada>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly wompiService: WompiService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly pagosService: PagosService,
  ) {}

  // ==========================================
  // CONSULTAR JORNADAS ACTIVAS
  // ==========================================

  async obtenerJornadasActivas(): Promise<Jornada[]> {
    const jornadas = await this.jornadaRepository.find({
      where: { activa: true },
      order: {
        cuposDisponibles: 'DESC',
        creadoEn: 'DESC',
      },
    });

    return jornadas.map((jornada) => {
      jornada.precioApartadoCentavos =
        this.calcularApartadoCentavos(
          jornada.precioProcedimientoCentavos,
        );

      return jornada;
    });
  }

  // ==========================================
  // CONSULTAR JORNADA POR ID
  // ==========================================

  async obtenerJornadaPorId(
    id: number,
  ): Promise<Jornada | null> {
    const jornada = await this.jornadaRepository.findOne({
      where: { id },
    });

    if (jornada) {
      jornada.precioApartadoCentavos =
        this.calcularApartadoCentavos(
          jornada.precioProcedimientoCentavos,
        );
    }

    return jornada;
  }

  // ==========================================
  // CALCULAR APARTADO
  // ==========================================

  calcularApartadoCentavos(
    precio: number,
  ): number {
    return calcularApartadoCentavos(precio);
  }

  // ==========================================
  // CREAR RESERVA Y PAGO
  // ==========================================

  async crearReserva(
    usuarioId: number,
    dto: CrearReservaJornadaDto,
  ) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException(
        'El usuario no es válido.',
      );
    }

    if (
      !Number.isSafeInteger(dto.jornadaId) ||
      dto.jornadaId <= 0
    ) {
      throw new BadRequestException(
        'La jornada no es válida.',
      );
    }

    const nombrePropietario = dto.nombrePropietario?.trim();
    const nombreMascota = dto.nombreMascota?.trim();

    if (!nombrePropietario || !nombreMascota) {
      throw new BadRequestException(
        'Debes ingresar el nombre del propietario y de la mascota.',
      );
    }

    if (
      nombrePropietario.length > 100 ||
      nombreMascota.length > 100
    ) {
      throw new BadRequestException(
        'Los nombres no pueden superar los 100 caracteres.',
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        'No se encontró el usuario.',
      );
    }

    if (usuario.rol !== 'CIUDADANO') {
      throw new BadRequestException(
        'Solo los ciudadanos pueden reservar cupos.',
      );
    }

    if (!usuario.correoVerificado) {
      throw new BadRequestException(
        'Debes verificar tu correo electrónico.',
      );
    }

    if (usuario.estadoAprobacion !== 'APROBADO') {
      throw new BadRequestException(
        'Tu cuenta no está habilitada.',
      );
    }

    const anterior = await this.buscarReservaParaPago(usuarioId, dto.jornadaId);
    const resultadoAnterior = anterior?.pago && anterior.estado !== EstadoReservaJornada.CONFIRMADA
      ? await this.pagosService.reconciliarAntesDeReintentar(anterior.pago).catch((error: unknown) => {
          if (error instanceof ConflictException) {
            throw new ConflictException({ message: error.message, reservaId: anterior.id });
          }
          throw error;
        })
      : null;

    return this.dataSource.transaction(async (manager) => {
      // Bloquear jornada para evitar reservas simultáneas.

      const jornada = await manager.findOne(Jornada, {
        where: { id: dto.jornadaId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!jornada) {
        throw new NotFoundException(
          'No se encontró la jornada.',
        );
      }

      if (!jornada.activa) {
        throw new BadRequestException(
          'La jornada no está activa.',
        );
      }

      const ahora = new Date();

      if (
        jornada.fechaFin &&
        new Date(jornada.fechaFin) <= ahora
      ) {
        throw new BadRequestException(
          'La jornada ya ha finalizado.',
        );
      }

      // 1. Limpiar reservas vencidas de esta jornada para liberar cupos retenidos no pagados
      const reservasVencidas = await manager.find(ReservaJornada, {
        where: {
          jornada: { id: jornada.id },
          estado: EstadoReservaJornada.PENDIENTE,
          expiraEn: LessThanOrEqual(ahora),
        },
        relations: { pago: true },
      });

      let cuposRestaurados = 0;
      for (const resVencida of reservasVencidas) {
        if (new Date(resVencida.expiraEn) <= ahora) {
          resVencida.estado = EstadoReservaJornada.EXPIRADA;
          if (
            resVencida.pago &&
            resVencida.pago.estado === EstadoPago.PENDIENTE
          ) {
            resVencida.pago.estado = EstadoPago.EXPIRADO;
            await manager.save(Pago, resVencida.pago);
          }
          await manager.save(ReservaJornada, resVencida);
          cuposRestaurados += 1;
        }
      }

      if (cuposRestaurados > 0) {
        jornada.cuposDisponibles = Math.min(
          jornada.cuposTotales,
          jornada.cuposDisponibles + cuposRestaurados,
        );
        await manager.save(Jornada, jornada);
      }

      const precioProcedimientoCentavos =
        jornada.precioProcedimientoCentavos;

      const precioApartadoCentavos =
        this.calcularApartadoCentavos(
          precioProcedimientoCentavos,
        );

      // 2. Verificar si el usuario ya tiene una reserva CONFIRMADA para esta jornada
      const reservaConfirmada = await manager.findOne(
        ReservaJornada,
        {
          where: {
            usuario: { id: usuarioId },
            jornada: { id: jornada.id },
            estado: EstadoReservaJornada.CONFIRMADA,
          },
        },
      );

      if (reservaConfirmada) {
        throw new ConflictException(
          `Ya tienes una reserva confirmada para esta jornada (Código: ${reservaConfirmada.codigo}).`,
        );
      }

      const reservaExistente = await this.buscarReservaParaPago(usuarioId, jornada.id, manager);
      const pagoAnterior = reservaExistente?.pago;
      if (reservaExistente?.id !== anterior?.id || pagoAnterior?.id !== anterior?.pago?.id ||
          (reservaExistente && !pagoAnterior)) {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      }

      if (pagoAnterior) await this.pagosService.verificarHistorialBloqueado(pagoAnterior, manager);

      const puedeContinuar = pagoAnterior && resultadoAnterior === 'disponible' &&
        this.pagosService.puedeContinuarCheckout(pagoAnterior);
      const expiraCheckoutAnterior = puedeContinuar
        ? new URL(pagoAnterior.checkoutUrl).searchParams.get('expiration-time')
        : null;
      const checkoutVencido = !!expiraCheckoutAnterior && Date.parse(expiraCheckoutAnterior) <= ahora.getTime();
      const checkoutAnterior = puedeContinuar && !checkoutVencido ? pagoAnterior.checkoutUrl : null;
      if (pagoAnterior && !checkoutAnterior && !checkoutVencido && !this.pagosService.permiteReintento(pagoAnterior)) {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      }

      const referenciaOriginal = pagoAnterior
        ? referenciaOriginalPago(pagoAnterior.referencia)
        : undefined;
      const conservaCupo = reservaExistente?.estado === EstadoReservaJornada.PENDIENTE;
      const montoCentavos = reservaExistente?.precioApartadoHistoricoCentavos ?? precioApartadoCentavos;

      const frontendUrl = (this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
        .trim().replace(/\/+$/, '');
      const redirectUrl = `${frontendUrl}/jornadas/reserva-resultado`;

      // ==========================================
      // VALIDAR CUPOS
      // ==========================================

      if (
        !conservaCupo && (!Number.isInteger(jornada.cuposDisponibles) || jornada.cuposDisponibles <= 0)
      ) {
        throw new BadRequestException(
          'No hay cupos disponibles para esta jornada.',
        );
      }

      const expiraEn = conservaCupo && !checkoutVencido ? reservaExistente.expiraEn : new Date(
        ahora.getTime() +
          RESERVA_EXPIRACION_MINUTOS * 60 * 1000,
      );

      // ==========================================
      // CONFIGURACIÓN WOMPI
      // ==========================================

      const referencia = checkoutAnterior && pagoAnterior
        ? pagoAnterior.referencia
        : this.wompiService.generarReferencia(referenciaOriginal);

      const moneda = 'COP';

      const { checkout, checkoutUrl } = checkoutAnterior
        ? { checkout: undefined, checkoutUrl: checkoutAnterior }
        : this.wompiService.prepararCheckout(
            referencia, montoCentavos, moneda, redirectUrl, expiraEn.toISOString(),
          );

      const codigoReserva =
        `VP-${Date.now().toString().slice(-6)}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`;

      // ==========================================
      // RETENER CUPO
      // ==========================================

      if (!conservaCupo) {
        jornada.cuposDisponibles -= 1;
        await manager.save(Jornada, jornada);
      }

      // ==========================================
      // CREAR PAGO PENDIENTE
      // ==========================================

      const pago = (checkoutAnterior && pagoAnterior) || manager.create(Pago, {
        usuario: { id: usuarioId },
        referencia,
        montoCentavos,
        moneda,
        concepto: ConceptoPago.APARTADO_RESERVA,
        estado: EstadoPago.PENDIENTE,
        checkoutUrl,
      });

      const pagoGuardado = checkoutAnterior && pago.estado === EstadoPago.PENDIENTE
        ? pago
        : await manager.save(Pago, { ...pago, estado: EstadoPago.PENDIENTE });

      // ==========================================
      // CREAR RESERVA
      // ==========================================

      const reserva = reservaExistente ?? manager.create(ReservaJornada, {
        codigo: codigoReserva,
        jornada,
        usuario: { id: usuarioId },
        pago: pagoGuardado,
        referenciaPago: referencia,
        nombrePropietario,
        nombreMascota,
        precioProcedimientoHistoricoCentavos:
          precioProcedimientoCentavos,
        precioApartadoHistoricoCentavos:
          precioApartadoCentavos,
        estado: EstadoReservaJornada.PENDIENTE,
        expiraEn,
      });

      reserva.pago = pagoGuardado;
      reserva.referenciaPago = referenciaOriginal ?? referencia;
      reserva.estado = EstadoReservaJornada.PENDIENTE;
      reserva.expiraEn = expiraEn;
      reserva.nombrePropietario = nombrePropietario;
      reserva.nombreMascota = nombreMascota;

      const reservaGuardada = await manager.save(
        ReservaJornada,
        reserva,
      );

      return {
        mensaje:
          reservaExistente
            ? 'Tu reserva y el importe original se conservaron. Puedes continuar el pago en Wompi.'
            : 'Reserva creada correctamente. Redirigiendo a Wompi...',
        reutilizado: Boolean(checkoutAnterior),
        reserva: this.serializarReserva(reservaGuardada),
        pago: {
          id: pagoGuardado.id,
          referencia: pagoGuardado.referencia,
          concepto: pagoGuardado.concepto,
          montoCentavos: pagoGuardado.montoCentavos,
          moneda: pagoGuardado.moneda,
          estado: pagoGuardado.estado,
        },
        ...(checkout && { checkout }),
        checkoutUrl,
      };
    });
  }

  // ==========================================
  // CONSULTAR ESTADO DE RESERVA
  // ==========================================

  private buscarReservaParaPago(usuarioId: number, jornadaId: number, manager?: EntityManager) {
    const repository = manager?.getRepository(ReservaJornada) ?? this.reservaRepository;
    return repository.findOne({
      where: {
        usuario: { id: usuarioId },
        jornada: { id: jornadaId },
        estado: In([
          EstadoReservaJornada.CONFIRMADA, EstadoReservaJornada.PENDIENTE,
          EstadoReservaJornada.RECHAZADA, EstadoReservaJornada.EXPIRADA,
        ]),
      },
      relations: { pago: true, jornada: true },
      order: { id: 'DESC' },
    });
  }

  async verificarEstadoReserva(
    usuarioId: number,
    reservaId: number,
  ) {
    const reserva = await this.reservaRepository.findOne({
      where: {
        id: reservaId,
        usuario: { id: usuarioId },
      },
      relations: {
        pago: true,
        jornada: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException(
        'No se encontró la reserva o no te pertenece.',
      );
    }

    if (!reserva.pago) {
      return {
        ...this.serializarReserva(reserva),
        reservaId: reserva.id,
        pagoEstado: null,
        reservaConfirmada: false,
        mensaje: 'Aún no se ha iniciado el pago.',
      };
    }

    const estadoPago = reserva.pago.estado;

    const reservaConfirmada =
      estadoPago === EstadoPago.APROBADO &&
      reserva.estado === EstadoReservaJornada.CONFIRMADA;

    return {
      ...this.serializarReserva(reserva),
      reservaId: reserva.id,
      pagoEstado: estadoPago,
      referencia: reserva.pago.referencia,
      montoCentavos: reserva.pago.montoCentavos,
      reservaConfirmada,
      requiereRevision: estadoPago === EstadoPago.APROBADO && !reservaConfirmada,
      mensaje: reservaConfirmada
        ? '¡Pago aprobado exitosamente! Tu cupo ha sido reservado.'
        : this.mensajeEstadoPago(estadoPago),
    };
  }

  // ==========================================
  // MENSAJES DEL PAGO
  // ==========================================

  private mensajeEstadoPago(estado: string): string {
    switch (estado) {
      case EstadoPago.APROBADO:
        return MENSAJE_RESERVA_EN_REVISION;

      case EstadoPago.PENDIENTE:
        return 'El pago está pendiente de confirmación.';

      case EstadoPago.RECHAZADO:
        return 'Wompi rechazó el pago. Puedes volver a la jornada e intentar el pago cuando termine la verificación.';

      case EstadoPago.EXPIRADO:
        return 'El pago ha expirado.';

      case EstadoPago.ERROR:
        return 'Ocurrió un error procesando el pago.';

      case EstadoPago.ANULADO:
        return 'El pago fue anulado.';

      default:
        return `Estado del pago: ${estado}.`;
    }
  }

  // ==========================================
  // SERIALIZAR RESERVA
  // ==========================================

  private serializarReserva(reserva: ReservaJornada) {
    return {
      id: reserva.id,
      codigo: reserva.codigo,
      jornadaId: reserva.jornada?.id,
      jornadaTitulo: reserva.jornada?.titulo,
      veterinaria: reserva.jornada?.veterinaria,
      direccion: reserva.jornada?.direccion,
      fechaTexto: reserva.jornada?.fechaTexto,
      horaTexto: reserva.jornada?.horaTexto,
      nombrePropietario: reserva.nombrePropietario,
      nombreMascota: reserva.nombreMascota,

      precioProcedimientoHistoricoCentavos:
        reserva.precioProcedimientoHistoricoCentavos,

      precioApartadoHistoricoCentavos:
        reserva.precioApartadoHistoricoCentavos,

      saldoPendienteCentavos: Math.max(
        0,
        reserva.precioProcedimientoHistoricoCentavos -
          reserva.precioApartadoHistoricoCentavos,
      ),

      estado: reserva.estado,
      requiereRevision: reserva.pago?.estado === EstadoPago.APROBADO &&
        reserva.estado !== EstadoReservaJornada.CONFIRMADA,
      expiraEn: reserva.expiraEn,
      confirmadaEn: reserva.confirmadaEn,
      creadoEn: reserva.creadoEn,
    };
  }

  // ==========================================
  // CONSULTAR MIS RESERVAS (CIUDADANO)
  // ==========================================

  async consultarMisReservas(usuarioId: number) {
    const reservas = await this.reservaRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: {
        jornada: true,
        pago: true,
      },
      order: { creadoEn: 'DESC' },
    });

    return reservas.map((reserva) => this.serializarReserva(reserva));
  }

  // ==========================================
  // CONSULTAR JORNADAS DEL ORGANIZADOR
  // ==========================================

  async consultarJornadasOrganizador(organizadorId: number) {
    const jornadas = await this.jornadaRepository.find({
      where: { organizadorId },
      order: { creadoEn: 'DESC' },
    });

    return jornadas.map((j) => {
      j.precioApartadoCentavos = this.calcularApartadoCentavos(
        j.precioProcedimientoCentavos,
      );
      return j;
    });
  }

  // ==========================================
  // CONSULTAR RESERVAS DE UNA JORNADA
  // ==========================================

  async consultarReservasDeJornada(
    usuarioId: number,
    jornadaId: number,
    esAdmin: boolean,
  ) {
    const jornada = await this.jornadaRepository.findOne({
      where: { id: jornadaId },
    });

    if (!jornada) {
      throw new NotFoundException('No se encontró la jornada.');
    }

    if (!esAdmin && jornada.organizadorId !== usuarioId) {
      throw new ConflictException(
        'No tienes permiso para consultar las reservas de esta jornada.',
      );
    }

    const reservas = await this.reservaRepository.find({
      where: { jornada: { id: jornadaId } },
      relations: { pago: true, usuario: true, jornada: true },
      order: { creadoEn: 'DESC' },
    });

    return reservas.map((r) => this.serializarReserva(r));
  }
}