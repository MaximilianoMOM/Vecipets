
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerificarCorreoDto {
  @IsEmail({}, { message: 'Ingresa un correo válido' })
  correo: string;

  @IsString({ message: 'El código debe ser texto' })
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  @Matches(/^\d{6}$/, {
    message: 'El código debe contener solamente números',
  })
  codigo: string;
}
