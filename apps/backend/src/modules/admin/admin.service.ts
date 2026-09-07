import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  RoleName,
  UserStatus,
} from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // OBTENER SOLICITUDES PENDIENTES
  // =====================================================

  async obtenerSolicitudesPendientes() {
    return this.prisma.user.findMany({
      where: {
        estado: UserStatus.PENDIENTE,
        role: {
          nombre: {
            in: [
              RoleName.REFUGIO,
              RoleName.VETERINARIA,
            ],
          },
        },
      },
      include: {
        role: true,
        refugio: {
          include: {
            ubicacion: true,
          },
        },
        veterinaria: {
          include: {
            ubicacion: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =====================================================
  // APROBAR SOLICITUD
  // =====================================================

  async aprobarSolicitud(userId: string) {
    const usuario = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    if (usuario.estado !== UserStatus.PENDIENTE) {
      throw new ForbiddenException(
        'Esta solicitud ya fue procesada',
      );
    }

    const usuarioActualizado =
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          estado: UserStatus.APROBADO,
          activo: true,
        },
        include: {
          role: true,
        },
      });

    return {
      message: 'Solicitud aprobada correctamente',
      usuario: usuarioActualizado,
    };
  }

  // =====================================================
  // RECHAZAR SOLICITUD
  // =====================================================

  async rechazarSolicitud(userId: string) {
    const usuario = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    if (usuario.estado !== UserStatus.PENDIENTE) {
      throw new ForbiddenException(
        'Esta solicitud ya fue procesada',
      );
    }

    const usuarioActualizado =
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          estado: UserStatus.RECHAZADO,
          activo: false,
        },
        include: {
          role: true,
        },
      });

    return {
      message: 'Solicitud rechazada correctamente',
      usuario: usuarioActualizado,
    };
  }

  // =====================================================
  // OBTENER USUARIOS ACTIVOS
  // =====================================================

  async obtenerUsuariosActivos() {
    const usuarios =
      await this.prisma.user.findMany({
        where: {
          activo: true,
        },
        include: {
          role: true,

          mascotas: true,

          reportes: {
            include: {
              mascota: true,
              ubicacion: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      estado: usuario.estado,
      createdAt: usuario.createdAt,

      role: {
        nombre: usuario.role.nombre,
        descripcion:
          usuario.role.descripcion,
      },

      cantidadMascotas:
        usuario.mascotas.length,

      cantidadReportes:
        usuario.reportes.length,

      mascotas: usuario.mascotas,

      reportes: usuario.reportes,
    }));
  }

  // =====================================================
  // OBTENER USUARIO ACTIVO POR ID
  // =====================================================

  async obtenerUsuarioActivoPorId(
    userId: string,
  ) {
    const usuario =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          role: true,

          mascotas: true,

          reportes: {
            include: {
              mascota: true,
              ubicacion: true,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    if (!usuario.activo) {
      throw new ForbiddenException(
        'El usuario no está activo',
      );
    }

    return {
      id: usuario.id,
      nombreCompleto:
        usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      estado: usuario.estado,
      createdAt: usuario.createdAt,

      role: {
        nombre: usuario.role.nombre,
        descripcion:
          usuario.role.descripcion,
      },

      cantidadMascotas:
        usuario.mascotas.length,

      cantidadReportes:
        usuario.reportes.length,

      mascotas: usuario.mascotas,

      reportes: usuario.reportes,
    };
  }

  // =====================================================
  // ELIMINAR USUARIO
  // =====================================================
  // Eliminación lógica:
  // activo = false
  //
  // NO se elimina físicamente de PostgreSQL.
  // =====================================================

  async eliminarUsuario(userId: string) {
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
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    // No permitir eliminar administradores
    if (
      usuario.role.nombre ===
      RoleName.ADMINISTRADOR
    ) {
      throw new ForbiddenException(
        'No se puede eliminar un usuario administrador',
      );
    }

    // Evitar eliminar nuevamente un usuario
    // que ya está desactivado
    if (!usuario.activo) {
      throw new ForbiddenException(
        'Este usuario ya está eliminado',
      );
    }

    // Eliminación lógica
    const usuarioActualizado =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          activo: false,
        },

        include: {
          role: true,
        },
      });

    return {
      message:
        'Usuario eliminado correctamente',

      usuario: usuarioActualizado,
    };
  }
}