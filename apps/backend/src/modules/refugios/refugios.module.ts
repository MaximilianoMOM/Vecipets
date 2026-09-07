import { Module } from '@nestjs/common';

import { RefugiosController } from './refugios.controller';
import { RefugiosService } from './refugios.service';

import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [
    RefugiosController,
  ],

  providers: [
    RefugiosService,
    PrismaService,
  ],

  exports: [
    RefugiosService,
  ],
})
export class RefugiosModule {}