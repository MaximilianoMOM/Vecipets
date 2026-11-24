
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { CrearPagoDto } from './dto/crear-pago.dto';

interface UsuarioSesion {
  sub: number;
}

interface RecuperarPagoDto {
  transactionId: string;
}

@Controller('pagos')
@UseGuards(JwtAuthGuard)
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
  ) {}

  // Crear pago de Alerta Turbo
  @Post('alerta-turbo')
  async crearPagoTurbo(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Body() dto: CrearPagoDto,
  ) {
    return this.pagosService.crearPagoAlertaTurbo(
      usuario.sub,
      dto.reporteId,
    );
  }

  // Consultar un pago
  @Get(':id')
  async consultarPago(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pagosService.consultarPago(
      id,
      usuario.sub,
    );
  }

  // Recuperar una transacción existente desde Wompi
  @Post(':id/recuperar-wompi')
  async recuperarPagoWompi(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecuperarPagoDto,
  ) {
    if (
      !dto ||
      typeof dto.transactionId !== 'string' ||
      !dto.transactionId.trim()
    ) {
      throw new BadRequestException(
        'Debes proporcionar el ID de la transacción de Wompi.',
      );
    }

    return this.pagosService.recuperarTransaccionWompi(
      id,
      usuario.sub,
      dto.transactionId.trim(),
    );
  }
}
