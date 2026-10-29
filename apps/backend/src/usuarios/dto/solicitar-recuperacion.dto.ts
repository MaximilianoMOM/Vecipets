
import { IsEmail, MaxLength } from 'class-validator';

export class SolicitarRecuperacionDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @MaxLength(255, {
    message: 'El correo no puede superar 255 caracteres',
  })
  correo: string;
}
