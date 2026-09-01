import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mascotas')
@UseGuards(JwtAuthGuard)
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateMascotaDto,
  ) {
    return this.mascotasService.create(req.user.id, dto);
  }

  @Get('reportadas')
  async findReportedPets(
    @Query('tipo') tipo?: string,
    @Query('especie') especie?: string,
    @Query('raza') raza?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.mascotasService.findReportedPets(
      tipo,
      especie,
      raza,
      fechaDesde,
      fechaHasta,
    );
  }

  @Get()
  async findMyPets(@Request() req: any) {
    return this.mascotasService.findByUsuario(req.user.id);
  }
}