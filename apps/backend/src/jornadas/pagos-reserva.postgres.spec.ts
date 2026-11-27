import { createHash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it, vi, beforeEach } from 'vitest';

import type { NotificacionesService } from '../notificaciones/notificaciones.service';
import { IntentoPago } from '../pagos/intento-pago.entity';
import { EstadoPago, Pago } from '../pagos/pago.entity';
import { PagosService } from '../pagos/pagos.service';
import { WompiService } from '../pagos/wompi.service';
import { WompiWebhookController } from '../pagos/wompi-webhook.controller';
import { Reporte, TipoReporte } from '../reportes/reporte.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Jornada } from './jornada.entity';
import { JornadasService } from './jornadas.service';
import { EstadoReservaJornada, ReservaJornada } from './reserva-jornada.entity';

const testDatabase = process.env.VECIPETS_PG_TEST_URL;

describe.skipIf(!testDatabase)('Reservas y pagos con PostgreSQL', () => {
  let db: DataSource;
  let jornadas: JornadasService;
  let pagos: PagosService;
  let webhook: WompiWebhookController;
  const remotas = new Map<string, {
    id: string; reference: string; status: string; amount_in_cents: number;
    currency: string; finalized_at?: string;
  }>();
  const registrarNotificacionPagoTurbo = vi.fn();

  beforeEach(() => {
    remotas.clear();
    registrarNotificacionPagoTurbo.mockClear();
  });

  beforeAll(async () => {
    const url = new URL(testDatabase!);
    if (!['localhost', '127.0.0.1'].includes(url.hostname) ||
        url.pathname !== '/vecipets_pruebas') {
      throw new Error('Usa una base local dedicada llamada vecipets_pruebas.');
    }

    db = await new DataSource({
      type: 'postgres',
      url: testDatabase,
      entities: [Usuario, Reporte, Pago, IntentoPago, Jornada, ReservaJornada],
      synchronize: true,
    }).initialize();

    const config = new ConfigService({
      WOMPI_ENVIRONMENT: 'sandbox',
      WOMPI_SANDBOX_PUBLIC_KEY: 'pub_test_fixture',
      WOMPI_SANDBOX_INTEGRITY_SECRET: 'fixture_integrity',
      WOMPI_SANDBOX_EVENTS_SECRET: 'fixture_events',
      FRONTEND_URL: 'https://deployed.example.test',
      WOMPI_FRONTEND_URL: 'http://localhost:3000/',
    });
    const wompi = new WompiService(config);
    vi.spyOn(wompi, 'consultarIdsPorReferencia').mockImplementation(async (referencia) =>
      [...remotas.values()].filter((item) => item.reference === referencia).map((item) => item.id),
    );
    vi.spyOn(wompi, 'consultarTransaccion').mockImplementation(async (id) => {
      const transaccion = remotas.get(id);
      if (!transaccion) throw new Error('Transacción de prueba desconocida');
      return transaccion;
    });
    pagos = new PagosService(
      db.getRepository(Pago), db.getRepository(Reporte), db.getRepository(Jornada),
      db.getRepository(ReservaJornada), wompi, config, db,
      { registrarNotificacionPagoTurbo } as unknown as NotificacionesService,
    );
    webhook = new WompiWebhookController(wompi, pagos);
    jornadas = new JornadasService(
      db.getRepository(Jornada), db.getRepository(ReservaJornada),
      db.getRepository(Usuario), wompi, config, db, pagos,
    );
  }, 15_000);

  afterAll(async () => {
    if (db?.isInitialized) await db.destroy();
  });

  async function crearUsuario() {
    return db.manager.save(Usuario, {
      nombre: 'Ciudadano de prueba',
      correo: randomUUID() + '@example.test',
      correoVerificado: true,
    });
  }

  async function crearJornada(cuposTotales = 1) {
    const organizador = await crearUsuario();
    return db.manager.save(Jornada, {
      organizadorId: organizador.id,
      titulo: 'Jornada de prueba',
      veterinaria: 'Clínica de prueba',
      comuna: 'Comuna de prueba',
      direccion: 'Dirección de prueba',
      fechaInicio: new Date(Date.now() + 60_000),
      fechaFin: new Date(Date.now() + 86_400_000),
      fechaTexto: 'Mañana',
      horaTexto: '09:00',
      precioProcedimientoCentavos: 0,
      cuposTotales,
      cuposDisponibles: cuposTotales,
    });
  }

  function reservar(usuarioId: number, jornadaId: number) {
    return jornadas.crearReserva(usuarioId, {
      jornadaId, nombrePropietario: 'Persona', nombreMascota: 'Mascota', aceptaCondiciones: true,
    });
  }

  async function crearReserva(cuposTotales = 1) {
    const jornada = await crearJornada(cuposTotales);
    const usuario = await crearUsuario();
    const reserva = await reservar(usuario.id, jornada.id);
    return { jornada, usuario, reserva };
  }

  async function expirarYLiberar(reservaId: number, jornadaId: number) {
    await db.manager.update(ReservaJornada, reservaId, { expiraEn: new Date(0) });
    return reservar((await crearUsuario()).id, jornadaId);
  }

  function evento(pago: { referencia: string; montoCentavos: number }, status = 'APPROVED') {
    return {
      id: randomUUID(), reference: pago.referencia, status,
      amount_in_cents: pago.montoCentavos, currency: 'COP',
    };
  }

  async function estado(reservaId: number) {
    const reserva = await db.manager.findOneOrFail(ReservaJornada, {
      where: { id: reservaId }, relations: { pago: true, jornada: true },
    });
    return {
      reserva: reserva.estado,
      pago: reserva.pago?.estado,
      cupos: reserva.jornada.cuposDisponibles,
    };
  }

  it('rechaza un nuevo apartado sin aceptación sin descontar cupos', async () => {
    const jornada = await crearJornada();
    const usuario = await crearUsuario();
    await expect(jornadas.crearReserva(usuario.id, {
      jornadaId: jornada.id, nombrePropietario: 'Persona', nombreMascota: 'Mascota',
    })).rejects.toThrow(/aceptar las condiciones/);
    expect(await db.manager.countBy(Pago, { usuario: { id: usuario.id } })).toBe(0);
    expect((await db.manager.findOneByOrFail(Jornada, { id: jornada.id })).cuposDisponibles).toBe(1);
  });

  it('confirma una reserva vigente usando el cupo retenido', async () => {
    const { reserva } = await crearReserva();
    await pagos.procesarEventoWompi(evento(reserva.pago));
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.CONFIRMADA, pago: EstadoPago.APROBADO, cupos: 0,
    });
  });

  it('reasigna un cupo disponible al aprobar después de la liberación', async () => {
    const { jornada, reserva } = await crearReserva(2);
    await expirarYLiberar(reserva.reserva.id, jornada.id);
    expect(await estado(reserva.reserva.id)).toMatchObject({
      reserva: EstadoReservaJornada.EXPIRADA, cupos: 1,
    });
    await pagos.procesarEventoWompi(evento(reserva.pago));
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.CONFIRMADA, pago: EstadoPago.APROBADO, cupos: 0,
    });
  });

  it('mantiene el pago aprobado para revisión cuando no hay cupos', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    const nueva = await expirarYLiberar(reserva.reserva.id, jornada.id);
    const aprobacion = evento(reserva.pago);
    expect(await pagos.procesarEventoWompi(aprobacion)).toMatchObject({
      requiereRevision: true,
    });
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.EXPIRADA, pago: EstadoPago.APROBADO, cupos: 0,
    });
    expect(await jornadas.verificarEstadoReserva(usuario.id, reserva.reserva.id)).toMatchObject({
      requiereRevision: true, reservaConfirmada: false, pagoEstado: EstadoPago.APROBADO,
    });
    await pagos.procesarEventoWompi(evento(nueva.pago, 'DECLINED'));
    await pagos.procesarEventoWompi(aprobacion);
    expect(await estado(reserva.reserva.id)).toMatchObject({
      reserva: EstadoReservaJornada.EXPIRADA, cupos: 1,
    });
  });

  it('mantiene el pago tardío para revisión cuando la jornada terminó aunque tenga cupos', async () => {
    const { jornada, reserva } = await crearReserva(2);
    await expirarYLiberar(reserva.reserva.id, jornada.id);
    await db.manager.update(Jornada, jornada.id, { fechaFin: new Date(0) });
    expect(await pagos.procesarEventoWompi(evento(reserva.pago))).toMatchObject({
      requiereRevision: true,
    });
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.EXPIRADA, pago: EstadoPago.APROBADO, cupos: 1,
    });
  });

  it('procesa webhooks duplicados concurrentes una sola vez', async () => {
    const { jornada, reserva } = await crearReserva(2);
    await expirarYLiberar(reserva.reserva.id, jornada.id);
    const aprobacion = evento(reserva.pago);
    const timestamp = Math.floor(Date.now() / 1000);
    const body = {
      event: 'transaction.updated', environment: 'test', timestamp,
      data: { transaction: aprobacion },
      signature: {
        properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
        checksum: createHash('sha256').update(
          `${aprobacion.id}${aprobacion.status}${aprobacion.amount_in_cents}${timestamp}fixture_events`,
        ).digest('hex'),
      },
    };
    await Promise.all([webhook.recibirEvento(body), webhook.recibirEvento(body)]);
    expect(await estado(reserva.reserva.id)).toMatchObject({
      reserva: EstadoReservaJornada.CONFIRMADA, cupos: 0,
    });
    expect(await db.manager.countBy(IntentoPago, { wompiTransactionId: aprobacion.id })).toBe(1);
  });

  it('libera el cupo una vez ante rechazos duplicados', async () => {
    const { reserva } = await crearReserva(2);
    const rechazo = evento(reserva.pago, 'DECLINED');
    await Promise.all([
      pagos.procesarEventoWompi(rechazo), pagos.procesarEventoWompi(rechazo),
    ]);
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.RECHAZADA, pago: EstadoPago.RECHAZADO, cupos: 2,
    });
  });

  it('serializa dos reservas concurrentes sobre el último cupo', async () => {
    const jornada = await crearJornada();
    const usuarios = await Promise.all([crearUsuario(), crearUsuario()]);
    const resultados = await Promise.allSettled(
      usuarios.map((usuario) => reservar(usuario.id, jornada.id)),
    );
    expect(resultados.map((resultado) => resultado.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(await db.manager.countBy(ReservaJornada, { jornada: { id: jornada.id } })).toBe(1);
    expect((await db.manager.findOneByOrFail(Jornada, { id: jornada.id })).cuposDisponibles).toBe(0);
  });

  it('reutiliza la reserva y el importe original aunque cambie la tarifa', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    await db.manager.update(Jornada, jornada.id, { precioProcedimientoCentavos: 5_000_000 });
    const repetida = await reservar(usuario.id, jornada.id);
    expect(repetida).toMatchObject({
      reutilizado: true, reserva: { id: reserva.reserva.id },
      pago: { referencia: reserva.pago.referencia, montoCentavos: 200_000 },
      checkoutUrl: reserva.checkoutUrl,
    });
    const url = new URL(reserva.checkoutUrl!);
    expect(url.searchParams.get('redirect-url')).toBe('http://localhost:3000/jornadas/reserva-resultado');
    expect(url.searchParams.get('reference')).toBe(reserva.pago.referencia);
    expect(await estado(reserva.reserva.id)).toMatchObject({ cupos: 0 });
  });

  it('bloquea un enlace cuyo vencimiento difiere del cupo retenido', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    await db.manager.update(ReservaJornada, reserva.reserva.id, {
      expiraEn: new Date(Date.now() + 60_000),
    });
    await expect(reservar(usuario.id, jornada.id)).rejects.toThrow(/verificando/);
    expect(await db.manager.countBy(Pago, { usuario: { id: usuario.id } })).toBe(1);
    expect(await estado(reserva.reserva.id)).toMatchObject({ cupos: 0 });
  });

  it('bloquea una referencia en procesamiento aunque todavía no llegó el webhook', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    const pendiente = evento(reserva.pago, 'PENDING');
    remotas.set(pendiente.id, pendiente);
    await expect(reservar(usuario.id, jornada.id)).rejects.toThrow(/verificando/);
    expect(await db.manager.countBy(IntentoPago, { wompiTransactionId: pendiente.id })).toBe(1);
    expect(await estado(reserva.reserva.id)).toMatchObject({ pago: EstadoPago.PENDIENTE, cupos: 0 });
  });

  it('reconcilia una aprobación en Wompi sin emitir otro checkout', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    const aprobado = evento(reserva.pago);
    remotas.set(aprobado.id, aprobado);
    expect(await reservar(usuario.id, jornada.id)).toMatchObject({ checkoutUrl: null, reserva: { estado: 'CONFIRMADA', pagoEstado: 'APROBADO' } });
    expect(await estado(reserva.reserva.id)).toMatchObject({
      pago: EstadoPago.APROBADO, reserva: EstadoReservaJornada.CONFIRMADA, cupos: 0,
    });
    expect(await reservar(usuario.id, jornada.id)).toMatchObject({ checkoutUrl: null, reserva: { id: reserva.reserva.id } });
    expect(await db.manager.countBy(Pago, { usuario: { id: usuario.id } })).toBe(1);
  });

  it.each(['DECLINED', 'VOIDED', 'EXPIRED'])(
    'genera una referencia firmada tras %s y conserva la reserva y su tarifa',
    async (status) => {
      const { jornada, usuario, reserva } = await crearReserva();
      const terminado = evento(reserva.pago, status);
      remotas.set(terminado.id, terminado);
      await db.manager.update(Jornada, jornada.id, { precioProcedimientoCentavos: 5_000_000 });
      const reintento = await reservar(usuario.id, jornada.id);
      expect(reintento.reserva.id).toBe(reserva.reserva.id);
      expect(reintento.pago.referencia).not.toBe(reserva.pago.referencia);
      expect(reintento.pago.montoCentavos).toBe(reserva.pago.montoCentavos);
      const checkout = new URL(reintento.checkoutUrl!);
      expect(checkout.searchParams.get('reference')).toBe(reintento.pago.referencia);
      const expiracion = checkout.searchParams.get('expiration-time');
      expect(Date.parse(expiracion ?? '')).toBeGreaterThan(Date.now());
      expect(checkout.searchParams.get('signature:integrity')).toBe(createHash('sha256').update(
        `${reintento.pago.referencia}${reintento.pago.montoCentavos}COP${expiracion}fixture_integrity`,
      ).digest('hex'));
      expect(checkout.searchParams.get('signature:integrity')).not.toBe(
        new URL(reserva.checkoutUrl!).searchParams.get('signature:integrity'),
      );
      expect(await db.manager.countBy(Pago, { usuario: { id: usuario.id } })).toBe(2);
      expect(await db.manager.countBy(IntentoPago, { wompiTransactionId: terminado.id })).toBe(1);
      expect(await estado(reserva.reserva.id)).toMatchObject({ cupos: 0 });
    },
  );

  it('serializa solicitudes de reintento concurrentes sin emitir otra referencia', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    const rechazo = evento(reserva.pago, 'DECLINED');
    remotas.set(rechazo.id, rechazo);
    const respuestas = await Promise.allSettled([
      reservar(usuario.id, jornada.id), reservar(usuario.id, jornada.id),
    ]);
    const referencias = respuestas.flatMap((respuesta) =>
      respuesta.status === 'fulfilled' ? [respuesta.value.pago.referencia] : [],
    );
    expect(new Set(referencias).size).toBe(1);
    expect(await db.manager.countBy(Pago, { usuario: { id: usuario.id } })).toBe(2);
    expect(await estado(reserva.reserva.id)).toMatchObject({ cupos: 0 });
  });

  it('confirma un pago tardío de la referencia anterior y señala una segunda aprobación', async () => {
    const { jornada, usuario, reserva } = await crearReserva();
    const rechazo = evento(reserva.pago, 'DECLINED');
    remotas.set(rechazo.id, rechazo);
    const reintento = await reservar(usuario.id, jornada.id);

    const tardio = { ...rechazo, status: 'APPROVED' };
    await pagos.procesarEventoWompi(tardio);
    const segundo = evento(reintento.pago);
    const resultados = await Promise.all([
      pagos.procesarEventoWompi(segundo), pagos.procesarEventoWompi(segundo),
    ]);
    expect(resultados.every((resultado) => resultado.requiereRevision)).toBe(true);
    expect(await estado(reserva.reserva.id)).toEqual({
      reserva: EstadoReservaJornada.CONFIRMADA, pago: EstadoPago.APROBADO, cupos: 0,
    });
    expect(await db.manager.countBy(ReservaJornada, { jornada: { id: jornada.id } })).toBe(1);
    expect(await db.manager.countBy(IntentoPago, { wompiTransactionId: segundo.id })).toBe(1);
    expect(registrarNotificacionPagoTurbo).toHaveBeenCalledWith(expect.objectContaining({
      reservaId: reserva.reserva.id, estado: 'En revisión',
    }));
  });

  it('reconcilia Turbo, evita extender el beneficio y registra el doble cobro', async () => {
    const usuario = await crearUsuario();
    const reporte = await db.manager.save(Reporte, {
      usuario, tipo: TipoReporte.PERDIDA, nombre: 'Mascota', especie: 'Perro',
      descripcion: 'Prueba de Alerta Turbo', fechaEvento: '2026-01-01',
      barrioSector: 'Comuna', imagenUrl: '/prueba.png',
    });
    const iniciarPago = () => pagos.crearPagoAlertaTurbo(usuario.id, reporte.id);
    const checkoutInicial = await iniciarPago();
    const checkoutReutilizado = await iniciarPago();
    expect(checkoutReutilizado.pago.referencia).toBe(checkoutInicial.pago.referencia);
    for (const resultado of [checkoutInicial, checkoutReutilizado]) {
      const url = new URL(resultado.checkoutUrl!);
      expect(url.searchParams.get('redirect-url')).toBe('http://localhost:3000/reportar');
      expect(url.searchParams.get('amount-in-cents')).toBe('1500000');
    }
    const original = await iniciarPago();
    const rechazo = evento(original.pago, 'DECLINED');
    remotas.set(rechazo.id, { ...rechazo, finalized_at: new Date().toISOString() });
    await expect(iniciarPago()).rejects.toThrow(/verificando/);
    remotas.set(rechazo.id, { ...rechazo, finalized_at: new Date(0).toISOString() });
    const reintento = await iniciarPago();
    expect(reintento.pago.referencia).not.toBe(original.pago.referencia);

    await pagos.procesarEventoWompi({ ...rechazo, status: 'APPROVED' });
    const activado = await db.manager.findOneByOrFail(Reporte, { id: reporte.id });
    expect(activado.esTurbo).toBe(true);
    expect((await pagos.consultarPagoPorReporte(usuario.id, reporte.id))?.estado).toBe(EstadoPago.APROBADO);
    const segundaAprobacion = evento(reintento.pago);
    expect(await pagos.procesarEventoWompi(segundaAprobacion)).toMatchObject({ requiereRevision: true });
    expect((await db.manager.findOneByOrFail(Reporte, { id: reporte.id })).turboVenceEn).toEqual(
      activado.turboVenceEn,
    );
    await expect(iniciarPago()).rejects.toThrow(/Alerta Turbo activa/);
    expect(await db.manager.countBy(Pago, { reporte: { id: reporte.id } })).toBe(2);
    expect(registrarNotificacionPagoTurbo).toHaveBeenCalledWith(expect.objectContaining({
      reporteId: reporte.id, estado: 'En revisión',
    }));
  });
});
