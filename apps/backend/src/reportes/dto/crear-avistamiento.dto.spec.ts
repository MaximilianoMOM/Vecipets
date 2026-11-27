import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CrearAvistamientoDto } from './crear-avistamiento.dto';

const payload = {
  direccion: 'Calle de prueba',
  barrioSector: 'Sector de prueba',
  comentario: 'Posible avistamiento.',
  latitud: '6.24',
  longitud: '-75.58',
  fechaAvistamiento: '2026-01-01T12:00:00Z',
};

describe('CrearAvistamientoDto', () => {
  it('acepta y convierte coordenadas de multipart', async () => {
    const dto = plainToInstance(CrearAvistamientoDto, payload);
    expect(await validate(dto)).toEqual([]);
    expect(dto.latitud).toBe(6.24);
    expect(dto.longitud).toBe(-75.58);
  });

  it.each(['', '   ', null, false, [], '0x10', '91'])('rechaza una latitud inválida (%j)', async (latitud) => {
    const dto = plainToInstance(CrearAvistamientoDto, { ...payload, latitud });
    expect((await validate(dto)).map(({ property }) => property)).toContain('latitud');
  });
});