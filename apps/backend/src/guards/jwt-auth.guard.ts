
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface SolicitudAutenticada extends Request {
  usuario?: {
    sub: number;
    correo?: string;
    rol?: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<SolicitudAutenticada>();

    const token = request.cookies?.vecipets_access_token;
    
    if (!token) {
      throw new UnauthorizedException(
        'Debes iniciar sesión para acceder a este recurso.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload.sub) {
        throw new UnauthorizedException('Sesión inválida.');
      }

      request.usuario = payload;
      return true;
    } catch {
      throw new UnauthorizedException(
        'La sesión es inválida o ha expirado. Inicia sesión nuevamente.',
      );
    }
  }
}
