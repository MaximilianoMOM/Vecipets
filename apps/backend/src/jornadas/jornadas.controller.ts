import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Jornada } from './jornada.entity';
import { JornadasService } from './jornadas.service';

import { CrearJornadaDto } from './crear-jornada.dto';
import { CrearReservaJornadaDto } from './dto/crear-reserva-jornada.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { Roles } from '../usuarios/decorators/roles.decorator';
import { UsuarioAutenticado } from '../usuarios/decorators/usuario-autenticado.decorator';

import { UsuariosService } from '../usuarios/usuarios.service';
import {
  calcularApartadoCentavos,
  calcularSaldoPendienteCentavos,
} from './tarifas-jornada.util';

interface UsuarioSesion {
  sub: number;
  rol?: string;
}

const fechaColombia = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeZone: 'America/Bogota',
});

const horaColombia = new Intl.DateTimeFormat('es-CO', {
  timeStyle: 'short',
  timeZone: 'America/Bogota',
});

@Controller('jornadas')
export class JornadasController {
  constructor(
    @InjectRepository(Jornada)
    private readonly jornadas: Repository<Jornada>,

    private readonly usuarios: UsuariosService,

    private readonly jornadasService: JornadasService,
  ) {}

  // ==========================================
  // CALCULAR APARTADO
  // ==========================================

  private calcularApartadoCentavos(
    precioCentavos: number,
  ): number {
    return calcularApartadoCentavos(precioCentavos);
  }

  // ==========================================
  // SERIALIZAR JORNADA
  // ==========================================

  private serializarJornada(jornada: Jornada) {
    const apartadoCentavos =
      this.calcularApartadoCentavos(
        jornada.precioProcedimientoCentavos,
      );

    return {
      id: jornada.id,
      titulo: jornada.titulo,
      veterinaria: jornada.veterinaria,
      comuna: jornada.comuna,
      direccion: jornada.direccion,

      fechaInicio: jornada.fechaInicio,
      fechaFin: jornada.fechaFin,

      fechaTexto: jornada.fechaTexto,
      horaTexto: jornada.horaTexto,

      precioProcedimientoCentavos:
        jornada.precioProcedimientoCentavos,

      precioApartadoCentavos: apartadoCentavos,

      cuposTotales: jornada.cuposTotales,
      cuposDisponibles: jornada.cuposDisponibles,

      imagenUrl: jornada.imagenUrl,
      destacado: jornada.destacado,
      activa: jornada.activa,

      // Compatibilidad con el frontend de dev.

      inicio: jornada.fechaInicio,
      fin: jornada.fechaFin,
      cupos: jornada.cuposDisponibles,

      precioCop:
        jornada.precioProcedimientoCentavos / 100,

      precioApartadoCop: apartadoCentavos / 100,
    };
  }

  // ==========================================
  // LISTAR JORNADAS PÚBLICAS
  // ==========================================

  @Get()
  async listar() {
    const jornadas = await this.jornadas
      .createQueryBuilder('jornada')
      .innerJoin('jornada.organizador', 'organizador')
      .where('jornada.fechaFin > :ahora', {
        ahora: new Date(),
      })
      .andWhere('jornada.activa = true')
      .andWhere(
        'organizador.estadoAprobacion = :estado',
        { estado: 'APROBADO' },
      )
      .orderBy('jornada.fechaInicio', 'ASC')
      .addOrderBy('jornada.id', 'ASC')
      .getMany();

    return jornadas.map((jornada) =>
      this.serializarJornada(jornada),
    );
  }

  // ==========================================
  // PUBLICAR JORNADA
  // VETERINARIAS Y REFUGIOS
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA', 'REFUGIO')
  async publicar(
    @Body() datos: CrearJornadaDto,
    @UsuarioAutenticado() veterinaria: UsuarioSesion,
  ) {
    const inicio = new Date(datos.inicio);
    const fin = new Date(datos.fin);

    if (!(inicio.getTime() > Date.now())) {
      throw new BadRequestException(
        'La jornada debe comenzar en una fecha y hora futuras.',
      );
    }

    if (!(fin.getTime() > inicio.getTime())) {
      throw new BadRequestException(
        'La fecha y hora de cierre deben ser posteriores al inicio.',
      );
    }

    if (
      !Number.isSafeInteger(datos.cupos) ||
      datos.cupos <= 0
    ) {
      throw new BadRequestException(
        'La cantidad de cupos debe ser mayor a cero.',
      );
    }

    const cuenta = await this.usuarios.obtenerPorId(
      veterinaria.sub,
    );

    if (!cuenta) {
      throw new NotFoundException(
        'No se encontró la cuenta organizadora.',
      );
    }

    if (
      (cuenta.rol !== 'VETERINARIA' && cuenta.rol !== 'REFUGIO') ||
      cuenta.estadoAprobacion !== 'APROBADO'
    ) {
      throw new ForbiddenException(
        'La entidad no está autorizada para publicar jornadas.',
      );
    }

    if (!cuenta.correoVerificado) {
      throw new ForbiddenException(
        'Debes verificar tu correo electrónico.',
      );
    }

    const precioCentavos = Math.round(
      datos.precioCop * 100,
    );

    const precioApartadoCentavos =
      this.calcularApartadoCentavos(precioCentavos);

    const jornada = await this.jornadas.save(
      this.jornadas.create({
        titulo: datos.titulo,
        comuna: datos.comuna,
        direccion: datos.direccion,

        fechaInicio: inicio,
        fechaFin: fin,

        organizadorId: cuenta.id,
        veterinaria: cuenta.nombre,

        fechaTexto: fechaColombia.format(inicio),
        horaTexto: horaColombia.formatRange(
          inicio,
          fin,
        ),

        cuposTotales: datos.cupos,
        cuposDisponibles: datos.cupos,

        precioProcedimientoCentavos:
          precioCentavos,

        precioApartadoCentavos,

        imagenUrl: null,
        destacado: false,
        activa: true,
      }),
    );

    return {
      id: jornada.id,
      mensaje: 'Jornada publicada correctamente.',
    };
  }

  // ==========================================
  // RESERVAR CUPO
  // SOLO CIUDADANOS
  // ==========================================

  @Post('reservar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CIUDADANO')
  async crearReserva(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Body() dto: CrearReservaJornadaDto,
  ) {
    return this.jornadasService.crearReserva(
      usuario.sub,
      dto,
    );
  }

  // ==========================================
  // CONSULTAR ESTADO DE RESERVA Y PAGO
  // ==========================================

  @Get('reservas/:reservaId/estado')
  @UseGuards(JwtAuthGuard)
  async verificarEstadoReserva(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('reservaId', ParseIntPipe)
    reservaId: number,
  ) {
    return this.jornadasService.verificarEstadoReserva(
      usuario.sub,
      reservaId,
    );
  }

  // ==========================================
  // CONSULTAR MIS RESERVAS (CIUDADANO)
  // ==========================================

  @Get('mis-reservas')
  @UseGuards(JwtAuthGuard)
  async misReservas(
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    return this.jornadasService.consultarMisReservas(
      usuario.sub,
    );
  }

  // ==========================================
  // CONSULTAR JORNADAS DEL ORGANIZADOR
  // ==========================================

  @Get('organizador/mis-jornadas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VETERINARIA', 'REFUGIO', 'ADMINISTRADOR')
  async misJornadas(
    @UsuarioAutenticado() usuario: UsuarioSesion,
  ) {
    return this.jornadasService.consultarJornadasOrganizador(
      usuario.sub,
    );
  }

  // ==========================================
  // CONSULTAR RESERVAS DE UNA JORNADA
  // ==========================================

  @Get(':id/reservas')
  @UseGuards(JwtAuthGuard)
  async reservasDeJornada(
    @UsuarioAutenticado() usuario: UsuarioSesion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const esAdmin = usuario.rol === 'ADMINISTRADOR';
    return this.jornadasService.consultarReservasDeJornada(
      usuario.sub,
      id,
      esAdmin,
    );
  }

  // ==========================================
  // CONSULTAR JORNADA POR ID
  // ==========================================

  @Get(':id')
  async obtenerJornada(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const jornada = await this.jornadas.findOne({
      where: {
        id,
        activa: true,
        organizador: {
          estadoAprobacion: 'APROBADO' as any,
        },
      },
    });

    if (
      !jornada ||
      new Date(jornada.fechaFin) <= new Date()
    ) {
      throw new NotFoundException(
        'Jornada no encontrada o no disponible.',
      );
    }

    return this.serializarJornada(jornada);
  }
}