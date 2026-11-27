import { Transform } from 'class-transformer';
import { IsBoolean, IsISO8601, IsLatitude, IsLongitude, IsString, Length, Matches } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

function parseCoordinate(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || !/^[+-]?\d+(?:\.\d+)?$/.test(value.trim())) return NaN;
  return Number(value);
}

export class CrearAvistamientoDto {
  @Transform(trim)
  @IsString()
  @Length(3, 200)
  direccion: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  barrioSector: string;

  @Transform(({ obj, key }) => parseCoordinate(obj[key]))
  @IsLatitude()
  latitud: number;

  @Transform(({ obj, key }) => parseCoordinate(obj[key]))
  @IsLongitude()
  longitud: number;

  @Transform(trim)
  @IsString()
  @Length(5, 1000)
  comentario: string;

  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  fechaAvistamiento: string;
}

export class ModerarAvistamientoDto {
  @IsBoolean()
  visible: boolean;
}
