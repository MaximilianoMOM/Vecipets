
import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MascotasModule } from './modules/mascotas/mascotas.module';
import { AppController } from './app.controller';
import { ReportesModule } from './modules/reportes/reportes.module';
import { UbicacionesModule } from './modules/ubicaciones/ubicaciones.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    AuthModule,
    MascotasModule,
    ReportesModule,
    UbicacionesModule,
    AdminModule,
  ],
})
export class AppModule {}

