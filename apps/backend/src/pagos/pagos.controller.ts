
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { CrearPagoDto } from './dto/crear-pago.dto';

interface UsuarioSesion {
  sub: number;
}

@Controller('pagos')
@UseGuards(JwtAuthGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

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

  @Get(':id')
  async consultarPago(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pagosService.consultarPago(id, usuario.sub);
  }
}
