import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import type { GuardarSedeDto } from './guardar-sede.dto';
import type { Sede } from './sede.entity';
import { SedesController } from './sedes.controller';

const datos: GuardarSedeDto = {
  nombre: 'Clínica de prueba',
  tipo: 'CLINICA',
  direccion: 'Medellín, Colombia',
  horario: 'Lunes a viernes',
  servicios: ['Vacunación'],
  telefono: '3000000000',
};

describe('SedesController', () => {
  it('solo actualiza una sede cuyo organizador coincide con la sesión', async () => {
    const update = vi.fn().mockResolvedValue({ affected: 0 });
    const controller = new SedesController({ update } as unknown as Repository<Sede>);
    await expect(controller.editar(3, datos, { sub: 10, rol: 'VETERINARIA' })).rejects.toBeInstanceOf(NotFoundException);
    expect(update).toHaveBeenCalledWith({ id: 3, organizadorId: 10 }, { ...datos, imagenUrl: null });
  });

  it('impide que un refugio registre su sede como clínica', () => {
    const save = vi.fn();
    const controller = new SedesController({ save } as unknown as Repository<Sede>);
    expect(() => controller.crear(datos, { sub: 10, rol: 'REFUGIO' })).toThrow(ForbiddenException);
    expect(save).not.toHaveBeenCalled();
  });
});
