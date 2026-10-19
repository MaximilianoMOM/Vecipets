
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @MaxLength(255)
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar 72 caracteres' })
  password: string;

  @IsIn(['CIUDADANO', 'REFUGIO', 'VETERINARIA'], {
    message: 'El perfil seleccionado no es válido',
  })
  rol: 'CIUDADANO' | 'REFUGIO' | 'VETERINARIA';
}
