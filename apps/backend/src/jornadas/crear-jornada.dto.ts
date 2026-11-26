import { Transform } from 'class-transformer';
import { IsISO8601, IsInt, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CrearJornadaDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(4, 120)
  titulo: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 80)
  comuna: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(4, 160)
  direccion: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  inicio: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  fin: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  cupos: number;

  @IsInt()
  @Min(0)
  @Max(21474836)
  precioCop: number;
}
