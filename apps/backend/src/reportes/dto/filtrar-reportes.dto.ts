
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoReporte } from '../reporte.entity';

export class FiltrarReportesDto {
  @IsOptional()
  @IsEnum(TipoReporte)
  tipo?: TipoReporte;

  @IsOptional()
  @IsString()
  especie?: string;

  @IsOptional()
  @IsString()
  barrioSector?: string;

  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;
}
