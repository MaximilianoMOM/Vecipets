
import {
  Controller,
  Get,
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
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

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
        'No se pudo obtener la cuenta de Google.',
      );
    }

    await this.usuariosService.iniciarSesionGoogle(
      request.user,
      respuesta,
    );
  }
}
