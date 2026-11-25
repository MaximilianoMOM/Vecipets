import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { Jornada } from './jornada.entity';
import { JornadasController } from './jornadas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Jornada]), UsuariosModule],
  controllers: [JornadasController],
})
export class JornadasModule {}
