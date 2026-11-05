
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../usuarios/decorators/roles.decorator';

interface UsuarioAutenticado {
  sub: number;
  correo?: string;
  rol?: string;
  estadoAprobacion?: string;
}

interface SolicitudConUsuario extends Request {
  usuario?: UsuarioAutenticado;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const solicitud = context
      .switchToHttp()
      .getRequest<SolicitudConUsuario>();

    const usuario = solicitud.usuario;

    if (!usuario || !rolesPermitidos.includes(usuario.rol ?? '')) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción.',
      );
    }

    return true;
  }
}
