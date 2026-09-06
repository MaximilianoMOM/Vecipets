
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
    const email = dto.email.trim().toLowerCase();

    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: {
        nombre: dto.rol,
      },
    });

    if (!role) {
      throw new BadRequestException(
        `El rol ${dto.rol} no se encuentra disponible`,
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    // =========================
    // CIUDADANO
    // =========================

    if (dto.rol === RoleName.CIUDADANO) {
      const user =
        await this.prisma.user.create({
          data: {
            nombreCompleto:
              dto.nombreCompleto,
            email,
            passwordHash,
            telefono: dto.telefono,
            roleId: role.id,
            estado: 'APROBADO',
            activo: true,
          },

          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            telefono: true,
            estado: true,
            createdAt: true,
          },
        });

      const tokens =
        await this.generateTokens(
          user.id,
          user.email,
          RoleName.CIUDADANO,
        );

      return {
        message:
          'Usuario registrado exitosamente',
        user,
        ...tokens,
      };
    }

    // =========================
    // REFUGIO / VETERINARIA
    // =========================

    if (
      dto.rol !== RoleName.REFUGIO &&
      dto.rol !== RoleName.VETERINARIA
    ) {
      throw new BadRequestException(
        'El rol seleccionado no es válido',
      );
    }

    // =========================
    // VALIDAR UBICACIÓN
    // =========================

    if (
      !dto.direccion ||
      !dto.comuna ||
      !dto.barrio ||
      !dto.latitud ||
      !dto.longitud
    ) {
      throw new BadRequestException(
        'La dirección, comuna, barrio, latitud y longitud son obligatorios',
      );
    }

    const latitud = Number(dto.latitud);
    const longitud = Number(dto.longitud);

    if (
      Number.isNaN(latitud) ||
      Number.isNaN(longitud)
    ) {
      throw new BadRequestException(
        'La latitud y longitud deben ser números válidos',
      );
    }

    // =========================
    // CREAR SOLICITUD
    // =========================

    const resultado =
      await this.prisma.$transaction(
        async (tx) => {
          // Crear usuario pendiente
          const user =
            await tx.user.create({
              data: {
                nombreCompleto:
                  dto.nombreCompleto,
                email,
                passwordHash,
                telefono: dto.telefono,
                roleId: role.id,
                estado: 'PENDIENTE',
                activo: true,
              },
            });

          // Crear ubicación
          const ubicacion =
            await tx.location.create({
              data: {
                direccion:
                  dto.direccion,
                comuna: dto.comuna,
                barrio: dto.barrio,
                latitud,
                longitud,
              },
            });

          // =========================
          // CREAR REFUGIO
          // =========================

          if (
            dto.rol === RoleName.REFUGIO
          ) {
            if (
              !dto.nombreRefugio ||
              !dto.capacidadRefugio ||
              !dto.horarioRefugio
            ) {
              throw new BadRequestException(
                'Faltan datos obligatorios del refugio',
              );
            }

            await tx.shelter.create({
              data: {
                usuarioId: user.id,
                ubicacionId:
                  ubicacion.id,
                nombre:
                  dto.nombreRefugio,
                capacidad:
                  dto.capacidadRefugio,
                horario:
                  dto.horarioRefugio,
                sitioWeb:
                  dto.sitioWebRefugio ||
                  null,
              },
            });
          }

          // =========================
          // CREAR VETERINARIA
          // =========================

          if (
            dto.rol ===
            RoleName.VETERINARIA
          ) {
            if (
              !dto.nombreVeterinaria ||
              !dto.horarioVeterinaria
            ) {
              throw new BadRequestException(
                'Faltan datos obligatorios de la veterinaria',
              );
            }

            await tx.veterinary.create({
              data: {
                usuarioId: user.id,
                ubicacionId:
                  ubicacion.id,
                nombre:
                  dto.nombreVeterinaria,
                urgencias24h:
                  dto.urgencias24h ??
                  false,
                horario:
                  dto.horarioVeterinaria,
              },
            });
          }

          // =========================
          // BUSCAR ADMINISTRADORES
          // =========================

          const administradores =
            await tx.user.findMany({
              where: {
                role: {
                  nombre:
                    RoleName.ADMINISTRADOR,
                },
                activo: true,
              },

              select: {
                id: true,
              },
            });

          // =========================
          // NOTIFICAR ADMINISTRADORES
          // =========================

          if (
            administradores.length > 0
          ) {
            await tx.notification.createMany(
              {
                data: administradores.map(
                  (administrador) => ({
                    usuarioId:
                      administrador.id,

                    titulo:
                      dto.rol ===
                      RoleName.REFUGIO
                        ? 'Nueva solicitud de refugio'
                        : 'Nueva solicitud de veterinaria',

                    mensaje:
                      dto.rol ===
                      RoleName.REFUGIO
                        ? `El refugio "${dto.nombreRefugio}" ha enviado una solicitud de registro y está pendiente de aprobación.`
                        : `La veterinaria "${dto.nombreVeterinaria}" ha enviado una solicitud de registro y está pendiente de aprobación.`,
                  }),
                ),
              },
            );
          }

          return {
            id: user.id,
            nombreCompleto:
              user.nombreCompleto,
            email: user.email,
            telefono: user.telefono,
            rol: dto.rol,
            estado: user.estado,
            createdAt:
              user.createdAt,
          };
        },
      );

    // =========================
    // RESPUESTA
    // =========================

    return {
      message:
        dto.rol === RoleName.REFUGIO
          ? 'Solicitud de refugio enviada correctamente. Está pendiente de aprobación por un administrador.'
          : 'Solicitud de veterinaria enviada correctamente. Está pendiente de aprobación por un administrador.',

      user: resultado,
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    if (!user.activo) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra desactivada',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // =========================
    // CONTROL DE APROBACIÓN
    // =========================

    if (
      user.role.nombre !==
        RoleName.CIUDADANO &&
      user.role.nombre !==
        RoleName.ADMINISTRADOR &&
      user.estado !== 'APROBADO'
    ) {
      if (
        user.estado === 'PENDIENTE'
      ) {
        throw new UnauthorizedException(
          'Tu cuenta está pendiente de aprobación por el administrador',
        );
      }

      if (
        user.estado === 'RECHAZADO'
      ) {
        throw new UnauthorizedException(
          'Tu solicitud fue rechazada por el administrador',
        );
      }

      throw new UnauthorizedException(
        'Tu cuenta no está habilitada para iniciar sesión',
      );
    }

    const tokens =
      await this.generateTokens(
        user.id,
        user.email,
        user.role.nombre,
      );

    return {
      message:
        'Inicio de sesión exitoso',

      usuario: {
        id: user.id,
        nombre:
          user.nombreCompleto,
        email: user.email,
        telefono:
          user.telefono,
        rol: user.role.nombre,
        estado: user.estado,
        activo: user.activo,
      },

      ...tokens,
    };
  }

  // =========================
  // PERFIL
  // =========================

  async perfil(userId: string) {
    const usuario =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          role: true,
        },
      });

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    return {
      id: usuario.id,
      nombre:
        usuario.nombreCompleto,
      email: usuario.email,
      telefono:
        usuario.telefono,
      rol: usuario.role.nombre,
      estado: usuario.estado,
      activo: usuario.activo,
    };
  }

  // =========================
  // RECUPERAR CONTRASEÑA
  // =========================

  async forgotPassword(
    dto: ForgotPasswordDto,
  ) {
    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    await this.prisma.passwordResetCode.updateMany(
      {
        where: {
          usuarioId: user.id,
          usado: false,
        },

        data: {
          usado: true,
        },
      },
    );

    const codigo = Math.floor(
      100000 +
        Math.random() * 900000,
    ).toString();

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000,
    );

    await this.prisma.passwordResetCode.create(
      {
        data: {
          usuarioId: user.id,
          codigo,
          expiresAt,
        },
      },
    );

    console.log('');
    console.log(
      '====================================',
    );
    console.log(
      '🔐 CÓDIGO DE RECUPERACIÓN',
    );
    console.log(
      `📧 Correo: ${user.email}`,
    );
    console.log(
      `🔢 Código: ${codigo}`,
    );
    console.log(
      `⏰ Expira: ${expiresAt.toLocaleString()}`,
    );
    console.log(
      '====================================',
    );
    console.log('');

    return {
      message:
        'Se ha generado un código de recuperación. Revisa tu correo electrónico.',
    };
  }

  // =========================
  // VERIFICAR CÓDIGO
  // =========================

  async verifyResetCode(
    dto: VerifyResetCodeDto,
  ) {
    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    const resetCode =
      await this.prisma.passwordResetCode.findFirst(
        {
          where: {
            usuarioId: user.id,
            codigo: dto.codigo,
            usado: false,
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      );

    if (!resetCode) {
      throw new BadRequestException(
        'El código de recuperación no es válido',
      );
    }

    if (
      resetCode.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El código de recuperación ha expirado',
      );
    }

    return {
      message:
        'Código verificado correctamente',
      valido: true,
    };
  }

  // =========================
  // CAMBIAR CONTRASEÑA
  // =========================

  async resetPassword(
    dto: ResetPasswordDto,
  ) {
    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new BadRequestException(
        'No existe una cuenta registrada con este correo',
      );
    }

    const resetCode =
      await this.prisma.passwordResetCode.findFirst(
        {
          where: {
            usuarioId: user.id,
            codigo: dto.codigo,
            usado: false,
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      );

    if (!resetCode) {
      throw new BadRequestException(
        'El código de recuperación no es válido',
      );
    }

    if (
      resetCode.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El código de recuperación ha expirado',
      );
    }

    const passwordHash =
      await bcrypt.hash(
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
      message:
        'Contraseña actualizada correctamente',
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
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_SECRET ||
            'SecretKey',

          expiresIn: '15m',
        },
      );

    const refreshToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env
              .REFRESH_TOKEN_SECRET ||
            'RefreshSecretKey',

          expiresIn: '7d',
        },
      );

    return {
      accessToken,
      refreshToken,
    };
  }
}

