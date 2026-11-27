import { IsLatitude, IsLongitude } from 'class-validator';

import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
  IsNumber,
  Min,
} from 'class-validator';

import { TipoReporte } from '../reporte.entity';

export class CrearReporteDto {
  @IsEnum(TipoReporte, {
    message: 'El tipo debe ser PERDIDA o HALLAZGO',
  })
  tipo: TipoReporte;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsIn(['Perro', 'Gato', 'Otro'], {
    message: 'La especie debe ser Perro, Gato u Otro',
  })
  especie: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  raza?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tamano?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sexo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  edad?: string | null;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fechaEvento: string;

  @IsString()
  @IsNotEmpty({ message: 'El barrio o sector es obligatorio' })
  @MaxLength(150)
  barrioSector: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string | null;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsLatitude()
  latitud?: string | null;

  @IsOptional()
  @IsLongitude()
  longitud?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  referencia?: string | null;

  @IsOptional()
  @IsString({ message: 'La recompensa debe ser un número válido' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'La recompensa debe ser un número válido (ej. 5000 o 5000.50)',
  })
  recompensa?: string | null;

  @IsOptional()
  esTurbo?: boolean | string;

  @IsOptional()
  borradorId?: number | string;
}

