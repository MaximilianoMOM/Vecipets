
import { Module } from '@nestjs/common';

import { ValidacionImagenesService } from './validacion-imagenes.service';

@Module({
  providers: [ValidacionImagenesService],
  exports: [ValidacionImagenesService],
})
export class ValidacionImagenesModule {}
