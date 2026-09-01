import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MascotasModule } from './modules/mascotas/mascotas.module';
import { AppController } from './app.controller';
import { ReportesModule } from './modules/reportes/reportes.module';
import { UbicacionesModule } from './modules/ubicaciones/ubicaciones.module';

@Module({
  imports: [
    AuthModule,
    MascotasModule,
    ReportesModule,
    UbicacionesModule,
  ],
})
export class AppModule {}