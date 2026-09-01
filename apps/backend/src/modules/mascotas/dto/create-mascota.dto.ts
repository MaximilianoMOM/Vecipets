import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateMascotaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la mascota es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La especie es obligatoria' })
  especie: string;

  @IsString()
  @IsNotEmpty({ message: 'La raza es obligatoria' })
  raza: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  edadAprox: number;

  @IsString()
  @IsNotEmpty({ message: 'El color es obligatorio' })
  color: string;

  @IsString()
  @IsNotEmpty({ message: 'Las características son obligatorias' })
  caracteristicas: string;

  @IsString()
  @IsNotEmpty({ message: 'La URL de la foto es obligatoria' })
  @IsUrl({}, { message: 'La URL de la foto no es válida' })
  fotoUrl: string;
}