import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendPasswordResetCode(
    to: string,
    codigo: string,
    expiresAt: Date,
  ) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: 'Código para recuperar tu contraseña - VeciPets',

      text: `
Hola,

Hemos recibido una solicitud para recuperar tu contraseña de VeciPets.

Tu código de recuperación es: ${codigo}

Este código vence en 10 minutos.

Si tú no solicitaste este cambio, puedes ignorar este correo.

VeciPets
Unidos por cada huella.
      `,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
          <h2 style="text-align: center;">🐾 VeciPets</h2>

          <h3>Recuperación de contraseña</h3>

          <p>
            Hemos recibido una solicitud para recuperar la contraseña
            de tu cuenta.
          </p>

          <p>Tu código de verificación es:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 20px;
            margin: 20px 0;
          ">
            ${codigo}
          </div>

          <p>
            Este código vence en <strong>10 minutos</strong>.
          </p>

          <p>
            Si tú no solicitaste este cambio, puedes ignorar este correo.
          </p>

          <hr>

          <p style="text-align: center;">
            VeciPets — Unidos por cada huella 🐾
          </p>
        </div>
      `,
    });
  }
}