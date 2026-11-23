
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
} from 'class-validator';

import { TipoReporte } from '../reporte.entity';

export class CrearReporteDto {
  @IsEnum(TipoReporte, {
    message: 'El tipo debe ser PERDIDA o HALLAZGO',
  })
  tipo: TipoReporte;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsIn(['Perro', 'Gato', 'Otro'])
  especie: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  raza?: string | null;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fechaEvento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  barrioSector: string;

  @IsString()
  @IsNotEmpty()
  imagenUrl: string;
}
