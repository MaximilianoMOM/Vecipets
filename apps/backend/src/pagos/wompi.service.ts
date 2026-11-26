
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  createHash,
  randomUUID,
  timingSafeEqual,
} from 'crypto';

type AmbienteWompi = 'sandbox' | 'production';

interface RespuestaTransaccionWompi {
  data?: {
    id?: string;
    reference?: string;
    status?: string;
    amount_in_cents?: number;
    currency?: string;
    payment_method_type?: string;
    finalized_at?: string;
    [key: string]: any;
  };
}

@Injectable()
export class WompiService {
  private readonly ambiente: AmbienteWompi;

  constructor(private readonly configService: ConfigService) {
    const ambiente = this.configService
      .get<string>('WOMPI_ENVIRONMENT')
      ?.trim()
      .toLowerCase();

    if (ambiente !== 'sandbox' && ambiente !== 'production') {
      throw new InternalServerErrorException(
        'WOMPI_ENVIRONMENT debe ser sandbox o production.',
      );
    }

    this.ambiente = ambiente;
  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  private obtenerConfiguracion(nombre: string): string {
    const prefijo =
      this.ambiente === 'sandbox'
        ? 'WOMPI_SANDBOX'
        : 'WOMPI_PROD';

    const variable = `${prefijo}_${nombre}`;

    const valor = this.configService
      .get<string>(variable)
      ?.trim();

    if (!valor) {
      throw new InternalServerErrorException(
        `Falta configurar ${variable}.`,
      );
    }

    return valor;
  }

  private get publicKey(): string {
    return this.obtenerConfiguracion('PUBLIC_KEY');
  }

  private get privateKey(): string {
    return this.obtenerConfiguracion('PRIVATE_KEY');
  }

  private get integritySecret(): string {
    return this.obtenerConfiguracion('INTEGRITY_SECRET');
  }

  private get eventsSecret(): string {
    return this.obtenerConfiguracion('EVENTS_SECRET');
  }

  private get apiBaseUrl(): string {
    return this.ambiente === 'sandbox'
      ? 'https://sandbox.wompi.co/v1'
      : 'https://production.wompi.co/v1';
  }

  obtenerAmbiente(): 'test' | 'prod' {
    return this.ambiente === 'sandbox' ? 'test' : 'prod';
  }

  // ==========================================
  // REFERENCIAS Y FIRMAS
  // ==========================================

  generarReferencia(referenciaOriginal?: string): string {
    if (referenciaOriginal) return `${referenciaOriginal}_${randomUUID()}`;
    return `VECIPETS-${Date.now()}-${randomUUID()}`;
  }

  generarFirma(
    referencia: string,
    montoCentavos: number,
    moneda: string,
    expiraEn = '',
  ): string {
    const cadena =
      `${referencia}${montoCentavos}${moneda}${expiraEn}${this.integritySecret}`;

    return createHash('sha256')
      .update(cadena)
      .digest('hex');
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  obtenerDatosCheckout(
    referencia: string,
    montoCentavos: number,
    moneda: string,
    urlRedireccion: string,
    expiraEn?: string,
  ) {
    return {
      publicKey: this.publicKey,
      currency: moneda,
      amountInCents: montoCentavos,
      reference: referencia,
      signature: {
        integrity: this.generarFirma(
          referencia,
          montoCentavos,
          moneda,
          expiraEn,
        ),
      },
      redirectUrl: urlRedireccion,
    };
  }

  prepararCheckout(
    referencia: string,
    montoCentavos: number,
    moneda: string,
    redirectUrl: string,
    expiraEn?: string,
  ) {
    const checkout = this.obtenerDatosCheckout(referencia, montoCentavos, moneda, redirectUrl, expiraEn);
    const parametros = new URLSearchParams({
      'public-key': checkout.publicKey,
      currency: moneda,
      'amount-in-cents': String(montoCentavos),
      reference: referencia,
      'signature:integrity': checkout.signature.integrity,
      'redirect-url': redirectUrl,
    });
    if (expiraEn) parametros.set('expiration-time', expiraEn);
    const query = parametros.toString().replace('signature%3Aintegrity', 'signature:integrity');
    return { checkout, checkoutUrl: `${this.obtenerUrlCheckout()}?${query}` };
  }

  obtenerUrlCheckout(): string {
    return 'https://checkout.wompi.co/p/';
  }

  // ==========================================
  // CONSULTAR TRANSACCIÓN EN WOMPI
  // ==========================================

  async consultarIdsPorReferencia(referencia: string): Promise<string[]> {
    const query = new URLSearchParams({ reference: referencia });
    const respuesta = await this.solicitarDatos(`/transactions?${query}`);

    const transacciones: unknown = respuesta?.data;
    if (!Array.isArray(transacciones) || transacciones.some(
      (item) => item?.reference !== referencia || typeof item.id !== 'string' || !item.id.trim(),
    )) {
      throw new InternalServerErrorException('La consulta por referencia de Wompi devolvió datos inesperados.');
    }

    return transacciones.map((item) => item.id);
  }

  async consultarTransaccion(
    transactionId: string,
  ): Promise<NonNullable<RespuestaTransaccionWompi['data']>> {
    if (
      typeof transactionId !== 'string' ||
      !transactionId.trim()
    ) {
      throw new InternalServerErrorException(
        'El identificador de la transacción no es válido.',
      );
    }

    const resultado: RespuestaTransaccionWompi = await this.solicitarDatos(
      `/transactions/${encodeURIComponent(transactionId.trim())}`,
    );

    if (
      !resultado?.data ||
      typeof resultado.data !== 'object'
    ) {
      throw new InternalServerErrorException(
        'Wompi no devolvió los datos de la transacción.',
      );
    }

    return resultado.data;
  }

  private async solicitarDatos(ruta: string) {
    let respuesta: Response;

    try {
      respuesta = await fetch(`${this.apiBaseUrl}${ruta}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new InternalServerErrorException(
        'No fue posible comunicarse con Wompi.',
      );
    }

    if (!respuesta.ok) {
      throw new InternalServerErrorException(
        `Wompi rechazó la consulta de la transacción. HTTP ${respuesta.status}.`,
      );
    }

    try {
      return await respuesta.json();
    } catch {
      throw new InternalServerErrorException('Wompi devolvió una respuesta JSON inválida.');
    }
  }

  // ==========================================
  // VALIDACIÓN DE EVENTOS WEBHOOK
  // ==========================================

  validarEvento(
    evento: any,
    checksumHeader?: string,
  ): boolean {
    try {
      // Comprobar el ambiente.
      if (
        !evento ||
        evento.environment !== this.obtenerAmbiente()
      ) {
        return false;
      }

      if (
        !evento.data ||
        typeof evento.data !== 'object' ||
        !Array.isArray(evento.signature?.properties) ||
        evento.signature.properties.length === 0 ||
        !Number.isSafeInteger(evento.timestamp) ||
        evento.timestamp <= 0
      ) {
        return false;
      }

      const valores: string[] = [];

      for (const propiedad of evento.signature.properties) {
        if (
          typeof propiedad !== 'string' ||
          propiedad.length === 0
        ) {
          return false;
        }

        const partes = propiedad.split('.');

        if (
          partes.some(
            (parte: string) =>
              !parte ||
              parte === '__proto__' ||
              parte === 'prototype' ||
              parte === 'constructor',
          )
        ) {
          return false;
        }

        const valor = partes.reduce(
          (objeto: any, clave: string) => objeto?.[clave],
          evento.data,
        );

        if (valor === undefined || valor === null) {
          return false;
        }

        valores.push(String(valor));
      }

      const cadena =
        valores.join('') +
        String(evento.timestamp) +
        this.eventsSecret;

      const checksumCalculado = createHash('sha256')
        .update(cadena)
        .digest('hex');

      const checksumRecibido =
        checksumHeader || evento.signature.checksum;

      if (
        typeof checksumRecibido !== 'string' ||
        !/^[a-fA-F0-9]{64}$/.test(checksumRecibido)
      ) {
        return false;
      }

      const calculado = Buffer.from(
        checksumCalculado,
        'hex',
      );

      const recibido = Buffer.from(
        checksumRecibido,
        'hex',
      );

      if (calculado.length !== recibido.length) {
        return false;
      }

      return timingSafeEqual(calculado, recibido);
    } catch {
      return false;
    }
  }
}
