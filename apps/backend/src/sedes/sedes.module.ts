import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SedesController } from './sedes.controller';
import { Sede } from './sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sede]), UsuariosModule],
  controllers: [SedesController],
})
export class SedesModule {}
