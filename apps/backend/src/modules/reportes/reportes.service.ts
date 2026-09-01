import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { ReportStatus, RoleName } from '@prisma/client';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateReporteDto) {
    // Verificar que la mascota existe
    const mascota = await this.prisma.pet.findUnique({
      where: {
        id: dto.mascotaId,
      },
    });

    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }

    // Crear el reporte
    const reporte = await this.prisma.report.create({
      data: {
        usuarioId,
        mascotaId: dto.mascotaId,
        ubicacionId: dto.ubicacionId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaAcontecimiento: new Date(dto.fechaAcontecimiento),
        estado: ReportStatus.PENDIENTE,

        imagenes: dto.imagenUrl
          ? {
              create: {
                url: dto.imagenUrl,
                publicId: dto.imagenPublicId || '',
              },
            }
          : undefined,
      },

      include: {
        mascota: true,
        ubicacion: true,
        imagenes: true,
      },
    });

    return reporte;
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        mascota: true,
        ubicacion: true,
        imagenes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async marcarComoResuelto(
    reporteId: string,
    usuarioId: string,
  ) {
    // Buscar el reporte junto con la mascota y el dueño
    const reporte = await this.prisma.report.findUnique({
      where: {
        id: reporteId,
      },
      include: {
        mascota: {
          include: {
            usuario: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!reporte) {
      throw new NotFoundException('Reporte no encontrado');
    }

    // Verificar que la mascota exista
    if (!reporte.mascota) {
      throw new NotFoundException(
        'El reporte no tiene una mascota asociada',
      );
    }

    const usuarioActual = await this.prisma.user.findUnique({
      where: {
        id: usuarioId,
      },
      include: {
        role: true,
      },
    });

    if (!usuarioActual) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esDueno =
      reporte.mascota.usuarioId === usuarioId;

    const esRefugio =
      usuarioActual.role.nombre === RoleName.REFUGIO;

    const esVeterinaria =
      usuarioActual.role.nombre === RoleName.VETERINARIA;

    // Solamente dueño, refugio o veterinaria
    if (!esDueno && !esRefugio && !esVeterinaria) {
      throw new ForbiddenException(
        'No tienes permisos para marcar esta mascota como encontrada',
      );
    }

    return this.prisma.report.update({
      where: {
        id: reporteId,
      },

      data: {
        estado: ReportStatus.RESUELTO,
      },

      include: {
        mascota: true,
        ubicacion: true,
        imagenes: true,
      },
    });
  }
}