import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('solicitudes-pendientes')
  async obtenerSolicitudesPendientes() {
    return this.adminService.obtenerSolicitudesPendientes();
  }

  @Patch('solicitudes/:id/aprobar')
  async aprobarSolicitud(
    @Param('id') id: string,
  ) {
    return this.adminService.aprobarSolicitud(id);
  }

  @Patch('solicitudes/:id/rechazar')
  async rechazarSolicitud(
    @Param('id') id: string,
  ) {
    return this.adminService.rechazarSolicitud(id);
  }

  @Get('usuarios-activos')
  async obtenerUsuariosActivos() {
    return this.adminService.obtenerUsuariosActivos();
  }

  @Get('usuarios-activos/:id')
  async obtenerUsuarioActivoPorId(
    @Param('id') id: string,
  ) {
    return this.adminService.obtenerUsuarioActivoPorId(id);
  }

  @Patch('usuarios-activos/:id/eliminar')
  async eliminarUsuario(
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarUsuario(id);
  }
}