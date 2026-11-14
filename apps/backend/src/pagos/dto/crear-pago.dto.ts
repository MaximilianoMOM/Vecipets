
import { IsInt, Min } from 'class-validator';

export class CrearPagoDto {
  @IsInt()
  @Min(1)
  reporteId: number;
}
