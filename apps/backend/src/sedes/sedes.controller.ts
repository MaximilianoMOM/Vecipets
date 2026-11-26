import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { GuardarSedeDto } from './guardar-sede.dto';
import { Sede } from './sede.entity';

type Organizador = { sub: number; rol: 'VETERINARIA' | 'REFUGIO' };

@Controller('sedes')
export class SedesController {
  constructor(@InjectRepository(Sede) private readonly sedes: Repository<Sede>) {}

  @Get()
  async listar() {
    const sedes = await this.sedes.find({
      where: { organizador: { estadoAprobacion: 'APROBADO', correoVerificado: true } },
      order: { nombre: 'ASC', id: 'ASC' },
    });
    return sedes.map(({ organizadorId, ...sede }) => sede);
  }

  @Get('mias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA', 'REFUGIO')
  mias(@UsuarioAutenticado() organizador: Organizador) {
    return this.sedes.find({ where: { organizadorId: organizador.sub }, order: { nombre: 'ASC', id: 'ASC' } });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA', 'REFUGIO')
  crear(@Body() datos: GuardarSedeDto, @UsuarioAutenticado() organizador: Organizador) {
    this.validarTipo(datos, organizador);
    return this.sedes.save(this.sedes.create({
      ...datos, imagenUrl: datos.imagenUrl ?? null, organizadorId: organizador.sub,
    }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA', 'REFUGIO')
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: GuardarSedeDto,
    @UsuarioAutenticado() organizador: Organizador,
  ) {
    this.validarTipo(datos, organizador);
    const resultado = await this.sedes.update(
      { id, organizadorId: organizador.sub },
      { ...datos, imagenUrl: datos.imagenUrl ?? null },
    );
    if (!resultado.affected) throw new NotFoundException('No se encontró una sede de tu cuenta.');
    return { id, ...datos, imagenUrl: datos.imagenUrl ?? null };
  }

  private validarTipo(datos: GuardarSedeDto, organizador: Organizador) {
    if ((organizador.rol === 'REFUGIO') !== (datos.tipo === 'REFUGIO')) {
      throw new ForbiddenException('El tipo de sede no corresponde a tu cuenta.');
    }
  }
}
