import { Module } from '@nestjs/common';

import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}