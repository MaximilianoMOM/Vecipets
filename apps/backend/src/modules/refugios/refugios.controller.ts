import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { RefugiosService } from './refugios.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('refugios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RefugiosController {
  constructor(
    private readonly refugiosService: RefugiosService,
  ) {}

  @Get()
  async obtenerRefugios() {
    return this.refugiosService.obtenerRefugios();
  }

  @Get('estadisticas')
  async obtenerEstadisticas() {
    return this.refugiosService.obtenerEstadisticas();
  }

  @Get(':id')
  async obtenerRefugioPorId(
    @Param('id') id: string,
  ) {
    return this.refugiosService.obtenerRefugioPorId(id);
  }
}