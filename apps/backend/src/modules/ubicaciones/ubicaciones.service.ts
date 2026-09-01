import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';

@Injectable()
export class UbicacionesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUbicacionDto) {
    return this.prisma.location.create({
      data: {
        direccion: dto.direccion,
        comuna: dto.comuna,
        barrio: dto.barrio,
        latitud: dto.latitud,
        longitud: dto.longitud,
      },
    });
  }

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const ubicacion =
      await this.prisma.location.findUnique({
        where: {
          id,
        },
      });

    if (!ubicacion) {
      throw new NotFoundException(
        'Ubicación no encontrada',
      );
    }

    return ubicacion;
  }
}