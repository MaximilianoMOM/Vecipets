
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reporte } from './reporte.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ValidacionImagenesModule } from '../validacion-imagenes/validacion-imagenes.module';
import { PagosModule } from '../pagos/pagos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { AlmacenamientoService } from './almacenamiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, Usuario]),
    UsuariosModule,
    ValidacionImagenesModule,
    PagosModule,
    NotificacionesModule,
  ],
  controllers: [ReportesController],
  providers: [
    ReportesService,
    AlmacenamientoService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [ReportesService],
})
export class ReportesModule {}
