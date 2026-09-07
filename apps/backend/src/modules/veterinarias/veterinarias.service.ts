import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VeterinariasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtener todas las veterinarias
   */
  async obtenerVeterinarias() {
    return this.prisma.veterinary.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            telefono: true,
            activo: true,
            estado: true,
            createdAt: true,
            role: {
              select: {
                nombre: true,
                descripcion: true,
              },
            },
          },
        },

        ubicacion: {
          select: {
            id: true,
            direccion: true,
            comuna: true,
            barrio: true,
            latitud: true,
            longitud: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtener una veterinaria por ID
   */
  async obtenerVeterinariaPorId(id: string) {
    const veterinaria =
      await this.prisma.veterinary.findUnique({
        where: {
          id,
        },

        include: {
          usuario: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
              telefono: true,
              activo: true,
              estado: true,
              createdAt: true,
              role: {
                select: {
                  nombre: true,
                  descripcion: true,
                },
              },
            },
          },

          ubicacion: {
            select: {
              id: true,
              direccion: true,
              comuna: true,
              barrio: true,
              latitud: true,
              longitud: true,
            },
          },
        },
      });

    if (!veterinaria) {
      throw new NotFoundException(
        'Veterinaria no encontrada',
      );
    }

    return veterinaria;
  }

  /**
   * Obtener estadísticas generales
   */
  async obtenerEstadisticas() {
    const [
      totalVeterinarias,
      veterinariasActivas,
      veterinariasConUrgencias,
    ] = await Promise.all([
      this.prisma.veterinary.count(),

      this.prisma.veterinary.count({
        where: {
          usuario: {
            activo: true,
          },
        },
      }),

      this.prisma.veterinary.count({
        where: {
          urgencias24h: true,
        },
      }),
    ]);

    return {
      totalVeterinarias,
      veterinariasActivas,
      veterinariasConUrgencias,
    };
  }
}