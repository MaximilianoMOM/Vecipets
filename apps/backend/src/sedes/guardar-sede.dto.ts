import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, IsUrl, Length, Matches, MaxLength } from 'class-validator';
import type { TipoSede } from './sede.entity';

function limpiarTexto({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class GuardarSedeDto {
  @Transform(limpiarTexto)
  @IsString()
  @Length(2, 100)
  nombre: string;

  @IsIn(['VETERINARIA', 'CLINICA', 'REFUGIO'])
  tipo: TipoSede;

  @Transform(limpiarTexto)
  @IsString()
  @Length(5, 180)
  direccion: string;

  @Transform(limpiarTexto)
  @IsString()
  @Length(2, 140)
  horario: string;

  @Transform(({ value }) => Array.isArray(value) ? value.map((item) => limpiarTexto({ value: item })) : value)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @Length(2, 60, { each: true })
  servicios: string[];

  @Transform(limpiarTexto)
  @Matches(/^\+?[0-9]{7,15}$/)
  telefono: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(1000)
  imagenUrl?: string | null;
}
