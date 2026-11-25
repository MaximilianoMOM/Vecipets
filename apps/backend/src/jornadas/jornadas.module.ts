import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Jornada } from './jornada.entity';
import { ReservaJornada } from './reserva-jornada.entity';

import { Pago } from '../pagos/pago.entity';
import { IntentoPago } from '../pagos/intento-pago.entity';
import { Usuario } from '../usuarios/usuario.entity';

import { PagosModule } from '../pagos/pagos.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

import { JornadasController } from './jornadas.controller';
import { JornadasService } from './jornadas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jornada,
      ReservaJornada,
      Pago,
      IntentoPago,
      Usuario,
    ]),

    ConfigModule,
    UsuariosModule,
    PagosModule,
  ],

  controllers: [JornadasController],

  providers: [JornadasService],

  exports: [JornadasService],
})
export class JornadasModule {}