
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reporte } from './reporte.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, Usuario]),
    UsuariosModule,
  ],
  controllers: [ReportesController],
  providers: [
    ReportesService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [ReportesService],
})
export class ReportesModule {}
