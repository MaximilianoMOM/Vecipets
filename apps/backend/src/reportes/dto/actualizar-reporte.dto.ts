import { IsLatitude, IsLongitude } from 'class-validator';

import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
} from 'class-validator';

import {
  TipoReporte,
  EstadoReporte,
  EstadoAprobacionReporte,
} from '../reporte.entity';

export class ActualizarReporteDto {
  @IsOptional()
  @IsEnum(TipoReporte, {
    message: 'El tipo debe ser PERDIDA o HALLAZGO',
  })
  tipo?: TipoReporte;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Perro', 'Gato', 'Otro'], {
    message: 'La especie debe ser Perro, Gato u Otro',
  })
  especie?: string;

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

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fechaEvento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  barrioSector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string | null;

  @IsOptional()
  @IsEnum(EstadoReporte, {
    message: 'El estado debe ser PUBLICO, RESUELTO o CERRADO',
  })
  estado?: EstadoReporte;

  @IsOptional()
  @IsEnum(EstadoAprobacionReporte)
  estadoAprobacion?: EstadoAprobacionReporte;

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
  recompensa?: string | number | null;
}
