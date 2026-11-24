
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
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  latitud?: string | null;

  @IsOptional()
  @IsString()
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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  recompensa?: number | null;
}

