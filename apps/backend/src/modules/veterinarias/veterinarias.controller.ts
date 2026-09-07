import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { VeterinariasService } from './veterinarias.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('veterinarias')
@UseGuards(JwtAuthGuard, AdminGuard)
export class VeterinariasController {
  constructor(
    private readonly veterinariasService: VeterinariasService,
  ) {}

  /**
   * Obtener todas las veterinarias
   *
   * GET /api/v1/veterinarias
   */
  @Get()
  async obtenerVeterinarias() {
    return this.veterinariasService.obtenerVeterinarias();
  }

  /**
   * Obtener estadísticas
   *
   * GET /api/v1/veterinarias/estadisticas
   */
  @Get('estadisticas')
  async obtenerEstadisticas() {
    return this.veterinariasService.obtenerEstadisticas();
  }

  /**
   * Obtener veterinaria por ID
   *
   * GET /api/v1/veterinarias/:id
   */
  @Get(':id')
  async obtenerVeterinariaPorId(
    @Param('id') id: string,
  ) {
    return this.veterinariasService.obtenerVeterinariaPorId(id);
  }
}