import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import {
  ReportStatus,
  ReportType,
  RoleName,
} from '@prisma/client';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREAR REPORTE
  // =========================================================

  async create(usuarioId: string, dto: CreateReporteDto) {
    const mascota = await this.prisma.pet.findUnique({
      where: {
        id: dto.mascotaId,
      },
    });

    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }

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

  // =========================================================
  // OBTENER TODOS LOS REPORTES
  // =========================================================

  async findAll(
    tipo?: string,
    especie?: string,
    q?: string,
  ) {
    let reportType: ReportType | undefined;

    // Validar tipo
    if (tipo) {
      if (
        !Object.values(ReportType).includes(
          tipo as ReportType,
        )
      ) {
        throw new ForbiddenException(
          'El tipo de reporte debe ser PERDIDA o HALLAZGO',
        );
      }

      reportType = tipo as ReportType;
    }

    const busqueda = q?.trim();

    const reportes = await this.prisma.report.findMany({
      where: {
        // Filtro por tipo
        ...(reportType
          ? {
              tipo: reportType,
            }
          : {}),

        // Filtro por especie
        ...(especie
          ? {
              mascota: {
                especie: {
                  equals: especie,
                  mode: 'insensitive',
                },
              },
            }
          : {}),

        // Búsqueda general
        ...(busqueda
          ? {
              OR: [
                {
                  titulo: {
                    contains: busqueda,
                    mode: 'insensitive',
                  },
                },
                {
                  descripcion: {
                    contains: busqueda,
                    mode: 'insensitive',
                  },
                },
                {
                  mascota: {
                    nombre: {
                      contains: busqueda,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  mascota: {
                    raza: {
                      contains: busqueda,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  ubicacion: {
                    direccion: {
                      contains: busqueda,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  ubicacion: {
                    barrio: {
                      contains: busqueda,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  ubicacion: {
                    comuna: {
                      contains: busqueda,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        mascota: true,
        ubicacion: true,
        imagenes: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convertir la información de Prisma
    // al formato que utiliza el frontend
    return reportes.map((reporte) => ({
      id: reporte.id,

      titulo: reporte.titulo,

      nombreMascota:
        reporte.mascota?.nombre || 'Sin nombre',

      especie:
        reporte.mascota?.especie || 'OTRO',

      raza:
        reporte.mascota?.raza || '',

      color:
        reporte.mascota?.color || '',

      tipo: reporte.tipo,

      estado: reporte.estado,

      descripcion: reporte.descripcion,

      fotoUrl:
        reporte.imagenes?.[0]?.url || '',

      ubicacion:
        reporte.ubicacion?.direccion ||
        reporte.ubicacion?.barrio ||
        reporte.ubicacion?.comuna ||
        'Ubicación no disponible',

      ciudad:
        reporte.ubicacion?.comuna || '',

      latitud:
        reporte.ubicacion?.latitud
          ? Number(reporte.ubicacion.latitud)
          : 0,

      longitud:
        reporte.ubicacion?.longitud
          ? Number(reporte.ubicacion.longitud)
          : 0,

      fechaEvento:
        reporte.fechaAcontecimiento,

      contactoTelefono: '',

      contactoEmail: '',

      recompensa: 0,

      usuarioId:
        reporte.usuarioId,

      createdAt:
        reporte.createdAt,
    }));
  }

  // =========================================================
  // OBTENER UN REPORTE
  // =========================================================

  async findOne(reporteId: string) {
    const reporte = await this.prisma.report.findUnique({
      where: {
        id: reporteId,
      },

      include: {
        mascota: true,
        ubicacion: true,
        imagenes: true,
        evidencias: true,

        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            telefono: true,
          },
        },
      },
    });

    if (!reporte) {
      throw new NotFoundException(
        'Reporte no encontrado',
      );
    }

    return reporte;
  }

  // =========================================================
  // MARCAR REPORTE COMO RESUELTO
  // =========================================================

  async marcarComoResuelto(
    reporteId: string,
    usuarioId: string,
  ) {
    const reporte = await this.prisma.report.findUnique({
      where: {
        id: reporteId,
      },

      include: {
        mascota: true,
      },
    });

    if (!reporte) {
      throw new NotFoundException(
        'Reporte no encontrado',
      );
    }

    const usuario = await this.prisma.user.findUnique({
      where: {
        id: usuarioId,
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

    // El dueño de la mascota puede resolver
    // su propio reporte
    const esDueno =
      reporte.mascota?.usuarioId === usuarioId;

    // El administrador también puede resolverlo
    const esAdministrador =
      usuario.role.nombre === RoleName.ADMINISTRADOR;

    if (!esDueno && !esAdministrador) {
      throw new ForbiddenException(
        'No tienes permisos para marcar este reporte como resuelto',
      );
    }

    const reporteActualizado =
      await this.prisma.report.update({
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

    return reporteActualizado;
  }
}