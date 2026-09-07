import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefugiosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async obtenerRefugios() {
    return this.prisma.shelter.findMany({
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

  async obtenerRefugioPorId(id: string) {
    const refugio =
      await this.prisma.shelter.findUnique({
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

    if (!refugio) {
      throw new NotFoundException(
        'Refugio no encontrado',
      );
    }

    return refugio;
  }

  async obtenerEstadisticas() {
    const [
      totalRefugios,
      refugiosActivos,
      capacidadTotal,
    ] = await Promise.all([
      this.prisma.shelter.count(),

      this.prisma.shelter.count({
        where: {
          usuario: {
            activo: true,
          },
        },
      }),

      this.prisma.shelter.aggregate({
        _sum: {
          capacidad: true,
        },
      }),
    ]);

    return {
      totalRefugios,
      refugiosActivos,
      capacidadTotal:
        capacidadTotal._sum.capacidad ?? 0,
    };
  }
}