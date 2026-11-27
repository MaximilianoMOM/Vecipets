import type { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { UsuariosService } from '../usuarios/usuarios.service';
import type { Jornada } from './jornada.entity';
import type { JornadasService } from './jornadas.service';

import { JornadasController } from './jornadas.controller';

it('solo permite editar jornadas propias sin reservas previas', async () => {
  const fechaInicio = new Date(Date.now() + 86_400_000);
  const findOne = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ activa: true, fechaInicio });
  const existsBy = vi.fn().mockResolvedValue(true);
  const save = vi.fn();
  const manager = { findOne, existsBy, save };
  const repository = {
    manager: { transaction: (trabajo: (tx: typeof manager) => Promise<unknown>) => trabajo(manager) },
  } as unknown as Repository<Jornada>;
  const controller = new JornadasController(repository, {} as UsuariosService, {} as JornadasService);
  const datos = {
    titulo: 'Vacunación', comuna: 'Laureles', direccion: 'Medellín',
    inicio: fechaInicio.toISOString(),
    fin: new Date(fechaInicio.getTime() + 3_600_000).toISOString(),
    cupos: 20, precioCop: 0,
  };
  await expect(controller.editar(1, datos, { sub: 7 })).rejects.toBeInstanceOf(NotFoundException);
  await expect(controller.editar(1, datos, { sub: 7 })).rejects.toBeInstanceOf(ConflictException);
  expect(findOne).toHaveBeenCalledWith(expect.anything(), {
    where: { id: 1, organizadorId: 7 }, lock: { mode: 'pessimistic_write' },
  });
  expect(save).not.toHaveBeenCalled();
});

describe('Tarifa de apartado de jornadas', () => {
  it.each([
    [0, 60, 200000],
    [45000, 49, 500000],
    [45000, 50, 500000],
    [45000, 51, 500000],
    [49999, 20, 500000],
    [50000, 20, 1000000],
    [60000, 20, 1000000],
    [100000, 100, 1000000],
  ])(
    'guarda la tarifa para precio %i y %i cupos',
    async (precioCop, cupos, tarifa) => {
      const create = vi.fn(
        (jornada: Partial<Jornada>) => jornada,
      );

      const save = vi.fn().mockResolvedValue({
        id: 1,
      });

      const repository = {
        create,
        save,
      } as unknown as Repository<Jornada>;

      const usuarios = {
        obtenerPorId: vi.fn().mockResolvedValue({
          id: 7,
          nombre: 'Clínica de prueba',
          rol: 'VETERINARIA',
          estadoAprobacion: 'APROBADO',
          correoVerificado: true,
        }),
      } as unknown as UsuariosService;

      const jornadasService = {
        obtenerJornadasActivas: vi.fn(),
        obtenerJornadaPorId: vi.fn(),
        crearReserva: vi.fn(),
        verificarEstadoReserva: vi.fn(),
      } as unknown as JornadasService;

      const controller = new JornadasController(
        repository,
        usuarios,
        jornadasService,
      );

      await controller.publicar(
        {
          titulo: 'Jornada de vacunación',
          comuna: 'Laureles',
          direccion: 'Medellín',

          inicio: new Date(
            Date.now() + 86400000,
          ).toISOString(),

          fin: new Date(
            Date.now() + 90000000,
          ).toISOString(),

          cupos,
          precioCop,
        },
        {
          sub: 7,
        },
      );

      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({
          precioProcedimientoCentavos:
            precioCop * 100,

          precioApartadoCentavos: tarifa,

          cuposTotales: cupos,

          cuposDisponibles: cupos,
        }),
      );
    },
  );
});
