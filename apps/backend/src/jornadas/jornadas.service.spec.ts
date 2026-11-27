import { ConfigService } from '@nestjs/config';
import type { DataSource, Repository } from 'typeorm';
import { expect, it, vi } from 'vitest';

import type { PagosService } from '../pagos/pagos.service';
import { EstadoPago } from '../pagos/pago.entity';
import type { WompiService } from '../pagos/wompi.service';
import type { Usuario } from '../usuarios/usuario.entity';
import { Jornada } from './jornada.entity';
import { JornadasService } from './jornadas.service';
import { EstadoReservaJornada, ReservaJornada } from './reserva-jornada.entity';

it('reutiliza, solo después de consultar a Wompi, el checkout de una reserva vigente que ya retuvo el último cupo', async () => {
  const jornada = {
    id: 1,
    activa: true,
    fechaFin: new Date(Date.now() + 86_400_000),
    cuposDisponibles: 0,
    precioProcedimientoCentavos: 5_000_000,
  };
  const expiraEn = new Date(Date.now() + 60_000);
  const pago = {
    id: 2,
    referencia: 'reserva-existente',
    estado: EstadoPago.PENDIENTE,
    montoCentavos: 1_000_000,
    checkoutUrl: 'https://checkout.wompi.co/p/?' + new URLSearchParams({
      reference: 'reserva-existente', 'expiration-time': expiraEn.toISOString(),
    }),
  };
  const reserva = {
    id: 3,
    precioApartadoHistoricoCentavos: pago.montoCentavos,
    estado: EstadoReservaJornada.PENDIENTE,
    expiraEn,
    jornada,
    pago,
  };
  const manager = {
    find: vi.fn().mockResolvedValue([]),
    getRepository: vi.fn(() => ({ findOne: vi.fn().mockResolvedValue(reserva) })),
    findOne: vi.fn((entity, options) => {
      if (entity === Jornada) return jornada;
      return options.where.estado === EstadoReservaJornada.PENDIENTE ? reserva : null;
    }),
    save: vi.fn((_entity, record) => record),
  };
  const dataSource = {
    transaction: vi.fn((work) => work(manager)),
  } as unknown as DataSource;
  const usuarios = {
    findOne: vi.fn().mockResolvedValue({
      rol: 'CIUDADANO',
      correoVerificado: true,
      estadoAprobacion: 'APROBADO',
    }),
  } as unknown as Repository<Usuario>;
  const generarReferencia = vi.fn();
  const service = new JornadasService(
    {} as Repository<Jornada>,
    { findOne: vi.fn().mockResolvedValue(reserva) } as unknown as Repository<ReservaJornada>,
    usuarios,
    { generarReferencia } as unknown as WompiService,
    new ConfigService(),
    dataSource,
    {
      reconciliarAntesDeReintentar: vi.fn().mockResolvedValue('disponible'),
      verificarHistorialBloqueado: vi.fn(),
      puedeContinuarCheckout: vi.fn().mockReturnValue(true),
    } as unknown as PagosService,
  );

  const dto = { jornadaId: 1, nombrePropietario: 'Persona', nombreMascota: 'Mascota', aceptaCondiciones: true };
  for (const intento of [dto, dto]) {
    const resultado = await service.crearReserva(7, intento);
    expect(resultado).toMatchObject({
      reutilizado: true,
      reserva: { id: reserva.id },
      pago: { id: pago.id, referencia: pago.referencia },
      checkoutUrl: pago.checkoutUrl,
    });
  }
  expect(manager.save.mock.calls.map(([entity]) => entity)).toEqual([
    ReservaJornada,
    ReservaJornada,
  ]);
  expect(jornada.cuposDisponibles).toBe(0);
  expect(generarReferencia).not.toHaveBeenCalled();
});
