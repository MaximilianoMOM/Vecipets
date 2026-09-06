
import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  /**
   * Ver solicitudes pendientes
   */
  @Get('solicitudes-pendientes')
  async obtenerSolicitudesPendientes() {
    return this.adminService.obtenerSolicitudesPendientes();
  }

  /**
   * Aprobar solicitud
   */
  @Patch('solicitudes/:id/aprobar')
  async aprobarSolicitud(
    @Param('id') id: string,
  ) {
    return this.adminService.aprobarSolicitud(id);
  }

  /**
   * Rechazar solicitud
   */
  @Patch('solicitudes/:id/rechazar')
  async rechazarSolicitud(
    @Param('id') id: string,
  ) {
    return this.adminService.rechazarSolicitud(id);
  }
}

