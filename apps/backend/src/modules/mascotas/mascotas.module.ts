import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MascotasController } from './mascotas.controller';
import { MascotasService } from './mascotas.service';

@Module({
  imports: [PrismaModule],
  controllers: [MascotasController],
  providers: [MascotasService],
})
export class MascotasModule {}