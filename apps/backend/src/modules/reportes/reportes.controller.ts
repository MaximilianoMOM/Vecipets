import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

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

  @Get()
  async findAll() {
    return this.reportesService.findAll();
  }

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

