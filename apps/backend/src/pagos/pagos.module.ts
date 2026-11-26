
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Pago } from './pago.entity';
import { IntentoPago } from './intento-pago.entity';
import { Reporte } from '../reportes/reporte.entity';
import { Jornada } from '../jornadas/jornada.entity';
import { ReservaJornada } from '../jornadas/reserva-jornada.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { WompiService } from './wompi.service';
import { WompiWebhookController } from './wompi-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
      Reporte,
      IntentoPago,
      Jornada,
      ReservaJornada,
      Usuario,
    ]),
    ConfigModule,
    UsuariosModule,
    NotificacionesModule,
  ],
  controllers: [
    PagosController,
    WompiWebhookController,
  ],
  providers: [
    PagosService,
    WompiService,
  ],
  exports: [PagosService, WompiService],
})
export class PagosModule {}
