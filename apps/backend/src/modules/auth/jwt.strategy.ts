import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { RoleName } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor() {
    // =========================
    // COMPROBAR JWT_SECRET
    // =========================

    console.log(
      '🔐 JWT Strategy - secret cargado:',
      !!process.env.JWT_SECRET,
      'longitud:',
      process.env.JWT_SECRET?.length,
    );

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_SECRET || 'SecretKey',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    // =========================
    // VERIFICAR USUARIO
    // =========================

    if (!payload || !payload.sub) {
      throw new UnauthorizedException(
        'Token inválido: usuario no identificado',
      );
    }

    // =========================
    // VERIFICAR CORREO
    // =========================

    if (!payload.email) {
      throw new UnauthorizedException(
        'Token inválido: correo no identificado',
      );
    }

    // =========================
    // VERIFICAR ROL
    // =========================

    if (!payload.role) {
      throw new UnauthorizedException(
        'Token inválido: rol no identificado',
      );
    }

    // =========================
    // VERIFICAR QUE EL ROL EXISTA
    // =========================

    const rolesValidos =
      Object.values(RoleName);

    if (
      !rolesValidos.includes(
        payload.role as RoleName,
      )
    ) {
      throw new UnauthorizedException(
        'Token inválido: rol no válido',
      );
    }

    // =========================
    // INFORMACIÓN PARA req.user
    // =========================

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as RoleName,
    };
  }
}