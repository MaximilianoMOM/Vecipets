import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { JornadasService } from './jornadas.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { CrearReservaJornadaDto } from './dto/crear-reserva-jornada.dto';

interface UsuarioSesion {
  sub: number;
}

@Controller('jornadas')
@UseGuards(JwtAuthGuard)
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  @Get()
  async listarJornadas() {
    return this.jornadasService.obtenerJornadasActivas();
  }

  @Get(':id')
  async obtenerJornada(@Param('id', ParseIntPipe) id: number) {
    const jornada = await this.jornadasService.obtenerJornadaPorId(id);
    if (!jornada) {
      throw new Error('Jornada no encontrada');
    }
    return jornada;
  }

  @Post('reservar')
  async crearReserva(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Body() dto: CrearReservaJornadaDto,
  ) {
    return this.jornadasService.crearReserva(usuario.sub, dto);
  }

  @Get('reservas/:reservaId/estado')
  async verificarEstadoReserva(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('reservaId', ParseIntPipe) reservaId: number,
  ) {
    return this.jornadasService.verificarEstadoReserva(usuario.sub, reservaId);
  }
}
