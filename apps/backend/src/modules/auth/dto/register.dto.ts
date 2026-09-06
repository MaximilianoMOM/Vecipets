
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

import { RoleName } from '@prisma/client';

export class RegisterDto {
  // ==========================================
  // DATOS BÁSICOS DEL USUARIO
  // ==========================================

  @IsString()
  @IsNotEmpty({
    message: 'El nombre completo es obligatorio',
  })
  nombreCompleto: string;

  @IsEmail(
    {},
    {
      message: 'El correo electrónico no es válido',
    },
  )
  @IsNotEmpty({
    message: 'El correo es obligatorio',
  })
  email: string;

  @IsString()
  @MinLength(8, {
    message:
      'La contraseña debe tener al menos 8 caracteres',
  })
  password: string;

  @IsString()
  @IsNotEmpty({
    message: 'El teléfono es obligatorio',
  })
  telefono: string;

  // ==========================================
  // ROL
  // ==========================================

  @IsEnum(
    [
      RoleName.CIUDADANO,
      RoleName.REFUGIO,
      RoleName.VETERINARIA,
    ],
    {
      message:
        'El rol debe ser CIUDADANO, REFUGIO o VETERINARIA',
    },
  )
  rol: RoleName;

  // ==========================================
  // DATOS DE REFUGIO
  // ==========================================

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'El nombre del refugio es obligatorio',
  })
  nombreRefugio?: string;

  @IsOptional()
  @IsInt({
    message: 'La capacidad debe ser un número entero',
  })
  @Min(1, {
    message: 'La capacidad debe ser mayor a 0',
  })
  capacidadRefugio?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'El horario del refugio es obligatorio',
  })
  horarioRefugio?: string;

  @IsOptional()
  @IsUrl(
    {},
    {
      message: 'El sitio web del refugio no es válido',
    },
  )
  sitioWebRefugio?: string;

  // ==========================================
  // DATOS DE VETERINARIA
  // ==========================================

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message:
      'El nombre de la veterinaria es obligatorio',
  })
  nombreVeterinaria?: string;

  @IsOptional()
  @IsBoolean({
    message:
      'El campo de urgencias 24 horas debe ser verdadero o falso',
  })
  urgencias24h?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message:
      'El horario de la veterinaria es obligatorio',
  })
  horarioVeterinaria?: string;

  // ==========================================
  // UBICACIÓN
  // ==========================================

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'La dirección es obligatoria',
  })
  direccion?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'La comuna es obligatoria',
  })
  comuna?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'El barrio es obligatorio',
  })
  barrio?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'La latitud es obligatoria',
  })
  latitud?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'La longitud es obligatoria',
  })
  longitud?: string;
}

