import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  comuna: string;

  @IsString()
  @IsNotEmpty()
  barrio: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;
}