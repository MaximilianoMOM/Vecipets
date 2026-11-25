
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

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

import { WompiService } from './wompi.service';
import { ConfigService } from '@nestjs/config';

const PRECIO_TURBO_CENTAVOS = 1500000;
const DURACION_TURBO_DIAS = 7;

const INDICE_PAGO_TURBO_PENDIENTE =
  'uq_pagos_turbo_pendiente_reporte';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(IntentoPago)
    private readonly intentoPagoRepository: Repository<IntentoPago>,

    private readonly wompiService: WompiService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

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
      reporte.estadoAprobacion !== EstadoAprobacionReporte.APROBADO ||
      reporte.estado !== EstadoReporte.PUBLICO
    ) {
      throw new BadRequestException(
        'Solo puedes activar Turbo en reportes aprobados y públicos.',
      );
    }

    const ahora = new Date();

    if (
      reporte.esTurbo &&
      reporte.turboVenceEn &&
      reporte.turboVenceEn > ahora
    ) {
      throw new ConflictException(
        'Este reporte ya tiene una Alerta Turbo activa.',
      );
    }

    if (reporte.esTurbo) {
      reporte.esTurbo = false;
      reporte.turboActivadaEn = null;
      reporte.turboVenceEn = null;

      await this.reporteRepository.save(reporte);
    }

    const referencia = this.wompiService.generarReferencia();
    const moneda = 'COP';
    const montoCentavos = PRECIO_TURBO_CENTAVOS;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:3000';

    const checkout = this.wompiService.obtenerDatosCheckout(
      referencia,
      montoCentavos,
      moneda,
      `${frontendUrl}/pagos/resultado`,
    );

    const parametros = new URLSearchParams({
      'public-key': checkout.publicKey,
      currency: checkout.currency,
      'amount-in-cents': String(checkout.amountInCents),
      reference: checkout.reference,
      'signature:integrity': checkout.signature.integrity,
      'redirect-url': checkout.redirectUrl,
    });

    const queryString = parametros
      .toString()
      .replace('signature%3Aintegrity', 'signature:integrity');

    const checkoutUrl =
      `${this.wompiService.obtenerUrlCheckout()}?${queryString}`;

    const pago = this.pagoRepository.create({
      usuario: { id: usuarioId },
      referencia,
      montoCentavos,
      moneda,
      concepto: ConceptoPago.ALERTA_TURBO,
      estado: EstadoPago.PENDIENTE,
      reporte,
      checkoutUrl,
    });

    try {
      await this.pagoRepository.save(pago);
    } catch (error: any) {
      const codigo = error?.code ?? error?.driverError?.code;

      const restriccion =
        error?.constraint ?? error?.driverError?.constraint;

      if (
        codigo === '23505' &&
        restriccion === INDICE_PAGO_TURBO_PENDIENTE
      ) {
        throw new ConflictException(
          'Ya existe un pago Turbo pendiente para este reporte.',
        );
      }

      throw error;
    }

    return {
      mensaje: 'Pago de Alerta Turbo creado correctamente.',
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
  }

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
      // Bloquear el pago para evitar procesamientos simultáneos.
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
      });

      if (!pago) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'No se encontró el pago.',
        };
      }

      // Verificar monto y moneda antes de registrar el intento.
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

      // Un pago aprobado nunca puede retroceder.
      if (pago.estado === EstadoPago.APROBADO) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'El pago ya se encuentra aprobado.',
          referencia: pago.referencia,
          estado: pago.estado,
        };
      }

      // Buscar el intento y cargar su relación con el pago.
      let intento = await queryRunner.manager.findOne(IntentoPago, {
        where: {
          wompiTransactionId: transactionId,
        },
        relations: {
          pago: true,
        },
      });

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

      // Crear un intento nuevo si Wompi envía una transacción nueva.
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
        // Un intento terminal no puede retroceder.
        // Solo los intentos pendientes pueden cambiar de estado.
        if (intento.estado === EstadoIntentoPago.PENDIENTE) {
          intento.estado = estadoRecibido;
        }

        intento.montoCentavos = transaccion.amount_in_cents;
        intento.moneda = transaccion.currency;
        intento.metodoPago = metodoPago ?? intento.metodoPago;
      }

      await queryRunner.manager.save(IntentoPago, intento);

      // Consultar todos los intentos del pago.
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

      const intentoAprobado = intentos.find(
        (item) => item.estado === EstadoIntentoPago.APROBADO,
      );

      const existePendiente = intentos.some(
        (item) => item.estado === EstadoIntentoPago.PENDIENTE,
      );

      let nuevoEstado: EstadoPago;

      // Un intento aprobado tiene prioridad sobre todos los demás.
      if (intentoAprobado) {
        nuevoEstado = EstadoPago.APROBADO;
      } else if (existePendiente) {
        nuevoEstado = EstadoPago.PENDIENTE;
      } else {
        // Si todos son definitivos, se toma el intento más reciente.
        const ultimoIntento = intentos[0];

        switch (ultimoIntento?.estado) {
          case EstadoIntentoPago.RECHAZADO:
            nuevoEstado = EstadoPago.RECHAZADO;
            break;

          case EstadoIntentoPago.ANULADO:
            nuevoEstado = EstadoPago.ANULADO;
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

      // Guardar la transacción aprobada o la más reciente.
      if (intentoAprobado) {
        pago.wompiTransactionId =
          intentoAprobado.wompiTransactionId;
      } else if (intentos[0]) {
        pago.wompiTransactionId =
          intentos[0].wompiTransactionId;
      }

      await queryRunner.manager.save(Pago, pago);

      // Activar Turbo únicamente con un pago aprobado.
      if (
        nuevoEstado === EstadoPago.APROBADO &&
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
          });

          if (
            reporte &&
            reporte.estadoAprobacion === EstadoAprobacionReporte.APROBADO &&
            reporte.estado === EstadoReporte.PUBLICO
          ) {
            const fechaActivacion = new Date();

            const turboActivo =
              reporte.esTurbo &&
              reporte.turboVenceEn !== null &&
              reporte.turboVenceEn > fechaActivacion;

            // No extender una Turbo que todavía está activa.
            // Si ya venció, una nueva compra aprobada puede reactivarla.
            if (!turboActivo) {
              const fechaVencimiento = new Date(fechaActivacion);

              fechaVencimiento.setDate(
                fechaVencimiento.getDate() + DURACION_TURBO_DIAS,
              );

              reporte.esTurbo = true;
              reporte.turboActivadaEn = fechaActivacion;
              reporte.turboVenceEn = fechaVencimiento;

              await queryRunner.manager.save(Reporte, reporte);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      return {
        recibido: true,
        mensaje:
          nuevoEstado === EstadoPago.APROBADO
            ? 'Pago aprobado y procesado correctamente.'
            : 'Historial de intento actualizado correctamente.',
        referencia: pago.referencia,
        estado: pago.estado,
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
}
