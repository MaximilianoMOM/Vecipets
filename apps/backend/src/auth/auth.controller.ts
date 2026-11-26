
import {
  Controller,
  Get,
  Logger,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from './google-auth.guard';
import { UsuariosService } from '../usuarios/usuarios.service';

interface UsuarioGoogle {
  googleId: string;
  nombre: string;
  correo: string;
}

interface RequestGoogle extends Request {
  user?: UsuarioGoogle;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly usuariosService: UsuariosService,
  ) { }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  iniciarGoogle() {
    // Passport redirige automáticamente a Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async callbackGoogle(
    @Req() request: RequestGoogle,
    @Res() respuesta: Response,
  ) {
    if (!request.user) {
      throw new UnauthorizedException(
        'No se pudo iniciar sesión con Google.',
      );
    }

    // Crea el JWT y lo guarda en la cookie HttpOnly.
    await this.usuariosService.iniciarSesionGoogle(
      request.user,
      respuesta,
    );

    // Redirige al frontend después de establecer la cookie.
    const frontendUrl = (
      process.env.GOOGLE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000'
    ).replace(/\/+$/, '');

    this.logger.log('Sesión de Google iniciada');
    return respuesta.redirect(`${frontendUrl}/`);
  }
}
