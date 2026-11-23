
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Pago } from './pago.entity';
import { Reporte } from '../reportes/reporte.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { WompiService } from './wompi.service';
import { WompiWebhookController } from './wompi-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Reporte]),
    ConfigModule,
    UsuariosModule,
  ],
  controllers: [
    PagosController,
    WompiWebhookController,
  ],
  providers: [PagosService, WompiService],
  exports: [PagosService],
})
export class PagosModule {}
