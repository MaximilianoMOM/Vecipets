import { Module } from '@nestjs/common';

import { VeterinariasController } from './veterinarias.controller';
import { VeterinariasService } from './veterinarias.service';

import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [
    VeterinariasController,
  ],

  providers: [
    VeterinariasService,
    PrismaService,
  ],

  exports: [
    VeterinariasService,
  ],
})
export class VeterinariasModule {}