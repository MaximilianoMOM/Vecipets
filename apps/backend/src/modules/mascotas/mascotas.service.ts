import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { ReportType } from '@prisma/client';

@Injectable()
export class MascotasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateMascotaDto) {
    return this.prisma.pet.create({
      data: {
        usuarioId,
        nombre: dto.nombre,
        especie: dto.especie,
        raza: dto.raza,
        edadAprox: dto.edadAprox,
        color: dto.color,
        caracteristicas: dto.caracteristicas,
        fotoUrl: dto.fotoUrl,
      },
    });
  }

  async findByUsuario(usuarioId: string) {
    return this.prisma.pet.findMany({
      where: {
        usuarioId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, usuarioId: string) {
    const mascota = await this.prisma.pet.findFirst({
      where: {
        id,
        usuarioId,
      },
    });

    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return mascota;
  }

  async findReportedPets(
    tipo?: string,
    especie?: string,
    raza?: string,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    let reportType: ReportType | undefined;

    if (tipo) {
      if (!Object.values(ReportType).includes(tipo as ReportType)) {
        throw new BadRequestException(
          'El tipo de reporte debe ser PERDIDA o HALLAZGO',
        );
      }

      reportType = tipo as ReportType;
    }

    const fechaFilter: any = {};

    if (fechaDesde) {
      fechaFilter.gte = new Date(`${fechaDesde}T00:00:00`);
    }

    if (fechaHasta) {
      fechaFilter.lte = new Date(`${fechaHasta}T23:59:59`);
    }

    return this.prisma.pet.findMany({
      where: {
        ...(especie
          ? {
              especie: {
                equals: especie,
                mode: 'insensitive',
              },
            }
          : {}),

        ...(raza
          ? {
              raza: {
                equals: raza,
                mode: 'insensitive',
              },
            }
          : {}),

        reportes: {
          some: {
            ...(reportType
              ? {
                  tipo: reportType,
                }
              : {}),

            ...(fechaDesde || fechaHasta
              ? {
                  fechaAcontecimiento: fechaFilter,
                }
              : {}),
          },
        },
      },

      include: {
        reportes: {
          orderBy: {
            fechaAcontecimiento: 'desc',
          },
          take: 1,
          select: {
            id: true,
            tipo: true,
            estado: true,
            titulo: true,
            descripcion: true,
            fechaAcontecimiento: true,
            ubicacion: {
              select: {
                direccion: true,
                comuna: true,
                barrio: true,
                latitud: true,
                longitud: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}