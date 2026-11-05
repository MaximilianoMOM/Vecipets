
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RestablecerContrasenaDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @MaxLength(255)
  correo: string;

  @IsString()
  @Length(6, 6, {
    message: 'El código debe tener exactamente 6 dígitos',
  })
  @Matches(/^\d{6}$/, {
    message: 'El código debe contener únicamente números',
  })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede superar 72 caracteres',
  })
  nuevaContrasena: string;
}

