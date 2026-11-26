import type { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';

import type { UsuariosService } from '../usuarios/usuarios.service';
import type { Jornada } from './jornada.entity';
import type { JornadasService } from './jornadas.service';

import { JornadasController } from './jornadas.controller';

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