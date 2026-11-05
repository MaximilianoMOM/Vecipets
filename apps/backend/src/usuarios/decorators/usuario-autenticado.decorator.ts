
import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

interface SolicitudAutenticada extends Request {
  usuario?: {
    sub: number;
    correo?: string;
    rol?: string;
  };
}

export const UsuarioAutenticado = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext) => {
    const solicitud = contexto
      .switchToHttp()
      .getRequest<SolicitudAutenticada>();

    return solicitud.usuario;
  },
);
