
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mascotas')
@UseGuards(JwtAuthGuard)
export class MascotasController {
  constructor(
    private readonly mascotasService: MascotasService,
  ) {}

  // =====================================================
  // CREAR MASCOTA
  // =====================================================

  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateMascotaDto,
  ) {
    return this.mascotasService.create(
      req.user.id,
      dto,
    );
  }

  // =====================================================
  // MASCOTAS REPORTADAS
  // =====================================================

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

  // =====================================================
  // OBTENER MIS MASCOTAS
  // =====================================================

  @Get()
  async findMyPets(@Request() req: any) {
    return this.mascotasService.findByUsuario(
      req.user.id,
    );
  }

  // =====================================================
  // OBTENER UNA MASCOTA
  // =====================================================

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.mascotasService.findOne(
      id,
      req.user.id,
    );
  }

  // =====================================================
  // ACTUALIZAR MASCOTA
  // =====================================================

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateMascotaDto,
  ) {
    return this.mascotasService.update(
      id,
      req.user.id,
      dto,
    );
  }

  // =====================================================
  // ELIMINAR MI MASCOTA
  // =====================================================

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.mascotasService.remove(
      id,
      req.user.id,
    );
  }

  // =====================================================
  // ELIMINAR CUALQUIER MASCOTA - ADMINISTRADOR
  // =====================================================

  @Delete('admin/:id')
  async removeByAdmin(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Solo el administrador puede eliminar mascotas de otros usuarios',
      );
    }

    return this.mascotasService.removeByAdmin(id);
  }
}
