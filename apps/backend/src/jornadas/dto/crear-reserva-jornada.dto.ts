import { Transform } from 'class-transformer';
import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  MaxLength, IsBoolean, IsOptional,
} from 'class-validator';

export class CrearReservaJornadaDto {
  @IsInt()
  @Min(1)
  jornadaId: number;

  @Transform(({ obj, key }) => obj[key])
  @IsOptional()
  @IsBoolean()
  aceptaCondiciones?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del propietario es obligatorio.' })
  @MaxLength(200)
  nombrePropietario: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la mascota es obligatorio.' })
  @MaxLength(200)
  nombreMascota: string;
}
