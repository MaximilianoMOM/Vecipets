
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { RoleName, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtener solicitudes pendientes de refugios y veterinarias
   */
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
        createdAt: 'asc',
      },
    });
  }

  /**
   * Aprobar una solicitud
   */
  async aprobarSolicitud(
    userId: string,
  ) {
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

    if (
      usuario.role.nombre !== RoleName.REFUGIO &&
      usuario.role.nombre !== RoleName.VETERINARIA
    ) {
      throw new ForbiddenException(
        'Este usuario no corresponde a un refugio o veterinaria',
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

  /**
   * Rechazar una solicitud
   */
  async rechazarSolicitud(
    userId: string,
  ) {
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

    if (
      usuario.role.nombre !== RoleName.REFUGIO &&
      usuario.role.nombre !== RoleName.VETERINARIA
    ) {
      throw new ForbiddenException(
        'Este usuario no corresponde a un refugio o veterinaria',
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
}

