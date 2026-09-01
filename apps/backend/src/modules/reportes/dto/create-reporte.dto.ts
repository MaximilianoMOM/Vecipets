import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ReportType } from '@prisma/client';

export class CreateReporteDto {
  @IsUUID()
  @IsNotEmpty()
  mascotaId: string;

  @IsUUID()
  @IsNotEmpty()
  ubicacionId: string;

  @IsEnum(ReportType)
  tipo: ReportType;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  fechaAcontecimiento: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  imagenPublicId?: string;
}