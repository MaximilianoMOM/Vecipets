
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MascotasModule } from './modules/mascotas/mascotas.module';
import { AppController } from './app.controller';
import { ReportesModule } from './modules/reportes/reportes.module';
import { UbicacionesModule } from './modules/ubicaciones/ubicaciones.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MascotasModule,
    ReportesModule,
    UbicacionesModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

