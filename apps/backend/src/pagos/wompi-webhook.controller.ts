
import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
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
  async recibirEvento(
    @Body() evento: any,
    @Headers('x-event-checksum') checksum: string,
  ) {
    const firmaValida = this.wompiService.validarEvento(
      evento,
      checksum,
    );

    if (!firmaValida) {
      throw new UnauthorizedException(
        'La firma del evento de Wompi no es válida.',
      );
    }

    if (evento?.event !== 'transaction.updated') {
      return {
        recibido: true,
        mensaje: 'Evento recibido sin cambios.',
      };
    }

    return this.pagosService.procesarEventoWompi(
      evento.data.transaction,
    );
  }
}
