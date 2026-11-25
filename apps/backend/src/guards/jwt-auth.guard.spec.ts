import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';
import type { UsuariosService } from '../usuarios/usuarios.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('bloquea una sesión existente mientras la cuenta está suspendida', async () => {
    const request = { cookies: { vecipets_access_token: 'sesion-existente' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
    const jwt = {
      verifyAsync: vi.fn().mockResolvedValue({ sub: 7, rol: 'ADMINISTRADOR' }),
    } as unknown as JwtService;
    const cuenta = {
      id: 7,
      correo: 'cuenta@example.test',
      rol: 'CIUDADANO',
      correoVerificado: true,
      estadoAprobacion: 'INACTIVO',
    };
    const usuarios = {
      obtenerPorId: vi.fn().mockResolvedValue(cuenta),
    } as unknown as UsuariosService;
    const guard = new JwtAuthGuard(jwt, usuarios);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
    expect(request).not.toHaveProperty('usuario');

    cuenta.estadoAprobacion = 'APROBADO';
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toHaveProperty('usuario.rol', 'CIUDADANO');
  });
});
