
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UsuariosService } from '../usuarios/usuarios.service';

interface SolicitudAutenticada extends Request {
  usuario?: {
    sub: number;
    correo?: string;
    rol?: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

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

    let id: number;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!Number.isSafeInteger(payload.sub) || payload.sub <= 0) {
        throw new UnauthorizedException('Sesión inválida.');
      }
      id = payload.sub;
    } catch {
      throw new UnauthorizedException(
        'La sesión es inválida o ha expirado. Inicia sesión nuevamente.',
      );
    }

    const usuario = await this.usuariosService.obtenerPorId(id);
    if (!usuario || !usuario.correoVerificado) {
      throw new UnauthorizedException('La sesión es inválida.');
    }
    if (usuario.estadoAprobacion !== 'APROBADO') {
      throw new ForbiddenException('Tu cuenta no tiene acceso en este momento.');
    }
    request.usuario = { sub: usuario.id, correo: usuario.correo, rol: usuario.rol };
    return true;
  }
}
