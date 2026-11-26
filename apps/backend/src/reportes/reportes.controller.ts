
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { ReportesService } from './reportes.service';
import { CrearReporteDto } from './dto/crear-reporte.dto';
import { ActualizarReporteDto } from './dto/actualizar-reporte.dto';
import { FiltrarReportesDto } from './dto/filtrar-reportes.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';

interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface UsuarioSesion {
  sub: number;
  correo?: string;
  rol?: string;
}

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * Crear un nuevo reporte con fotografía y análisis de Google Cloud Vision.
   * Solo ciudadanos autenticados y verificados.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  @UseInterceptors(FileInterceptor('imagen'))
  async crear(
    @Body() dto: CrearReporteDto,
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @UploadedFile() archivo?: ArchivoSubido,
  ) {
    return this.reportesService.crear(dto, usuario.sub, archivo);
  }

  /**
   * Guardar o actualizar borrador de reporte (antes de pagar o durante el proceso).
   */
  @Post('borrador')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  @UseInterceptors(FileInterceptor('imagen'))
  async guardarBorrador(
    @Body() dto: CrearReporteDto,
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @UploadedFile() archivo?: ArchivoSubido,
  ) {
    return this.reportesService.crear(dto, usuario.sub, archivo);
  }

  /**
   * Consultar borrador de reporte con su estado de pago.
   */
  @Get('borrador/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  async obtenerBorrador(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    return this.reportesService.obtenerBorrador(id, usuario.sub);
  }

  /**
   * Confirmar y publicar reporte borrador tras el pago o de forma estándar.
   * El reporte queda formalmente registrado y pendiente de aprobación por el administrador.
   */
  @Post(':id/publicar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  async publicarReporte(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarReporteDto,
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    return this.reportesService.publicarBorrador(id, usuario.sub, dto);
  }

  /**
   * Consultar feed público de reportes con filtros y paginación.
   * Prioriza automáticamente reportes con Alerta Turbo activa.
   */
  @Get()
  async obtenerPublicos(@Query() filtros: FiltrarReportesDto) {
    return this.reportesService.obtenerPublicos(filtros);
  }

  /**
   * Consultar todos los reportes creados por el usuario de la sesión actual.
   * Debe ir antes de ':id' para evitar colisión de rutas.
   */
  @Get('mis-reportes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  async obtenerMisReportes(
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    return this.reportesService.obtenerMisReportes(usuario.sub);
  }

  @Get('moderacion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  obtenerParaModeracion() {
    return this.reportesService.obtenerParaModeracion();
  }

  /**
   * Consultar detalle de un reporte por ID.
   * Los reportes públicos son visibles para todos. Los pendientes/rechazados
   * solo para el propietario o el administrador.
   */
  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    let usuarioId: number | undefined;
    let esAdmin = false;

    const token = req.cookies?.vecipets_access_token;
    if (token) {
      let id: number | undefined;
      try {
        const payload = await this.jwtService.verifyAsync(token);
        if (Number.isSafeInteger(payload?.sub) && payload.sub > 0) id = payload.sub;
      } catch {
        // Token no válido o expirado: se trata como visitante anónimo
      }
      const cuenta = id === undefined ? null : await this.usuariosService.obtenerPorId(id);
      if (cuenta?.correoVerificado && cuenta.estadoAprobacion === 'APROBADO') {
        usuarioId = cuenta.id;
        esAdmin = cuenta.rol === 'ADMINISTRADOR';
      }
    }

    return this.reportesService.obtenerPorId(id, usuarioId, esAdmin);
  }

  /**
   * Actualizar reporte:
   * - Propietario: editar datos o marcar como RESUELTO / CERRADO.
   * - Administrador: aprobar o rechazar reportes enviados a revisión.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO', 'ADMINISTRADOR')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarReporteDto,
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    const esAdmin = usuario.rol === 'ADMINISTRADOR';
    return this.reportesService.actualizar(
      id,
      dto,
      usuario.sub,
      esAdmin,
    );
  }
}
