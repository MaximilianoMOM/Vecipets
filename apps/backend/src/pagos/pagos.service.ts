
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Pago, EstadoPago, ConceptoPago } from './pago.entity';
import {
  Reporte,
  EstadoAprobacionReporte,
  EstadoReporte,
} from '../reportes/reporte.entity';

import { WompiService } from './wompi.service';
import { ConfigService } from '@nestjs/config';

const PRECIO_TURBO_CENTAVOS = 1500000;
const DURACION_TURBO_DIAS = 7;

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

    // Si una alerta anterior ya venció, limpiamos sus fechas.
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
      usuarioId,
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

      if (codigo === '23505') {
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
      where: { id, usuarioId },
    });

    if (!pago) {
      throw new NotFoundException('No se encontró el pago.');
    }

    return pago;
  }

  async procesarEventoWompi(transaccion: any) {
    const referencia = transaccion?.reference;

    if (!referencia) {
      return {
        recibido: true,
        mensaje: 'El evento no contiene una referencia.',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Bloqueamos el pago para evitar procesamientos simultáneos.
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

      // Un pago aprobado nunca vuelve a procesarse ni extiende Turbo.
      if (pago.estado === EstadoPago.APROBADO) {
        await queryRunner.commitTransaction();

        return {
          recibido: true,
          mensaje: 'El pago ya se encuentra aprobado.',
        };
      }

      let nuevoEstado: EstadoPago;

      switch (transaccion.status) {
        case 'APPROVED':
          nuevoEstado = EstadoPago.APROBADO;
          break;

        case 'DECLINED':
        case 'ERROR':
        case 'VOIDED':
          nuevoEstado = EstadoPago.RECHAZADO;
          break;

        case 'PENDING':
        case 'PENDING_PAYMENT':
          nuevoEstado = EstadoPago.PENDIENTE;
          break;

        default:
          await queryRunner.commitTransaction();

          return {
            recibido: true,
            mensaje: 'Estado de transacción no reconocido.',
          };
      }

      pago.estado = nuevoEstado;

      if (transaccion.id) {
        pago.wompiTransactionId = String(transaccion.id);
      }

      await queryRunner.manager.save(Pago, pago);

      // Solo un pago Turbo aprobado puede activar una alerta.
      if (
        nuevoEstado === EstadoPago.APROBADO &&
        pago.concepto === ConceptoPago.ALERTA_TURBO &&
        reporteId !== null
      ) {
        // Bloqueamos el reporte para proteger su estado.
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

      await queryRunner.commitTransaction();

      return {
        recibido: true,
        mensaje:
          nuevoEstado === EstadoPago.APROBADO
            ? 'Pago aprobado y procesado correctamente.'
            : 'Estado del pago actualizado.',
        referencia: pago.referencia,
        estado: pago.estado,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
