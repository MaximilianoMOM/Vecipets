
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MascotasModule } from './modules/mascotas/mascotas.module';
import { AppController } from './app.controller';
import { ReportesModule } from './modules/reportes/reportes.module';
import { UbicacionesModule } from './modules/ubicaciones/ubicaciones.module';
import { AdminModule } from './modules/admin/admin.module';
import { RefugiosModule } from './modules/refugios/refugios.module';
import { VeterinariasModule } from './modules/veterinarias/veterinarias.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MascotasModule,
    ReportesModule,
    UbicacionesModule,
    AdminModule,
    RefugiosModule,
    VeterinariasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

