import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UbicacionesService } from './ubicaciones.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ubicaciones')
@UseGuards(JwtAuthGuard)
export class UbicacionesController {
  constructor(
    private readonly ubicacionesService: UbicacionesService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateUbicacionDto,
  ) {
    return this.ubicacionesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.ubicacionesService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.ubicacionesService.findOne(id);
  }
}