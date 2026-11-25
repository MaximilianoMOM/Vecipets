import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CrearReservaJornadaDto {
  @IsInt()
  @Min(1)
  jornadaId: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del propietario es obligatorio.' })
  @MaxLength(200)
  nombrePropietario: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la mascota es obligatorio.' })
  @MaxLength(200)
  nombreMascota: string;
}
