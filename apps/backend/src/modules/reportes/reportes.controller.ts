import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  // =========================================================
  // CREAR REPORTE
  // POST /api/v1/reportes
  // =========================================================

  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateReporteDto,
  ) {
    return this.reportesService.create(
      req.user.id,
      dto,
    );
  }

  // =========================================================
  // OBTENER REPORTES
  // GET /api/v1/reportes
  //
  // Ejemplos:
  // /reportes
  // /reportes?tipo=PERDIDA
  // /reportes?especie=PERRO
  // /reportes?q=Bruno
  // /reportes?tipo=PERDIDA&especie=PERRO&q=Bruno
  // =========================================================

  @Get()
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('especie') especie?: string,
    @Query('q') q?: string,
  ) {
    return this.reportesService.findAll(
      tipo,
      especie,
      q,
    );
  }

  // =========================================================
  // OBTENER UN REPORTE
  // GET /api/v1/reportes/:id
  // =========================================================

  @Get(':id')
  async findOne(
    @Param('id') reporteId: string,
  ) {
    return this.reportesService.findOne(
      reporteId,
    );
  }

  // =========================================================
  // MARCAR REPORTE COMO RESUELTO
  // PATCH /api/v1/reportes/:id/resolver
  // =========================================================

  @Patch(':id/resolver')
  async marcarComoResuelto(
    @Request() req: any,
    @Param('id') reporteId: string,
  ) {
    return this.reportesService.marcarComoResuelto(
      reporteId,
      req.user.id,
    );
  }
}