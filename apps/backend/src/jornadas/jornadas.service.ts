import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Jornada } from './jornada.entity';

import {
  ReservaJornada,
  EstadoReservaJornada,
} from './reserva-jornada.entity';

import { CrearReservaJornadaDto } from './dto/crear-reserva-jornada.dto';

import {
  Pago,
  EstadoPago,
  ConceptoPago,
} from '../pagos/pago.entity';

import { Usuario } from '../usuarios/usuario.entity';
import { WompiService } from '../pagos/wompi.service';

// ==========================================
// REGLAS DE NEGOCIO
// ==========================================

const APARTADO_GRATUITO_CENTAVOS = 200_000;
const APARTADO_BAJO_CENTAVOS = 500_000;
const APARTADO_ALTO_CENTAVOS = 1_000_000;
const UMBRAL_APARTO_ALTO_CENTAVOS = 5_000_000;
const RESERVA_EXPIRACION_MINUTOS = 30;

@Injectable()
export class JornadasService {
  constructor(
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,

    @InjectRepository(ReservaJornada)
    private readonly reservaRepository: Repository<ReservaJornada>,

    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly wompiService: WompiService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
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

  private calcularApartadoCentavos(
    precio: number,
  ): number {
    if (!Number.isSafeInteger(precio) || precio < 0) {
      throw new BadRequestException(
        'El precio del procedimiento no es válido.',
      );
    }

    // Jornada gratuita: $2.000
    if (precio === 0) {
      return APARTADO_GRATUITO_CENTAVOS;
    }

    // Jornada menor a $50.000: $5.000
    if (precio < UMBRAL_APARTO_ALTO_CENTAVOS) {
      return APARTADO_BAJO_CENTAVOS;
    }

    // Jornada desde $50.000: $10.000
    return APARTADO_ALTO_CENTAVOS;
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

      const precioProcedimientoCentavos =
        jornada.precioProcedimientoCentavos;

      const precioApartadoCentavos =
        this.calcularApartadoCentavos(
          precioProcedimientoCentavos,
        );

      // ==========================================
      // VERIFICAR RESERVAS PENDIENTES
      // ==========================================

      const reservaExistente = await manager.findOne(
        ReservaJornada,
        {
          where: {
            usuario: { id: usuarioId },
            jornada: { id: jornada.id },
            estado: EstadoReservaJornada.PENDIENTE,
          },
          relations: {
            pago: true,
            jornada: true,
          },
        },
      );

      if (reservaExistente) {
        const pagoExistente = reservaExistente.pago;

        if (
          new Date(reservaExistente.expiraEn) > ahora &&
          pagoExistente &&
          pagoExistente.estado === EstadoPago.PENDIENTE &&
          pagoExistente.checkoutUrl &&
          pagoExistente.montoCentavos ===
            precioApartadoCentavos &&
          reservaExistente.nombrePropietario ===
            nombrePropietario &&
          reservaExistente.nombreMascota === nombreMascota
        ) {
          return {
            mensaje: 'Ya tienes una reserva pendiente.',
            reutilizado: true,
            reserva: this.serializarReserva(reservaExistente),
            checkoutUrl: pagoExistente.checkoutUrl,
          };
        }

        throw new ConflictException(
          'Tienes una reserva pendiente que debe resolverse antes de iniciar otro pago.',
        );
      }

      // ==========================================
      // VALIDAR CUPOS
      // ==========================================

      if (
        !Number.isInteger(jornada.cuposDisponibles) ||
        jornada.cuposDisponibles <= 0
      ) {
        throw new BadRequestException(
          'No hay cupos disponibles para esta jornada.',
        );
      }

      const expiraEn = new Date(
        ahora.getTime() +
          RESERVA_EXPIRACION_MINUTOS * 60 * 1000,
      );

      // ==========================================
      // CONFIGURACIÓN WOMPI
      // ==========================================

      const referencia =
        this.wompiService.generarReferencia();

      const moneda = 'COP';

      const frontendUrl = (
        this.configService.get<string>('FRONTEND_URL') ??
        'http://localhost:3000'
      )
        .trim()
        .replace(/\/+$/, '');

      const redirectUrl =
        `${frontendUrl}/jornadas/reserva-resultado`;

      const checkout =
        this.wompiService.obtenerDatosCheckout(
          referencia,
          precioApartadoCentavos,
          moneda,
          redirectUrl,
        );

      const parametros = new URLSearchParams({
        'public-key': checkout.publicKey,
        currency: checkout.currency,
        'amount-in-cents': String(checkout.amountInCents),
        reference: checkout.reference,
        'signature:integrity': checkout.signature.integrity,
      });

      parametros.set('redirect-url', redirectUrl);

      const queryString = parametros
        .toString()
        .replace(
          'signature%3Aintegrity',
          'signature:integrity',
        );

      const checkoutUrl =
        `${this.wompiService.obtenerUrlCheckout()}?${queryString}`;

      const codigoReserva =
        `VP-${Date.now().toString().slice(-6)}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`;

      // ==========================================
      // RETENER CUPO
      // ==========================================

      jornada.cuposDisponibles -= 1;

      await manager.save(Jornada, jornada);

      // ==========================================
      // CREAR PAGO PENDIENTE
      // ==========================================

      const pago = manager.create(Pago, {
        usuario: { id: usuarioId },
        referencia,
        montoCentavos: precioApartadoCentavos,
        moneda,
        concepto: ConceptoPago.APARTADO_RESERVA,
        estado: EstadoPago.PENDIENTE,
        checkoutUrl,
      });

      const pagoGuardado = await manager.save(Pago, pago);

      // ==========================================
      // CREAR RESERVA
      // ==========================================

      const reserva = manager.create(ReservaJornada, {
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

      const reservaGuardada = await manager.save(
        ReservaJornada,
        reserva,
      );

      return {
        mensaje:
          'Reserva creada correctamente. Redirigiendo a Wompi...',
        reutilizado: false,
        reserva: this.serializarReserva(reservaGuardada),
        pago: {
          id: pagoGuardado.id,
          referencia: pagoGuardado.referencia,
          concepto: pagoGuardado.concepto,
          montoCentavos: pagoGuardado.montoCentavos,
          moneda: pagoGuardado.moneda,
          estado: pagoGuardado.estado,
        },
        checkout,
        checkoutUrl,
      };
    });
  }

  // ==========================================
  // CONSULTAR ESTADO DE RESERVA
  // ==========================================

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

    const pagoActualizado =
      await this.pagoRepository.findOne({
        where: { id: reserva.pago.id },
      });

    const estadoPago =
      pagoActualizado?.estado ?? reserva.pago.estado;

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
        return 'Pago aprobado. Verificando la reserva.';

      case EstadoPago.PENDIENTE:
        return 'El pago está pendiente de confirmación.';

      case EstadoPago.RECHAZADO:
        return 'El pago fue rechazado.';

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
      expiraEn: reserva.expiraEn,
      confirmadaEn: reserva.confirmadaEn,
      creadoEn: reserva.creadoEn,
    };
  }

  // ==========================================
  // CONFIRMAR RESERVA POR PAGO APROBADO
  // ==========================================

  async confirmarReservaPorPagoAprobado(
    reserva: ReservaJornada,
    pago: Pago,
  ): Promise<ReservaJornada> {
    if (pago.estado !== EstadoPago.APROBADO) {
      throw new BadRequestException(
        'El pago todavía no está aprobado.',
      );
    }

    if (
      pago.concepto !== ConceptoPago.APARTADO_RESERVA ||
      pago.referencia !== reserva.referenciaPago ||
      pago.moneda !== 'COP' ||
      pago.montoCentavos !==
        reserva.precioApartadoHistoricoCentavos
    ) {
      throw new BadRequestException(
        'El pago no corresponde a esta reserva.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const reservaActual = await manager.findOne(
        ReservaJornada,
        {
          where: { id: reserva.id },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!reservaActual) {
        throw new NotFoundException(
          'No se encontró la reserva.',
        );
      }

      if (
        reservaActual.estado ===
        EstadoReservaJornada.CONFIRMADA
      ) {
        return reservaActual;
      }

      if (
        reservaActual.estado !==
        EstadoReservaJornada.PENDIENTE
      ) {
        throw new ConflictException(
          'La reserva ya no está pendiente. El pago requiere revisión.',
        );
      }

      reservaActual.estado =
        EstadoReservaJornada.CONFIRMADA;

      reservaActual.confirmadaEn = new Date();
      reservaActual.referenciaPago = pago.referencia;

      // No descontar otro cupo.
      // El cupo fue retenido al crear la reserva.

      return manager.save(
        ReservaJornada,
        reservaActual,
      );
    });
  }

  // ==========================================
  // LIBERAR CUPO
  // ==========================================

  async liberarCupoReserva(
    reserva: ReservaJornada,
    jornada: Jornada,
    nuevoEstado: EstadoReservaJornada,
  ): Promise<ReservaJornada> {
    if (
      nuevoEstado === EstadoReservaJornada.PENDIENTE ||
      nuevoEstado === EstadoReservaJornada.CONFIRMADA
    ) {
      throw new BadRequestException(
        'El nuevo estado no permite liberar el cupo.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const jornadaActual = await manager.findOne(
        Jornada,
        {
          where: { id: jornada.id },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!jornadaActual) {
        throw new NotFoundException(
          'No se encontró la jornada.',
        );
      }

      const reservaActual = await manager.findOne(
        ReservaJornada,
        {
          where: {
            id: reserva.id,
            jornada: { id: jornada.id },
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!reservaActual) {
        throw new NotFoundException(
          'No se encontró la reserva.',
        );
      }

      if (
        reservaActual.estado !==
        EstadoReservaJornada.PENDIENTE
      ) {
        return reservaActual;
      }

      if (
        jornadaActual.cuposDisponibles >=
        jornadaActual.cuposTotales
      ) {
        throw new ConflictException(
          'La cantidad de cupos requiere revisión.',
        );
      }

      jornadaActual.cuposDisponibles += 1;

      await manager.save(Jornada, jornadaActual);

      reservaActual.estado = nuevoEstado;

      return manager.save(
        ReservaJornada,
        reservaActual,
      );
    });
  }
}