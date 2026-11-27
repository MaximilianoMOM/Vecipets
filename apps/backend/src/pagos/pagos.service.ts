
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Raw, type EntityManager } from 'typeorm';

import {
  Pago,
  EstadoPago,
  ConceptoPago,
} from './pago.entity';

import {
  IntentoPago,
  EstadoIntentoPago,
} from './intento-pago.entity';

import {
  Reporte,
  EstadoAprobacionReporte,
  EstadoReporte,
} from '../reportes/reporte.entity';

import { Jornada } from '../jornadas/jornada.entity';
import {
  ReservaJornada,
  EstadoReservaJornada,
  MENSAJE_RESERVA_EN_REVISION,
} from '../jornadas/reserva-jornada.entity';

import { WompiService } from './wompi.service';
import { ConfigService } from '@nestjs/config';
import { redireccionWompi, reusarCheckoutWompi } from './wompi-redirect';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const PRECIO_TURBO_CENTAVOS = 1500000;
const DURACION_TURBO_DIAS = 7;

export function referenciaOriginalPago(referencia: string): string {
  return referencia.replace(/_[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, '');
}

export const MENSAJE_PAGO_EN_CONFIRMACION =
  'Aún estamos verificando el pago anterior. Consulta el resultado de Wompi o espera la confirmación antes de volver a pagar.';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,

    @InjectRepository(ReservaJornada)
    private readonly reservaJornadaRepository: Repository<ReservaJornada>,

    private readonly wompiService: WompiService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // ==========================================
  // CREAR PAGO DE ALERTA TURBO
  // ==========================================

  async crearPagoAlertaTurbo(usuarioId: number, reporteId: number) {
    if (!Number.isSafeInteger(reporteId) || reporteId <= 0) {
      throw new BadRequestException('El reporte no es válido.');
    }

    const reporte = await this.reporteRepository
      .createQueryBuilder('reporte')
      .innerJoin('reporte.usuario', 'usuario')
      .where('reporte.id = :reporteId', { reporteId })
      .andWhere('usuario.id = :usuarioId', { usuarioId })
      .getOne();

    if (!reporte) {
      throw new NotFoundException(
        'No se encontró el reporte o no te pertenece.',
      );
    }

    if (
      reporte.estado === EstadoReporte.RECHAZADO ||
      reporte.estado === EstadoReporte.CERRADO ||
      reporte.estadoAprobacion === EstadoAprobacionReporte.RECHAZADO
    ) {
      throw new BadRequestException(
        'No puedes activar Alerta Turbo en un reporte rechazado o cerrado.',
      );
    }

    const anterior = await this.buscarUltimoPagoTurbo(usuarioId, reporteId);
    const turboActivo = reporte.esTurbo && reporte.turboVenceEn && reporte.turboVenceEn > new Date();
    if (turboActivo) throw new ConflictException('Este reporte ya tiene una Alerta Turbo activa.');
    const renovacion = anterior?.estado === EstadoPago.APROBADO && !turboActivo &&
      !!reporte.turboVenceEn && reporte.turboVenceEn <= new Date();
    const resultadoAnterior = anterior && !renovacion
      ? await this.reconciliarAntesDeReintentar(anterior)
      : null;

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT id FROM reportes WHERE id = $1 FOR UPDATE', [reporteId]);
      const vigente = await manager.findOneOrFail(Reporte, { where: { id: reporteId } });
      const ultimo = await this.buscarUltimoPagoTurbo(usuarioId, reporteId, manager);
      if (vigente.esTurbo && vigente.turboVenceEn && vigente.turboVenceEn > new Date()) {
        throw new ConflictException('Este reporte ya tiene una Alerta Turbo activa.');
      }
      if (
        ultimo?.id !== anterior?.id ||
        (ultimo && !renovacion && resultadoAnterior !== 'disponible' && !this.permiteReintento(ultimo))
      ) {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      }
      if (vigente.esTurbo && vigente.turboVenceEn && vigente.turboVenceEn <= new Date()) {
        vigente.esTurbo = false;
        vigente.turboActivadaEn = null;
        vigente.turboVenceEn = null;
        await manager.save(Reporte, vigente);
      }

      if (ultimo && !renovacion) await this.verificarHistorialBloqueado(ultimo, manager);

      if (ultimo && resultadoAnterior === 'disponible') {
        if (!this.puedeContinuarCheckout(ultimo)) throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
        return {
          mensaje: 'Wompi confirmó que este enlace aún no tiene una transacción.',
          reutilizado: true,
          pago: {
            id: ultimo.id,
            referencia: ultimo.referencia,
            estado: ultimo.estado,
            montoCentavos: ultimo.montoCentavos,
            concepto: ultimo.concepto,
            moneda: ultimo.moneda,
            reporteId,
          },
          checkoutUrl: reusarCheckoutWompi(ultimo.checkoutUrl, this.configService, '/reportar'),
        };
      }

      const referencia = this.wompiService.generarReferencia(
        ultimo && !renovacion ? referenciaOriginalPago(ultimo.referencia) : undefined,
      );
      const moneda = 'COP';
      const montoCentavos = ultimo && !renovacion ? ultimo.montoCentavos : PRECIO_TURBO_CENTAVOS;

      const redirectUrl = redireccionWompi(this.configService, '/reportar');

      const { checkout, checkoutUrl } = this.wompiService.prepararCheckout(
        referencia, montoCentavos, moneda, redirectUrl,
      );

      const pago = manager.create(Pago, {
        usuario: { id: usuarioId },
        referencia,
        montoCentavos,
        moneda,
        concepto: ConceptoPago.ALERTA_TURBO,
        estado: EstadoPago.PENDIENTE,
        reporte: vigente,
        checkoutUrl,
      });

      await manager.save(Pago, pago);

      return {
        mensaje: 'Pago de Alerta Turbo creado correctamente.',
        reutilizado: false,
        pago: {
          id: pago.id,
          referencia: pago.referencia,
          concepto: pago.concepto,
          montoCentavos: pago.montoCentavos,
          moneda: pago.moneda,
          estado: pago.estado,
          reporteId,
        },
        checkout,
        checkoutUrl,
      };
    });
  }

  permiteReintento(pago: Pago): boolean {
    return [EstadoPago.RECHAZADO, EstadoPago.ANULADO, EstadoPago.ERROR, EstadoPago.EXPIRADO].includes(pago.estado) &&
      !!pago.wompiTransactionId;
  }

  puedeContinuarCheckout(pago: Pago): pago is Pago & { checkoutUrl: string } {
    return [EstadoPago.PENDIENTE, EstadoPago.EXPIRADO].includes(pago.estado) &&
      !pago.wompiTransactionId && !!pago.checkoutUrl;
  }

  private referenciasDeOperacion(referencia: string) {
    const original = referenciaOriginalPago(referencia);
    return Raw(
      (column) => `(${column} = :original OR left(${column}, length(:original) + 1) = :prefijo)`,
      { original, prefijo: `${original}_` },
    );
  }

  async reconciliarAntesDeReintentar(pago: Pago): Promise<'disponible' | 'reintentar'> {
    const historial = await this.pagoRepository.find({
      where: { referencia: this.referenciasDeOperacion(pago.referencia), concepto: pago.concepto },
      order: { id: 'ASC' },
    });
    for (const anterior of historial) {
      if (anterior.id !== pago.id) await this.reconciliarReferencia(anterior);
    }
    return this.reconciliarReferencia(pago);
  }

  async verificarHistorialBloqueado(pago: Pago, manager: EntityManager): Promise<void> {
    const historial = await manager.find(Pago, {
      where: { referencia: this.referenciasDeOperacion(pago.referencia), concepto: pago.concepto },
      relations: { intentos: true },
    });
    for (const anterior of historial) {
      if (anterior.estado === EstadoPago.APROBADO ||
          anterior.intentos.some((intento) => intento.estado === EstadoIntentoPago.PENDIENTE)) {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      }
    }
  }

  private async reconciliarReferencia(pago: Pago): Promise<'disponible' | 'reintentar'> {
    if (pago.estado === EstadoPago.APROBADO) {
      throw new ConflictException('El pago anterior ya fue aprobado. Consulta el estado de tu operación.');
    }

    // La búsqueda por referencia también encuentra transacciones de las que aún no llegó el webhook.
    const idsRemotos = await this.wompiService.consultarIdsPorReferencia(pago.referencia).catch(() => {
      throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
    });
    const intentos = await this.dataSource.getRepository(IntentoPago).find({
      where: { pago: { id: pago.id } },
    });
    const ids = new Set([...idsRemotos, ...intentos.map((intento) => intento.wompiTransactionId)]);
    if (pago.wompiTransactionId) ids.add(pago.wompiTransactionId);
    if (!ids.size) return 'disponible';

    let pendiente = false;
    for (const id of ids) {
      const transaccion = await this.wompiService.consultarTransaccion(id).catch(() => {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      });
      if (transaccion.id !== id || transaccion.reference !== pago.referencia ||
          transaccion.amount_in_cents !== pago.montoCentavos || transaccion.currency !== pago.moneda) {
        throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
      }
      const resultado = await this.procesarEventoWompi(transaccion);
      if (resultado.estado === EstadoPago.APROBADO) {
        throw new ConflictException('Wompi confirmó el pago anterior. Consulta el estado de tu operación.');
      }
      const finalizado = Date.parse(transaccion.finalized_at ?? '');
      const reintentoEnWompi = transaccion.status === 'DECLINED' &&
        finalizado + 180_000 > Date.now();
      pendiente ||= !['DECLINED', 'VOIDED', 'ERROR', 'EXPIRED'].includes(transaccion.status ?? '') ||
        reintentoEnWompi || !resultado.intento;
    }

    if (pendiente) throw new ConflictException(MENSAJE_PAGO_EN_CONFIRMACION);
    return 'reintentar';
  }

  // ==========================================
  // CONSULTAR PAGO
  // ==========================================

  async consultarPago(id: number, usuarioId: number) {
    const pago = await this.pagoRepository.findOne({
      where: {
        id,
        usuario: {
          id: usuarioId,
        },
      },
      relations: {
        intentos: true,
      },
    });

    if (!pago) {
      throw new NotFoundException('No se encontró el pago.');
    }

    return pago;
  }

  // ==========================================
  // RECUPERAR TRANSACCIÓN DIRECTAMENTE DE WOMPI
  // ==========================================

  async recuperarTransaccionWompi(
    pagoId: number,
    usuarioId: number,
    transactionId: string,
  ) {
    if (
      !Number.isSafeInteger(pagoId) ||
      pagoId <= 0 ||
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      throw new BadRequestException(
        'El identificador del pago no es válido.',
      );
    }

    if (
      typeof transactionId !== 'string' ||
      !transactionId.trim() ||
      transactionId.trim().length > 100
    ) {
      throw new BadRequestException(
        'El identificador de la transacción no es válido.',
      );
    }

    const idTransaccion = transactionId.trim();

    // 1. Buscar el pago y comprobar su propietario.
    const pago = await this.pagoRepository.findOne({
      where: {
        id: pagoId,
        usuario: {
          id: usuarioId,
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(
        'No se encontró el pago o no te pertenece.',
      );
    }

    // 2. Solo permitir la recuperación de pagos Turbo.
    if (pago.concepto !== ConceptoPago.ALERTA_TURBO) {
      throw new BadRequestException(
        'Este pago no corresponde a una Alerta Turbo.',
      );
    }

    // 3. Consultar la transacción real en Wompi.
    const transaccion =
      await this.wompiService.consultarTransaccion(
        idTransaccion,
      );

    // 4. Comprobar la identidad de la transacción.
    if (
      transaccion.id !== idTransaccion ||
      typeof transaccion.reference !== 'string' ||
      transaccion.reference !== pago.referencia
    ) {
      throw new BadRequestException(
        'La transacción de Wompi no corresponde a este pago.',
      );
    }

    // 5. Comprobar monto y moneda.
    if (
      !Number.isSafeInteger(transaccion.amount_in_cents) ||
      transaccion.amount_in_cents !== pago.montoCentavos ||
      transaccion.currency !== pago.moneda ||
      transaccion.currency !== 'COP'
    ) {
      throw new BadRequestException(
        'El monto o la moneda de Wompi no coinciden con el pago registrado.',
      );
    }

    // 6. Comprobar el estado informado por Wompi.
    const estadosPermitidos = [
      'PENDING',
      'PENDING_PAYMENT',
      'APPROVED',
      'DECLINED',
      'ERROR',
      'VOIDED',
      'EXPIRED',
    ];

    if (
      typeof transaccion.status !== 'string' ||
      !estadosPermitidos.includes(transaccion.status)
    ) {
      throw new BadRequestException(
        'Wompi devolvió un estado de transacción no reconocido.',
      );
    }

    // 7. Verificar que el identificador no pertenezca
    // a otro pago del historial.
    const intentoExistente =
      await this.dataSource
        .getRepository(IntentoPago)
        .findOne({
          where: {
            wompiTransactionId: idTransaccion,
          },
          relations: {
            pago: true,
          },
        });

    if (
      intentoExistente &&
      intentoExistente.pago.id !== pago.id
    ) {
      throw new ConflictException(
        'Esta transacción ya está asociada a otro pago.',
      );
    }

    // 8. Procesar usando el mismo mecanismo del webhook.
    const resultado = await this.procesarEventoWompi(transaccion);

    // 9. Comprobar que el procesamiento realmente haya
    // encontrado y actualizado el pago.
    if (
      !resultado ||
      resultado.recibido !== true ||
      resultado.referencia !== pago.referencia
    ) {
      throw new ConflictException(
        'No fue posible confirmar el procesamiento de la transacción.',
      );
    }

    return {
      mensaje: 'Consulta de recuperación procesada.',
      transaccionId: idTransaccion,
      referencia: pago.referencia,
      estado: resultado.estado ?? pago.estado,
      resultado,
    };
  }

  // ==========================================
  // PROCESAR EVENTOS Y TRANSACCIONES DE WOMPI
  // ==========================================

  async procesarEventoWompi(transaccion: any) {
    const referencia = transaccion?.reference;
    const transactionId = transaccion?.id;

    if (
      typeof referencia !== 'string' ||
      !referencia.trim() ||
      typeof transactionId !== 'string' ||
      !transactionId.trim()
    ) {
      return {
        recibido: true,
        mensaje:
          'La transacción no contiene una referencia o identificador válido.',
      };
    }

    if (
      !Number.isSafeInteger(transaccion.amount_in_cents) ||
      transaccion.amount_in_cents <= 0 ||
      typeof transaccion.currency !== 'string' ||
      !/^[A-Z]{3}$/.test(transaccion.currency)
    ) {
      return {
        recibido: true,
        mensaje: 'Los datos del monto o moneda no son válidos.',
      };
    }

    let estadoRecibido: EstadoIntentoPago;

    switch (transaccion.status) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        estadoRecibido = EstadoIntentoPago.PENDIENTE;
        break;

      case 'APPROVED':
        estadoRecibido = EstadoIntentoPago.APROBADO;
        break;

      case 'DECLINED':
        estadoRecibido = EstadoIntentoPago.RECHAZADO;
        break;

      case 'EXPIRED':
        estadoRecibido = EstadoIntentoPago.EXPIRADO;
        break;

      case 'ERROR':
        estadoRecibido = EstadoIntentoPago.ERROR;
        break;

      case 'VOIDED':
        estadoRecibido = EstadoIntentoPago.ANULADO;
        break;

      default:
        return {
          recibido: true,
          mensaje: 'Estado de transacción no reconocido.',
        };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const referenciaOriginal = referenciaOriginalPago(referencia);
      // En reservas, mantener el mismo orden de bloqueo que al liberar
      // vencimientos y crear cupos: jornada antes que pago.
      const jornadasBloqueadas: { id: number }[] = await queryRunner.manager.query(
        `SELECT jornada.id
         FROM jornadas jornada
         JOIN reservas_jornadas reserva ON reserva.jornada_id = jornada.id
         JOIN pagos pago ON pago.referencia = $1 AND pago.concepto = $2
         WHERE reserva.pago_id = pago.id OR reserva.referencia_pago = $3
         FOR UPDATE OF jornada`,
        [referencia, ConceptoPago.APARTADO_RESERVA, referenciaOriginal],
      );

      if (!jornadasBloqueadas.length) {
        await queryRunner.manager.query(
          `SELECT reporte.id FROM reportes reporte
           JOIN pagos pago ON pago.reporte_id = reporte.id
           WHERE pago.referencia = $1 AND pago.concepto = $2
           FOR UPDATE OF reporte`,
          [referencia, ConceptoPago.ALERTA_TURBO],
        );
      }

      // Los eventos y la emisión de otro checkout comparten el bloqueo de la operación.
      const pagosBloqueados = await queryRunner.manager.query(
        `SELECT id, reporte_id
         FROM pagos
         WHERE referencia = $1
         FOR UPDATE`,
        [referencia],
      );

      if (!pagosBloqueados.length) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'No se encontró un pago asociado a la referencia.',
        };
      }

      const pagoId = Number(pagosBloqueados[0].id);

      const reporteId = pagosBloqueados[0].reporte_id
        ? Number(pagosBloqueados[0].reporte_id)
        : null;

      const pago = await queryRunner.manager.findOne(Pago, {
        where: { id: pagoId },
        relations: { usuario: true },
      });

      if (!pago) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'No se encontró el pago.',
        };
      }

      // Verificar el valor esperado antes de guardar cualquier intento.
      if (
        transaccion.amount_in_cents !== pago.montoCentavos ||
        transaccion.currency !== pago.moneda
      ) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'Los datos de la transacción no coinciden.',
        };
      }

      const aprobacionesOtrasReferencias: { id: number }[] =
        await queryRunner.manager.query(
          `SELECT id FROM pagos WHERE estado = $1 AND id <> $2
           AND (referencia = $3 OR left(referencia, length($3) + 1) = $3 || '_')`,
          [EstadoPago.APROBADO, pago.id, referenciaOriginal],
        );

      const pagoYaEstabaAprobado =
        pago.estado === EstadoPago.APROBADO;

      // Buscar el identificador de transacción en todo el historial.
      let intento = await queryRunner.manager.findOne(IntentoPago, {
        where: {
          wompiTransactionId: transactionId,
        },
        relations: {
          pago: true,
        },
      });

      // Un identificador de Wompi no puede pertenecer a dos pagos.
      if (intento && intento.pago?.id !== pago.id) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'La transacción ya está asociada a otro pago.',
        };
      }

      const metodoPago =
        typeof transaccion.payment_method_type === 'string'
          ? transaccion.payment_method_type
          : null;

      // Consultar si ya existía una aprobación antes del evento actual.
      const aprobacionAnterior =
        await queryRunner.manager.findOne(IntentoPago, {
          where: {
            pago: {
              id: pago.id,
            },
            estado: EstadoIntentoPago.APROBADO,
          },
        });

      const yaExistiaIntentoAprobado = !!aprobacionAnterior;

      const intentoYaAprobado = intento?.estado === EstadoIntentoPago.APROBADO;

      // Registrar una transacción nueva, aunque el pago ya esté aprobado.
      if (!intento) {
        intento = queryRunner.manager.create(IntentoPago, {
          pago,
          wompiTransactionId: transactionId,
          estado: estadoRecibido,
          montoCentavos: transaccion.amount_in_cents,
          moneda: transaccion.currency,
          metodoPago,
        });
      } else {
        // Una aprobación tardía prevalece. Un evento pendiente o terminal atrasado no la revierte.
        if (intento.estado === EstadoIntentoPago.PENDIENTE || estadoRecibido === EstadoIntentoPago.APROBADO) {
          intento.estado = estadoRecibido;
        }

        intento.montoCentavos = transaccion.amount_in_cents;
        intento.moneda = transaccion.currency;
        intento.metodoPago = metodoPago ?? intento.metodoPago;
      }

      await queryRunner.manager.save(IntentoPago, intento);

      // Consultar el historial completo después de registrar el evento.
      const intentos = await queryRunner.manager.find(IntentoPago, {
        where: {
          pago: {
            id: pago.id,
          },
        },
        order: {
          creadoEn: 'DESC',
          id: 'DESC',
        },
      });

      const intentosAprobados = intentos.filter(
        (item) => item.estado === EstadoIntentoPago.APROBADO,
      );

      const existePendiente = intentos.some(
        (item) => item.estado === EstadoIntentoPago.PENDIENTE,
      );

      // Dos identificadores distintos aprobados para el mismo pago
      // requieren revisión por posible cobro duplicado.
      const cantidadAprobadas = intentosAprobados.length + aprobacionesOtrasReferencias.length;
      const requiereRevision = intentosAprobados.length > 0 && cantidadAprobadas > 1;

      let nuevoEstado: EstadoPago;

      // Un pago aprobado nunca puede retroceder.
      if (
        pagoYaEstabaAprobado ||
        intentosAprobados.length > 0
      ) {
        nuevoEstado = EstadoPago.APROBADO;
      } else if (existePendiente) {
        nuevoEstado = EstadoPago.PENDIENTE;
      } else {
        const ultimoIntento = intentos[0];

        switch (ultimoIntento?.estado) {
          case EstadoIntentoPago.RECHAZADO:
            nuevoEstado = EstadoPago.RECHAZADO;
            break;

          case EstadoIntentoPago.ANULADO:
            nuevoEstado = EstadoPago.ANULADO;
            break;

          case EstadoIntentoPago.EXPIRADO:
            nuevoEstado = EstadoPago.EXPIRADO;
            break;

          case EstadoIntentoPago.ERROR:
            nuevoEstado = EstadoPago.ERROR;
            break;

          default:
            nuevoEstado = EstadoPago.PENDIENTE;
            break;
        }
      }

      pago.estado = nuevoEstado;

      // Conservar la primera transacción aprobada como referencia
      // principal del pago, sin sobrescribirla por otra aprobación.
      if (intentosAprobados.length > 0) {
        const primeraAprobacion = [...intentosAprobados].sort(
          (a, b) => a.id - b.id,
        )[0];

        if (!pagoYaEstabaAprobado || !pago.wompiTransactionId) {
          pago.wompiTransactionId =
            primeraAprobacion.wompiTransactionId;
        }
      } else if (
        nuevoEstado !== EstadoPago.APROBADO &&
        intentos[0]
      ) {
        pago.wompiTransactionId =
          intentos[0].wompiTransactionId;
      }

      await queryRunner.manager.save(Pago, pago);

      let reservaEnRevision = false;
      let reservaId: number | undefined;
      if (pago.concepto === ConceptoPago.APARTADO_RESERVA) {
        const jornadaId = jornadasBloqueadas[0]?.id;
        const reserva = jornadaId
          ? await queryRunner.manager.findOne(ReservaJornada, {
              where: [
                { pago: { id: pago.id }, jornada: { id: jornadaId } },
                { referenciaPago: referenciaOriginal, jornada: { id: jornadaId } },
              ],
              relations: { jornada: true, pago: true },
            })
          : null;

        if (reserva) {
          reservaId = reserva.id;
          const jornada = reserva.jornada;
          const ahora = new Date();
          const retieneCupo = reserva.estado === EstadoReservaJornada.PENDIENTE;
          const jornadaAbierta = jornada.activa && jornada.fechaFin > ahora;
          const reservaVigente = reserva.expiraEn > ahora;

          if (
            nuevoEstado === EstadoPago.APROBADO &&
            !pagoYaEstabaAprobado &&
            !yaExistiaIntentoAprobado &&
            !aprobacionesOtrasReferencias.length &&
            reserva.estado !== EstadoReservaJornada.CONFIRMADA
          ) {
            const puedeUsarCupoRetenido = retieneCupo && (reservaVigente || jornadaAbierta);
            const puedeRecuperarCupo =
              (reserva.estado === EstadoReservaJornada.EXPIRADA ||
                reserva.estado === EstadoReservaJornada.RECHAZADA) &&
              jornadaAbierta &&
              jornada.cuposDisponibles > 0;

            const otraReservaConfirmada = await queryRunner.manager.exists(ReservaJornada, {
              where: {
                jornada: { id: jornada.id },
                usuario: { id: pago.usuario.id },
                estado: EstadoReservaJornada.CONFIRMADA,
              },
            });
            reserva.pago = pago;
            reserva.referenciaPago = referenciaOriginal;
            if (!otraReservaConfirmada && (puedeUsarCupoRetenido || puedeRecuperarCupo)) {
              if (puedeRecuperarCupo) {
                jornada.cuposDisponibles -= 1;
                await queryRunner.manager.save(Jornada, jornada);
              }
              reserva.estado = EstadoReservaJornada.CONFIRMADA;
              reserva.confirmadaEn = ahora;
              await queryRunner.manager.save(ReservaJornada, reserva);
            } else if (retieneCupo) {
              await this.liberarCupo(queryRunner.manager, reserva, EstadoReservaJornada.EXPIRADA);
            } else {
              await queryRunner.manager.save(ReservaJornada, reserva);
            }
          } else if (
            retieneCupo && reserva.pago?.id === pago.id &&
            [EstadoPago.RECHAZADO, EstadoPago.ANULADO, EstadoPago.ERROR, EstadoPago.EXPIRADO].includes(nuevoEstado)
          ) {
            await this.liberarCupo(
              queryRunner.manager, reserva,
              nuevoEstado === EstadoPago.EXPIRADO ? EstadoReservaJornada.EXPIRADA : EstadoReservaJornada.RECHAZADA,
            );
          }
        }

        reservaEnRevision =
          nuevoEstado === EstadoPago.APROBADO &&
          reserva?.estado !== EstadoReservaJornada.CONFIRMADA;
      }

      // Turbo solo se activa en la primera aprobación del pago.

      // Turbo solo se activa en la primera aprobación del pago.
      // Una segunda transacción aprobada no extiende su duración.
      const esPrimeraAprobacion =
        nuevoEstado === EstadoPago.APROBADO &&
        !pagoYaEstabaAprobado &&
        !yaExistiaIntentoAprobado &&
        !aprobacionesOtrasReferencias.length;

      if (
        esPrimeraAprobacion &&
        pago.concepto === ConceptoPago.ALERTA_TURBO &&
        reporteId !== null
      ) {
        const reportesBloqueados = await queryRunner.manager.query(
          `SELECT id
           FROM reportes
           WHERE id = $1
           FOR UPDATE`,
          [reporteId],
        );

        if (reportesBloqueados.length) {
          const reporte = await queryRunner.manager.findOne(Reporte, {
            where: { id: reporteId },
            relations: { usuario: true },
          });

          if (reporte && !(reporte.esTurbo && reporte.turboVenceEn && reporte.turboVenceEn > new Date())) {
            const fechaActivacion = new Date();
            const fechaVencimiento = new Date(fechaActivacion);
            fechaVencimiento.setDate(
              fechaVencimiento.getDate() + DURACION_TURBO_DIAS,
            );

            // 1. Activar Alerta Turbo por 7 días
            reporte.esTurbo = true;
            reporte.turboActivadaEn = fechaActivacion;
            reporte.turboVenceEn = fechaVencimiento;

            // 2. NO publicar automáticamente: el reporte permanece como borrador/pendiente
            // hasta que el usuario presione el botón "Publicar reporte", tras lo cual
            // quedará pendiente de aprobación por el administrador.
            reporte.estado = EstadoReporte.PENDIENTE;
            reporte.estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;

            await queryRunner.manager.save(Reporte, reporte);

            // 3. Generar notificación informativa para el administrador
            const usuarioNombre =
              reporte.usuario?.nombre ||
              pago.usuario?.nombre ||
              'Ciudadano VeciPets';

            await this.notificacionesService.registrarNotificacionPagoTurbo({
              titulo: 'Nuevo pago de Alerta Turbo',
              usuarioNombre,
              reporteId: reporte.id,
              monto: '$15.000 COP',
              referencia: pago.referencia,
              fechaPago: fechaActivacion,
              estado: 'Aprobado',
              enlaceReporte: `/reportes/${reporte.id}`,
            });
          }
        }
      }

      await queryRunner.commitTransaction();

      if (requiereRevision && !intentoYaAprobado) {
        this.logger.warn({
          mensaje: 'Cobro duplicado pendiente de revisión administrativa',
          referenciaOriginal,
          referencia,
          transactionId,
          concepto: pago.concepto,
        });
      }

      if (requiereRevision && estadoRecibido === EstadoIntentoPago.APROBADO) {
        await this.notificacionesService.registrarNotificacionPagoTurbo({
          clave: `cobro-duplicado:${referenciaOriginal}`,
          titulo: 'Cobro duplicado para revisión',
          usuarioNombre: pago.usuario.nombre,
          reporteId,
          reservaId,
          monto: `${(pago.montoCentavos / 100).toLocaleString('es-CO')} ${pago.moneda}`,
          referencia,
          fechaPago: new Date(),
          estado: 'En revisión',
          enlaceReporte: reporteId ? `/reportes/${reporteId}` : '/jornadas',
        });
      }

      return {
        recibido: true,
        mensaje: requiereRevision
          ? 'Se detectaron varias transacciones aprobadas para el mismo pago. Se requiere revisión.'
          : reservaEnRevision
            ? MENSAJE_RESERVA_EN_REVISION
            : nuevoEstado === EstadoPago.APROBADO
            ? 'Pago aprobado y procesado correctamente.'
            : 'Historial de intento actualizado correctamente.',
        referencia: pago.referencia,
        estado: pago.estado,
        requiereRevision: requiereRevision || reservaEnRevision,
        cantidadTransaccionesAprobadas: cantidadAprobadas,
        intento: {
          id: intento.id,
          wompiTransactionId: intento.wompiTransactionId,
          estado: intento.estado,
        },
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async liberarCupo(
    manager: EntityManager,
    reserva: ReservaJornada,
    estado: EstadoReservaJornada.EXPIRADA | EstadoReservaJornada.RECHAZADA,
  ) {
    const jornada = reserva.jornada;
    if (jornada.cuposDisponibles < jornada.cuposTotales) {
      jornada.cuposDisponibles += 1;
      await manager.save(Jornada, jornada);
    }
    reserva.estado = estado;
    await manager.save(ReservaJornada, reserva);
  }

  // ==========================================
  // CONSULTAR PAGO ASOCIADO A UN REPORTE
  // ==========================================

  async consultarPagoPorReporte(usuarioId: number, reporteId: number): Promise<Pago | null> {
    const ultimo = await this.buscarUltimoPagoTurbo(usuarioId, reporteId);
    if (!ultimo || ultimo.estado === EstadoPago.APROBADO) return ultimo;
    return (await this.pagoRepository.findOne({
      where: {
        referencia: this.referenciasDeOperacion(ultimo.referencia),
        concepto: ConceptoPago.ALERTA_TURBO,
        estado: EstadoPago.APROBADO,
      },
      order: { id: 'ASC' },
      relations: { reporte: true },
    })) ?? ultimo;
  }

  private buscarUltimoPagoTurbo(usuarioId: number, reporteId: number, manager = this.dataSource.manager) {
    return manager.findOne(Pago, {
      where: {
        reporte: { id: reporteId },
        usuario: { id: usuarioId },
        concepto: ConceptoPago.ALERTA_TURBO,
      },
      order: { id: 'DESC' },
      relations: { reporte: true },
    });
  }

  // ==========================================
  // VERIFICAR TRANSACCIÓN (WOMPI REDIRECT O RECARGA)
  // ==========================================

  async verificarTransaccion(
    usuarioId: number,
    dto: { transactionId?: string; reporteId?: number },
  ) {
    const { transactionId, reporteId } = dto;

    // Caso 1: Se recibió identificador de transacción desde Wompi
    if (transactionId && typeof transactionId === 'string' && transactionId.trim()) {
      const idTx = transactionId.trim();

      // Consultar directamente a Wompi la transacción real
      const transaccion = await this.wompiService.consultarTransaccion(idTx);

      if (!transaccion || !transaccion.reference) {
        throw new BadRequestException('Transacción no válida en Wompi.');
      }

      // Buscar el pago por referencia única
      const pago = await this.pagoRepository.findOne({
        where: { referencia: transaccion.reference },
        relations: { reporte: true, usuario: true },
      });

      if (!pago) {
        throw new NotFoundException('No se encontró el pago asociado a la transacción.');
      }

      if (pago.usuario.id !== usuarioId) {
        throw new ForbiddenException('No tienes permiso para verificar este pago.');
      }

      // Procesar e idempotentemente actualizar estado
      const resultado = await this.procesarEventoWompi(transaccion);
      if (!resultado.intento) throw new BadRequestException('Wompi devolvió datos que no coinciden con el pago.');

      const pagoActualizado = await this.pagoRepository.findOne({
        where: { id: pago.id },
        relations: { reporte: true },
      });

      const aprobado = pagoActualizado?.estado === EstadoPago.APROBADO;

      let reservaInfo: {
        id: number;
        codigo: string;
        nombrePropietario: string;
        nombreMascota: string;
        estado: EstadoReservaJornada;
        precioProcedimientoCentavos: number;
        precioApartadoCentavos: number;
        saldoPendienteCentavos: number;
        jornadaTitulo?: string;
        veterinaria?: string;
        direccion?: string;
        fechaTexto?: string;
        horaTexto?: string;
      } | null = null;
      if (pago.concepto === ConceptoPago.APARTADO_RESERVA) {
        const reserva = await this.dataSource.getRepository(ReservaJornada).findOne({
          where: [{ pago: { id: pago.id } }, { referenciaPago: referenciaOriginalPago(pago.referencia) }],
          relations: { jornada: true, pago: true },
        });
        if (reserva) {
          reservaInfo = {
            id: reserva.id,
            codigo: reserva.codigo,
            nombrePropietario: reserva.nombrePropietario,
            nombreMascota: reserva.nombreMascota,
            estado: reserva.estado,
            precioProcedimientoCentavos:
              reserva.precioProcedimientoHistoricoCentavos,
            precioApartadoCentavos:
              reserva.precioApartadoHistoricoCentavos,
            saldoPendienteCentavos: Math.max(
              0,
              reserva.precioProcedimientoHistoricoCentavos -
                reserva.precioApartadoHistoricoCentavos,
            ),
            jornadaTitulo: reserva.jornada?.titulo,
            veterinaria: reserva.jornada?.veterinaria,
            direccion: reserva.jornada?.direccion,
            fechaTexto: reserva.jornada?.fechaTexto,
            horaTexto: reserva.jornada?.horaTexto,
          };
        }
      }

      const esApartado = pago.concepto === ConceptoPago.APARTADO_RESERVA;
      const requiereRevision = esApartado && aprobado &&
        reservaInfo?.estado !== EstadoReservaJornada.CONFIRMADA;

      return {
        aprobado,
        ...((esApartado || resultado.requiereRevision) && { requiereRevision: requiereRevision || resultado.requiereRevision }),
        estado: pagoActualizado?.estado ?? EstadoPago.PENDIENTE,
        concepto: pago.concepto,
        mensaje: aprobado
          ? (pago.concepto === ConceptoPago.APARTADO_RESERVA
              ? (requiereRevision
                  ? MENSAJE_RESERVA_EN_REVISION
                  : '¡Tu cupo ha sido reservado exitosamente!')
              : 'Pago aprobado. Alerta Turbo activada para este reporte')
          : `El pago se encuentra en estado ${pagoActualizado?.estado}.`,
        reporteId: pagoActualizado?.reporte?.id,
        reserva: reservaInfo,
        pagoId: pago.id,
        referencia: pago.referencia,
        montoCentavos: pago.montoCentavos,
      };
    }

    // Caso 2: Se recibió reporteId (recarga del formulario /reportar)
    if (reporteId && Number.isSafeInteger(Number(reporteId))) {
      const repId = Number(reporteId);
      const pago = await this.consultarPagoPorReporte(usuarioId, repId);

      if (!pago) {
        return {
          aprobado: false,
          estado: 'NO_INICIADO',
          mensaje: 'No hay pago de Alerta Turbo registrado para este reporte.',
          reporteId: repId,
        };
      }

      const aprobado = pago.estado === EstadoPago.APROBADO;

      return {
        aprobado,
        estado: pago.estado,
        mensaje: aprobado
          ? 'Pago aprobado. Alerta Turbo activada para este reporte'
          : `El pago se encuentra en estado ${pago.estado}.`,
        reporteId: pago.reporte?.id,
        pagoId: pago.id,
        referencia: pago.referencia,
      };
    }

    throw new BadRequestException('Debes proporcionar transactionId o reporteId para verificar.');
  }
}
