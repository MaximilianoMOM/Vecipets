import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { RoleName } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();

    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException(
        'Usuario no identificado',
      );
    }

    if (
      usuario.role !== RoleName.ADMINISTRADOR
    ) {
      throw new ForbiddenException(
        'No tienes permisos de administrador',
      );
    }

    return true;
  }
}