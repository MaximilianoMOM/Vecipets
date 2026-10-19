
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CorreoService {
  constructor(private readonly configService: ConfigService) {}

  async enviarCodigo(correo: string, codigo: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: this.configService.getOrThrow<number>('MAIL_PORT'),
      secure: this.configService.getOrThrow<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });

    try {
      await transporter.sendMail({
        from: this.configService.getOrThrow<string>('MAIL_FROM'),
        to: correo,
        subject: 'Código de verificación - VeciPets',
        text: `Tu código de verificación es: ${codigo}. Este código vence en 5 minutos.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🐾 VeciPets</h2>
            <p>Usa este código para verificar tu correo electrónico:</p>
            <h1 style="letter-spacing: 5px;">${codigo}</h1>
            <p>El código vence en 5 minutos.</p>
            <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
          </div>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de verificación.',
      );
    }
  }

  async enviarCodigoRecuperacion(
    correo: string,
    codigo: string,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: this.configService.getOrThrow<number>('MAIL_PORT'),
      secure: this.configService.getOrThrow<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });

    try {
      await transporter.sendMail({
        from: this.configService.getOrThrow<string>('MAIL_FROM'),
        to: correo,
        subject: 'Recuperación de contraseña - VeciPets',
        text: `Tu código para recuperar la contraseña es: ${codigo}. Vence en 5 minutos.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🐾 VeciPets</h2>
            <p>Recibimos una solicitud para recuperar tu contraseña.</p>
            <p>Tu código de recuperación es:</p>
            <h1 style="letter-spacing: 5px;">${codigo}</h1>
            <p>Este código vence en 5 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );
    }
  }
}
