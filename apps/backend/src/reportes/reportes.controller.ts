
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ReportesService } from './reportes.service';
import { CrearReporteDto } from './dto/crear-reporte.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  async crear(
    @Body() dto: CrearReporteDto,
    @UsuarioAutenticado() usuario: { sub: number },
  ) {
    return this.reportesService.crear(dto, usuario.sub);
  }
}
