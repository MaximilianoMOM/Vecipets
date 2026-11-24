
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

    private readonly wompiService: WompiService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
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

    // Limpiar únicamente un Turbo vencido.
    if (
      reporte.esTurbo &&
      reporte.turboVenceEn &&
      reporte.turboVenceEn <= ahora
    ) {
      reporte.esTurbo = false;
      reporte.turboActivadaEn = null;
      reporte.turboVenceEn = null;

      await this.reporteRepository.save(reporte);
    }

    // Buscar un pago Turbo pendiente antes de crear otro.
    const pagoPendiente = await this.buscarPagoTurboPendiente(
      usuarioId,
      reporteId,
    );

    if (pagoPendiente) {
      return this.respuestaPagoPendiente(
        pagoPendiente,
        reporteId,
      );
    }

    const referencia = this.wompiService.generarReferencia();
    const moneda = 'COP';
    const montoCentavos = PRECIO_TURBO_CENTAVOS;

    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:3000'
    )
      .trim()
      .replace(/\/+$/, '');

    // Redirigir a la página principal después del pago (botón "Volver al comercio" de Wompi)
    const redirectUrl = `${frontendUrl}/`;

    const checkout = this.wompiService.obtenerDatosCheckout(
      referencia,
      montoCentavos,
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

    // Siempre enviar la URL de retorno para que Wompi muestre el botón
    // "Volver al comercio" después del pago. En desarrollo con localhost
    // Wompi podría rechazarla; en producción usar un dominio real en
    // FRONTEND_URL.
    parametros.set('redirect-url', redirectUrl);

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
        const pagoExistente = await this.buscarPagoTurboPendiente(
          usuarioId,
          reporteId,
        );

        if (pagoExistente) {
          return this.respuestaPagoPendiente(
            pagoExistente,
            reporteId,
          );
        }

        throw new ConflictException(
          'Ya existe un pago Turbo pendiente para este reporte, pero no fue posible recuperarlo.',
        );
      }

      throw error;
    }

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
  }

  // ==========================================
  // BUSCAR PAGO TURBO PENDIENTE
  // ==========================================

  private async buscarPagoTurboPendiente(
    usuarioId: number,
    reporteId: number,
  ): Promise<Pago | null> {
    return this.pagoRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        reporte: { id: reporteId },
        concepto: ConceptoPago.ALERTA_TURBO,
        estado: EstadoPago.PENDIENTE,
      },
    });
  }

  // ==========================================
  // RESPUESTA DE PAGO PENDIENTE
  // ==========================================

  private async respuestaPagoPendiente(
    pago: Pago,
    reporteId: number,
  ) {
    if (!pago.checkoutUrl) {
      throw new ConflictException(
        'Existe un pago pendiente sin enlace de Wompi. Se requiere revisión.',
      );
    }

    // Mantener la URL de retorno (redirect-url) para que Wompi muestre
    // el botón "Volver al comercio" al recuperar un pago pendiente.
    // No se elimina incluso en localhost.

    return {
      mensaje: 'Se recuperó el pago Turbo pendiente.',
      reutilizado: true,
      pago: {
        id: pago.id,
        referencia: pago.referencia,
        concepto: pago.concepto,
        montoCentavos: pago.montoCentavos,
        moneda: pago.moneda,
        estado: pago.estado,
        reporteId,
      },
      checkoutUrl: pago.checkoutUrl,
    };
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
    const resultado =
      await this.procesarEventoWompi(transaccion);

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
      // Bloquear el pago para serializar los eventos de una referencia.
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
        // Un intento terminal no retrocede a pendiente ni cambia
        // de estado por eventos posteriores.
        if (intento.estado === EstadoIntentoPago.PENDIENTE) {
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
      const requiereRevision = intentosAprobados.length > 1;

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

        if (!pago.wompiTransactionId) {
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

      // Turbo solo se activa en la primera aprobación del pago.
      // Una segunda transacción aprobada no extiende su duración.
      const esPrimeraAprobacion =
        nuevoEstado === EstadoPago.APROBADO &&
        !pagoYaEstabaAprobado &&
        !yaExistiaIntentoAprobado;

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
        mensaje: requiereRevision
          ? 'Se detectaron varias transacciones aprobadas para el mismo pago. Se requiere revisión.'
          : nuevoEstado === EstadoPago.APROBADO
            ? 'Pago aprobado y procesado correctamente.'
            : 'Historial de intento actualizado correctamente.',
        referencia: pago.referencia,
        estado: pago.estado,
        requiereRevision,
        cantidadTransaccionesAprobadas: intentosAprobados.length,
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
