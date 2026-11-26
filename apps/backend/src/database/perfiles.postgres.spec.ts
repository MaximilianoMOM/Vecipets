import { randomUUID } from 'node:crypto';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Jornada } from '../jornadas/jornada.entity';
import { JornadasController } from '../jornadas/jornadas.controller';
import { JornadasService } from '../jornadas/jornadas.service';
import { EstadoReservaJornada, ReservaJornada } from '../jornadas/reserva-jornada.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { IntentoPago } from '../pagos/intento-pago.entity';
import { ConceptoPago, Pago } from '../pagos/pago.entity';
import { PagosService } from '../pagos/pagos.service';
import { WompiService } from '../pagos/wompi.service';
import { AlmacenamientoService } from '../reportes/almacenamiento.service';
import { Reporte, TipoReporte } from '../reportes/reporte.entity';
import { ReportesController } from '../reportes/reportes.controller';
import { ReportesService } from '../reportes/reportes.service';
import { Sede } from '../sedes/sede.entity';
import { SedesController } from '../sedes/sedes.controller';
import { CorreoService } from '../usuarios/correo.service';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosController } from '../usuarios/usuarios.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ValidacionImagenesService } from '../validacion-imagenes/validacion-imagenes.service';
import { CrearSedesAliadas1795708900000 } from './migrations/CrearSedesAliadas1795708900000';
import { SepararBorradoresDeModeracion1795708800000 } from './migrations/SepararBorradoresDeModeracion1795708800000';

const testUrl = process.env.VECIPETS_PG_TEST_URL;
const entidades = [Usuario, Reporte, Pago, IntentoPago, Jornada, ReservaJornada, Sede];
const datosReporte = {
  tipo: TipoReporte.PERDIDA, nombre: 'Mascota de prueba', especie: 'Perro',
  descripcion: 'Se perdió cerca del parque.', fechaEvento: '2026-11-20',
  barrioSector: 'Laureles', imagenUrl: 'https://example.test/mascota.jpg',
};
const datosSede = {
  nombre: 'Sede Laureles', tipo: 'VETERINARIA', direccion: 'Laureles, Medellín',
  horario: 'Lunes a viernes', servicios: ['Vacunación'], telefono: '3000000000',
};

describe.skipIf(!testUrl)('Perfiles y moderación con HTTP y PostgreSQL', () => {
  const esquema = 'perfiles_' + randomUUID().replaceAll('-', '');
  let servidor: INestApplication;
  let db: DataSource;
  let conexion: DataSource;
  let api: ReturnType<typeof request>;
  let jwt: JwtService;
  let ciudadano: Usuario;
  let borradorId: number;
  let reporteLegadoId: number;

  function crearCuenta(rol: string, estadoAprobacion = 'APROBADO') {
    return db.manager.save(Usuario, {
      nombre: 'Cuenta de prueba', correo: randomUUID() + '@example.test',
      correoVerificado: true, rol, estadoAprobacion,
    });
  }

  function cookie(usuario: Usuario, rol = usuario.rol) {
    return 'vecipets_access_token=' + jwt.sign({ sub: usuario.id, rol });
  }

  beforeAll(async () => {
    const url = new URL(testUrl!);
    if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/vecipets_pruebas') {
      throw new Error('Usa una base local dedicada llamada vecipets_pruebas.');
    }
    conexion = await new DataSource({ type: 'postgres', url: testUrl }).initialize();
    await conexion.query(`CREATE SCHEMA "${esquema}"`);
    db = await new DataSource({ type: 'postgres', url: testUrl, schema: esquema, entities: entidades, synchronize: true }).initialize();
    ciudadano = await crearCuenta('CIUDADANO');
    const borrador = await db.manager.save(Reporte, { ...datosReporte, usuario: ciudadano });
    const normal = await db.manager.save(Reporte, { ...datosReporte, usuario: ciudadano });
    borradorId = borrador.id;
    reporteLegadoId = normal.id;
    await db.manager.save(Pago, {
      usuario: ciudadano, reporte: borrador, concepto: ConceptoPago.ALERTA_TURBO,
      referencia: randomUUID(), montoCentavos: 1_500_000,
    });

    const migracion = db.createQueryRunner();
    try {
      await migracion.query(`SET search_path TO "${esquema}"`);
      await migracion.query('DROP TABLE sedes');
      await migracion.query('ALTER TABLE reportes DROP COLUMN enviado_revision');
      await new SepararBorradoresDeModeracion1795708800000().up(migracion);
      await new CrearSedesAliadas1795708900000().up(migracion);
    } finally {
      await migracion.release();
    }

    const modulo = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: randomUUID() })],
      controllers: [UsuariosController, ReportesController, JornadasController, SedesController],
      providers: [
        UsuariosService, ReportesService, JornadasService, JwtAuthGuard, RolesGuard,
        { provide: DataSource, useValue: db },
        ...entidades.map((entity) => ({ provide: getRepositoryToken(entity), useValue: db.getRepository(entity) })),
        { provide: CorreoService, useValue: {} },
        { provide: AlmacenamientoService, useValue: {} },
        { provide: ValidacionImagenesService, useValue: {} },
        { provide: PagosService, useValue: {} },
        { provide: NotificacionesService, useValue: {} },
        { provide: WompiService, useValue: {} },
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    }).compile();
    jwt = modulo.get(JwtService);
    servidor = modulo.createNestApplication();
    servidor.use(cookieParser());
    servidor.useGlobalPipes(new ValidationPipe({
      whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true },
    }));
    await servidor.listen(0, '127.0.0.1');
    api = request(await servidor.getUrl());
  }, 30_000);

  afterAll(async () => {
    if (servidor) await servidor.close();
    if (db?.isInitialized) await db.destroy();
    if (conexion?.isInitialized) {
      await conexion.query(`DROP SCHEMA IF EXISTS "${esquema}" CASCADE`);
      await conexion.destroy();
    }
  });

  it('aplica las migraciones y excluye los borradores Turbo de la moderación', async () => {
    const admin = await crearCuenta('ADMINISTRADOR');
    await api.get('/reportes/moderacion').set('Cookie', cookie(ciudadano, 'ADMINISTRADOR')).expect(403);
    const { body } = await api.get('/reportes/moderacion').set('Cookie', cookie(admin)).expect(200);
    expect(body.map((reporte: Reporte) => reporte.id)).toContain(reporteLegadoId);
    expect(body.map((reporte: Reporte) => reporte.id)).not.toContain(borradorId);
    await api.patch(`/reportes/${borradorId}`).set('Cookie', cookie(admin)).send({ estadoAprobacion: 'APROBADO' }).expect(409);
  });

  it('separa crear, moderar y resolver un reporte según el dueño y el rol', async () => {
    const [admin, vecino, veterinaria] = await Promise.all([
      crearCuenta('ADMINISTRADOR'), crearCuenta('CIUDADANO'), crearCuenta('VETERINARIA'),
    ]);
    await api.post('/reportes').send(datosReporte).expect(401);
    await api.post('/reportes').set('Cookie', cookie(veterinaria)).send(datosReporte).expect(403);
    const ubicacion = { latitud: '6.2459659', longitud: '-75.5934622' };
    const { body: alta } = await api.post('/reportes').set('Cookie', cookie(ciudadano))
      .send({ ...datosReporte, ciudad: 'Medellín', ...ubicacion }).expect(201);
    const id = alta.reporte.id;
    expect(alta.reporte.estado).toBe('PENDIENTE');
    expect(alta.reporte.usuario).not.toHaveProperty('passwordHash');
    const { body: feed } = await api.get('/reportes').expect(200);
    expect(feed.datos.map((reporte: Reporte) => reporte.id)).not.toContain(id);
    await api.get(`/reportes/${id}`).set('Cookie', cookie(vecino, 'ADMINISTRADOR')).expect(403);
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(ciudadano)).send({ estadoAprobacion: 'APROBADO' }).expect(403);
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(admin)).send({ estadoAprobacion: 'APROBADO' }).expect(200);
    const { body: ficha } = await api.get(`/reportes/${id}`).expect(200);
    expect(ficha).toMatchObject({ ...ubicacion, barrioSector: 'Laureles', ciudad: 'Medellín' });
    const { body: feedAprobado } = await api.get('/reportes?limite=100&pagina=1').expect(200);
    expect(feedAprobado.datos).toContainEqual(expect.objectContaining({ id, ...ubicacion }));
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(admin)).send({ estado: 'RESUELTO' }).expect(403);
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(vecino)).send({ estado: 'RESUELTO' }).expect(403);
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(ciudadano)).send({ estado: 'RESUELTO' }).expect(200);
    const { body: feedResuelto } = await api.get('/reportes').expect(200);
    expect(feedResuelto.datos.map((reporte: Reporte) => reporte.id)).not.toContain(id);
    const { body: propios } = await api.get('/reportes/mis-reportes').set('Cookie', cookie(ciudadano)).expect(200);
    expect(propios).toContainEqual(expect.objectContaining({ id, estado: 'RESUELTO' }));
  });

  it('mantiene fuera del feed un reporte geolocalizado rechazado por moderación', async () => {
    const admin = await crearCuenta('ADMINISTRADOR');
    const { body: alta } = await api.post('/reportes').set('Cookie', cookie(ciudadano))
      .send({ ...datosReporte, latitud: '6.2459659', longitud: '-75.5934622' }).expect(201);
    const id = alta.reporte.id;
    await api.patch(`/reportes/${id}`).set('Cookie', cookie(admin))
      .send({ estadoAprobacion: 'RECHAZADO' }).expect(200);
    const { body: feed } = await api.get('/reportes').expect(200);
    expect(feed.datos.map((reporte: Reporte) => reporte.id)).not.toContain(id);
    const { body: propios } = await api.get('/reportes/mis-reportes').set('Cookie', cookie(ciudadano)).expect(200);
    expect(propios).toContainEqual(expect.objectContaining({ id, estado: 'RECHAZADO' }));
  });

  it('limita aprobación, sedes y suspensión al rol y titular correctos', async () => {
    const [admin, vet, otraVet, refugio] = await Promise.all([
      crearCuenta('ADMINISTRADOR'), crearCuenta('VETERINARIA', 'PENDIENTE'),
      crearCuenta('VETERINARIA'), crearCuenta('REFUGIO', 'PENDIENTE'),
    ]);
    const sesionVet = cookie(vet);
    await api.post('/sedes').set('Cookie', sesionVet).send(datosSede).expect(403);
    await api.patch(`/usuarios/${vet.id}/aprobacion`).set('Cookie', cookie(ciudadano)).send({ estado: 'APROBADO' }).expect(403);
    await api.patch(`/usuarios/${refugio.id}/aprobacion`).set('Cookie', cookie(admin)).send({ estado: 'RECHAZADO' }).expect(200);
    await api.get('/usuarios/me').set('Cookie', cookie(refugio)).expect(403);
    await api.patch(`/usuarios/${vet.id}/aprobacion`).set('Cookie', cookie(admin)).send({ estado: 'APROBADO' }).expect(200);
    const { body: sede } = await api.post('/sedes').set('Cookie', sesionVet).send(datosSede).expect(201);
    await api.patch(`/sedes/${sede.id}`).set('Cookie', cookie(otraVet)).send(datosSede).expect(404);
    await api.patch(`/sedes/${sede.id}`).set('Cookie', sesionVet).send({ ...datosSede, nombre: 'Sede San Javier' }).expect(200);
    const { body: sedes } = await api.get('/sedes').expect(200);
    expect(sedes).toContainEqual(expect.objectContaining({ id: sede.id, nombre: 'Sede San Javier' }));
    await api.patch(`/usuarios/${vet.id}/suspension`).set('Cookie', cookie(admin)).send({ suspendido: true }).expect(200);
    await api.get('/sedes/mias').set('Cookie', sesionVet).expect(403);
    const { body: directorio } = await api.get('/sedes').expect(200);
    expect(directorio.map((item: Sede) => item.id)).not.toContain(sede.id);
  });

  it('protege la edición y las listas privadas de jornadas y reservas', async () => {
    const [vet, otraVet, vecino] = await Promise.all([
      crearCuenta('VETERINARIA'), crearCuenta('VETERINARIA'), crearCuenta('CIUDADANO'),
    ]);
    const datos = {
      titulo: 'Vacunación', comuna: 'Laureles', direccion: 'Laureles, Medellín',
      inicio: new Date(Date.now() + 86_400_000).toISOString(),
      fin: new Date(Date.now() + 90_000_000).toISOString(), cupos: 10, precioCop: 0,
    };
    const { body: jornada } = await api.post('/jornadas').set('Cookie', cookie(vet)).send(datos).expect(201);
    await api.post('/jornadas/reservar').send({ jornadaId: jornada.id }).expect(401);
    await api.patch(`/jornadas/${jornada.id}`).set('Cookie', cookie(otraVet)).send(datos).expect(404);
    await api.patch(`/jornadas/${jornada.id}`).set('Cookie', cookie(vet)).send({ ...datos, cupos: 12 }).expect(200);
    const reserva = await db.manager.save(ReservaJornada, {
      jornada: { id: jornada.id }, usuario: ciudadano,
      codigo: randomUUID(), nombrePropietario: 'Ciudadano', nombreMascota: 'Mascota',
      estado: EstadoReservaJornada.CONFIRMADA, expiraEn: new Date(Date.now() + 30_000),
    });
    await api.patch(`/jornadas/${jornada.id}`).set('Cookie', cookie(vet)).send(datos).expect(409);
    await api.get(`/jornadas/${jornada.id}/reservas`).set('Cookie', cookie(otraVet)).expect(404);
    await api.get(`/jornadas/${jornada.id}/reservas`).set('Cookie', cookie(ciudadano)).expect(403);
    const { body: reservasJornada } = await api.get(`/jornadas/${jornada.id}/reservas`).set('Cookie', cookie(vet)).expect(200);
    expect(reservasJornada).toContainEqual(expect.objectContaining({ id: reserva.id }));
    const { body: reservasAjenas } = await api.get('/jornadas/mis-reservas').set('Cookie', cookie(vecino)).expect(200);
    expect(reservasAjenas).toEqual([]);
    const { body: reservasPropias } = await api.get('/jornadas/mis-reservas').set('Cookie', cookie(ciudadano)).expect(200);
    expect(reservasPropias).toContainEqual(expect.objectContaining({ id: reserva.id }));
  });
});
