import { IsIn } from 'class-validator';

export class ModerarAliadoDto {
  @IsIn(['APROBADO', 'RECHAZADO'])
  estado: 'APROBADO' | 'RECHAZADO';
}
