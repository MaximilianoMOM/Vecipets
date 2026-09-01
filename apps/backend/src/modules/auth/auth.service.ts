import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTRO
  // =========================

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado',
      );
    }

    const ciudadanoRole = await this.prisma.role.findUnique({
      where: { nombre: RoleName.CIUDADANO },
    });

    if (!ciudadanoRole) {
      throw new BadRequestException(
        'El rol inicial de CIUDADANO no se encuentra disponible',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        passwordHash,
        telefono: dto.telefono,
        roleId: ciudadanoRole.id,
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        telefono: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      RoleName.CIUDADANO,
    );

    return {
      message: 'Usuario registrado exitosamente',
      user,
      ...tokens,
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role.nombre,
    );

    return {
      message: 'Inicio de sesión exitoso',

      usuario: {
        id: user.id,
        nombre: user.nombreCompleto,
        email: user.email,
        rol: user.role.nombre,
      },

      ...tokens,
    };
  }

  // =========================
  // SOLICITAR RECUPERACIÓN
  // =========================

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    // Invalidar códigos anteriores
    await this.prisma.passwordResetCode.updateMany({
      where: {
        usuarioId: user.id,
        usado: false,
      },
      data: {
        usado: true,
      },
    });

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // El código dura 10 minutos
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    await this.prisma.passwordResetCode.create({
      data: {
        usuarioId: user.id,
        codigo,
        expiresAt,
      },
    });

    // TEMPORAL:
    // Lo mostramos en consola para comprobar que funciona.
    // Después lo enviaremos al correo electrónico.
    console.log('');
    console.log('====================================');
    console.log('🔐 CÓDIGO DE RECUPERACIÓN');
    console.log(`📧 Correo: ${user.email}`);
    console.log(`🔢 Código: ${codigo}`);
    console.log(`⏰ Expira: ${expiresAt.toLocaleString()}`);
    console.log('====================================');
    console.log('');

    return {
      message:
        'Se ha generado un código de recuperación. Revisa tu correo electrónico.',
    };
  }

  // =========================
  // VERIFICAR CÓDIGO
  // =========================

  async verifyResetCode(dto: VerifyResetCodeDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    const resetCode =
      await this.prisma.passwordResetCode.findFirst({
        where: {
          usuarioId: user.id,
          codigo: dto.codigo,
          usado: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!resetCode) {
      throw new BadRequestException(
        'El código de recuperación no es válido',
      );
    }

    if (resetCode.expiresAt < new Date()) {
      throw new BadRequestException(
        'El código de recuperación ha expirado',
      );
    }

    return {
      message: 'Código verificado correctamente',
      valido: true,
    };
  }

  // =========================
  // CAMBIAR CONTRASEÑA
  // =========================

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    const resetCode =
      await this.prisma.passwordResetCode.findFirst({
        where: {
          usuarioId: user.id,
          codigo: dto.codigo,
          usado: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!resetCode) {
      throw new BadRequestException(
        'El código de recuperación no es válido',
      );
    }

    if (resetCode.expiresAt < new Date()) {
      throw new BadRequestException(
        'El código de recuperación ha expirado',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
        },
      }),

      this.prisma.passwordResetCode.update({
        where: {
          id: resetCode.id,
        },
        data: {
          usado: true,
        },
      }),
    ]);

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  // =========================
  // GENERAR TOKENS
  // =========================

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload, {
        secret:
          process.env.JWT_SECRET || 'SecretKey',
        expiresIn: '15m',
      });

    const refreshToken =
      await this.jwtService.signAsync(payload, {
        secret:
          process.env.REFRESH_TOKEN_SECRET ||
          'RefreshSecretKey',
        expiresIn: '7d',
      });

    return {
      accessToken,
      refreshToken,
    };
  }
}