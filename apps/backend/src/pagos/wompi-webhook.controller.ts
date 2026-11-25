

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { WompiService } from './wompi.service';
import { PagosService } from './pagos.service';

@Controller('pagos/wompi')
export class WompiWebhookController {
  constructor(
    private readonly wompiService: WompiService,
    private readonly pagosService: PagosService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async recibirEvento(@Body() evento: any) {
    // 1. Validar la autenticidad y el ambiente del evento.
    const firmaValida = this.wompiService.validarEvento(evento);

    if (!firmaValida) {
      throw new UnauthorizedException(
        'La firma del evento de Wompi no es valida o pertenece a otro ambiente.',
      );
    }

    // 2. Ignorar eventos diferentes a las actualizaciones de transacciones.
    if (evento.event !== 'transaction.updated') {
      return {
        recibido: true,
        mensaje: 'Evento recibido sin cambios.',
      };
    }

    // 3. Obtener la transaccion.
    const transaccion = evento?.data?.transaction;

    if (
      !transaccion ||
      typeof transaccion !== 'object' ||
      typeof transaccion.id !== 'string' ||
      !transaccion.id.trim() ||
      typeof transaccion.reference !== 'string' ||
      !transaccion.reference.trim() ||
      typeof transaccion.status !== 'string' ||
      !Number.isSafeInteger(transaccion.amount_in_cents) ||
      transaccion.amount_in_cents <= 0 ||
      typeof transaccion.currency !== 'string' ||
      !/^[A-Z]{3}$/.test(transaccion.currency)
    ) {
      throw new BadRequestException(
        'El evento no contiene una transaccion valida.',
      );
    }

    // 4. Procesar la transaccion.
    return this.pagosService.procesarEventoWompi(transaccion);
  }
}
