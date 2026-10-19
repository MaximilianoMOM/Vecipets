
import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @MaxLength(255)
  correo: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar 72 caracteres',
  })
  password: string;
}
