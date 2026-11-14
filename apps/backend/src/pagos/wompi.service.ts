
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class WompiService {
  constructor(private readonly configService: ConfigService) {}

  private get publicKey(): string {
    const key = this.configService.get<string>('WOMPI_PUBLIC_KEY');

    if (!key) {
      throw new InternalServerErrorException(
        'Falta configurar WOMPI_PUBLIC_KEY',
      );
    }

    return key;
  }

  private get integritySecret(): string {
    const secret = this.configService.get<string>(
      'WOMPI_INTEGRITY_SECRET',
    );

    if (!secret) {
      throw new InternalServerErrorException(
        'Falta configurar WOMPI_INTEGRITY_SECRET',
      );
    }

    return secret;
  }

  generarReferencia(): string {
    return `VECIPETS-${Date.now()}-${createHash('sha256')
      .update(`${Date.now()}-${Math.random()}`)
      .digest('hex')
      .slice(0, 8)}`;
  }

  generarFirma(
    referencia: string,
    montoCentavos: number,
    moneda: string,
  ): string {
    const cadena = `${referencia}${montoCentavos}${moneda}${this.integritySecret}`;

    return createHash('sha256')
      .update(cadena)
      .digest('hex');
  }

  obtenerDatosCheckout(
    referencia: string,
    montoCentavos: number,
    moneda: string,
    urlRedireccion: string,
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
        ),
      },
      redirectUrl: urlRedireccion,
    };
  }

  obtenerUrlCheckout(): string {
    return 'https://checkout.wompi.co/p/';
  }
  
  validarEvento(evento: any, checksumHeader?: string): boolean {
    const secreto = this.configService.get<string>(
      'WOMPI_EVENTS_SECRET',
    );

    if (
      !secreto ||
      !evento?.data ||
      !Array.isArray(evento?.signature?.properties) ||
      !evento?.timestamp
    ) {
      return false;
    }

    const valores: string[] = [];

    for (const propiedad of evento.signature.properties) {
      const valor = propiedad
        .split('.')
        .reduce(
          (objeto: any, clave: string) => objeto?.[clave],
          evento.data,
        );

      if (valor === undefined || valor === null) {
        return false;
      }

      valores.push(String(valor));
    }

    const cadena =
      valores.join('') + String(evento.timestamp) + secreto;

    const checksumCalculado = createHash('sha256')
      .update(cadena)
      .digest('hex');

    const checksumRecibido =
      checksumHeader ?? evento.signature.checksum;

    if (
      typeof checksumRecibido !== 'string' ||
      !/^[a-fA-F0-9]{64}$/.test(checksumRecibido)
    ) {
      return false;
    }

    const calculado = Buffer.from(checksumCalculado, 'hex');
    const recibido = Buffer.from(checksumRecibido, 'hex');

    return timingSafeEqual(calculado, recibido);
  }
}
