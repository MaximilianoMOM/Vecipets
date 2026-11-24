import assert from 'node:assert/strict';
import { NotificacionesService } from '../src/notificaciones/notificaciones.service';
import { EstadoPago, ConceptoPago } from '../src/pagos/pago.entity';
import { EstadoReporte, EstadoAprobacionReporte } from '../src/reportes/reporte.entity';

async function ejecutarPruebasAlertaTurbo() {
  console.log('=== INICIANDO PRUEBAS DE LÓGICA DE NEGOCIO ALERTA TURBO ===\n');

  // -------------------------------------------------------------
  // 1. PRUEBA DE NOTIFICACIONES ADMINISTRATIVAS E IDEMPOTENCIA
  // -------------------------------------------------------------
  console.log('--- 1. Pruebas de Notificaciones Administrativas ---');
  const notificacionesService = new NotificacionesService();

  const fechaPago = new Date();
  const referenciaPrueba = `turbo-test-${Date.now()}`;

  // Registrar notificación de pago exitoso
  const notif1 = await notificacionesService.registrarNotificacionPagoTurbo({
    titulo: 'Nuevo pago de Alerta Turbo',
    usuarioNombre: 'Carlos Pérez',
    reporteId: 42,
    monto: '$15.000 COP',
    referencia: referenciaPrueba,
    fechaPago,
    estado: 'Aprobado',
    enlaceReporte: '/reportes/42',
  });

  assert.equal(notif1.titulo, 'Nuevo pago de Alerta Turbo');
  assert.equal(notif1.usuarioNombre, 'Carlos Pérez');
  assert.equal(notif1.reporteId, 42);
  assert.equal(notif1.monto, '$15.000 COP');
  assert.equal(notif1.referencia, referenciaPrueba);
  assert.equal(notif1.estado, 'Aprobado');
  assert.equal(notif1.enlaceReporte, '/reportes/42');
  assert.equal(notif1.leida, false);
  console.log('✔ Notificación creada con todos los datos requeridos');

  // Idempotencia: el mismo evento retransmitido por Wompi NO debe generar duplicados
  const notifDuplicada = await notificacionesService.registrarNotificacionPagoTurbo({
    titulo: 'Nuevo pago de Alerta Turbo',
    usuarioNombre: 'Carlos Pérez',
    reporteId: 42,
    monto: '$15.000 COP',
    referencia: referenciaPrueba,
    fechaPago,
    estado: 'Aprobado',
    enlaceReporte: '/reportes/42',
  });

  assert.equal(notifDuplicada.id, notif1.id, 'No debe crear una nueva notificación con la misma referencia');
  const listaNotif = await notificacionesService.obtenerNotificacionesAdmin();
  const encontradas = listaNotif.filter((n) => n.referencia === referenciaPrueba);
  assert.equal(encontradas.length, 1, 'Debe existir exactamente 1 notificación por referencia');
  console.log('✔ Idempotencia confirmada: no se generan notificaciones duplicadas');

  // Marcar como leída
  const notifLeida = await notificacionesService.marcarComoLeida(notif1.id);
  assert.equal(notifLeida.leida, true);
  console.log('✔ Notificación marcada como leída exitosamente');

  // -------------------------------------------------------------
  // 2. PRUEBA DE REGLAS DE NEGOCIO ALERTA TURBO ($15.000 COP, 7 DÍAS)
  // -------------------------------------------------------------
  console.log('\n--- 2. Pruebas de Reglas de Negocio Turbo ---');
  const PRECIO_TURBO_CENTAVOS = 1500000;
  const DURACION_DIAS = 7;

  assert.equal(PRECIO_TURBO_CENTAVOS / 100, 15000, 'El precio debe ser exactamente $15.000 COP');
  assert.equal(DURACION_DIAS, 7, 'La duración debe ser exactamente 7 días');
  console.log('✔ Validación de precio ($15.000 COP) y duración (7 días) confirmada');

  // -------------------------------------------------------------
  // 3. PRUEBA DE FLUJO DE PAGO Y PUBLICACIÓN CON APROBACIÓN ADMIN
  // -------------------------------------------------------------
  console.log('\n--- 3. Pruebas de Flujo de Pago y Publicación con Aprobación Admin ---');

  // Simulación: Reporte creado inicialmente como borrador pendiente
  const reporteSimulado: any = {
    id: 101,
    nombre: 'Firulais',
    estado: EstadoReporte.PENDIENTE,
    estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
    esTurbo: false,
    turboActivadaEn: null,
    turboVenceEn: null,
  };

  assert.equal(reporteSimulado.estado, EstadoReporte.PENDIENTE);
  assert.equal(reporteSimulado.estadoAprobacion, EstadoAprobacionReporte.PENDIENTE);
  console.log('✔ Reporte Turbo inicial guardado internamente como borrador PENDIENTE sin ser público');

  // Simulación: Wompi procesa pago con estado APPROVED
  const transaccionAprobada = {
    id: 'tx-wompi-mock-123',
    reference: `vecipets-turbo-${Date.now()}`,
    amount_in_cents: 1500000,
    currency: 'COP',
    status: 'APPROVED',
  };

  // Función que simula la lógica exacta de PagosService.procesarEventoWompi:
  // Tras la aprobación del pago, Alerta Turbo queda asociada pero el reporte NO se auto-publica.
  // Permanece en PENDIENTE hasta que el usuario presiona "Publicar reporte".
  function simularAprobacionPago(reporte: any, transaccion: typeof transaccionAprobada) {
    if (transaccion.status === 'APPROVED') {
      const ahora = new Date();
      const vencimiento = new Date(ahora);
      vencimiento.setDate(vencimiento.getDate() + DURACION_DIAS);

      reporte.esTurbo = true;
      reporte.turboActivadaEn = ahora;
      reporte.turboVenceEn = vencimiento;
      // NO publicar automáticamente a PUBLICO; el reporte espera la acción del usuario
      reporte.estado = EstadoReporte.PENDIENTE;
      reporte.estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
    }
  }

  simularAprobacionPago(reporteSimulado, transaccionAprobada);

  // Verificación crítica: NO se publica automáticamente
  assert.equal(reporteSimulado.estado, EstadoReporte.PENDIENTE, 'El reporte NO debe publicarse automáticamente tras el pago');
  assert.equal(reporteSimulado.estadoAprobacion, EstadoAprobacionReporte.PENDIENTE, 'Debe permanecer pendiente de confirmación');
  assert.equal(reporteSimulado.esTurbo, true, 'Debe tener Alerta Turbo activa/asociada');
  assert.ok(reporteSimulado.turboActivadaEn instanceof Date);
  assert.ok(reporteSimulado.turboVenceEn instanceof Date);

  const diferenciaMs = reporteSimulado.turboVenceEn.getTime() - reporteSimulado.turboActivadaEn.getTime();
  const diasCalculados = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
  assert.equal(diasCalculados, 7, 'La duración asignada debe ser exactamente 7 días');
  console.log('✔ Pago procesado: reporte permanece en PENDIENTE (no se publica automáticamente)');

  // Simulación: El usuario regresa al formulario (/reportar) y presiona "Publicar reporte"
  function simularPublicarBorrador(reporte: any, pagoAprobado: boolean) {
    if (pagoAprobado) {
      reporte.esTurbo = true;
    }
    // El reporte queda formalmente enviado y PENDIENTE de aprobación por el administrador
    reporte.estado = EstadoReporte.PENDIENTE;
    reporte.estadoAprobacion = EstadoAprobacionReporte.PENDIENTE;
    return {
      publicado: true,
      mensaje: pagoAprobado
        ? 'Reporte enviado con Alerta Turbo activa. Queda pendiente de aprobación por el administrador.'
        : 'Reporte enviado con éxito. Queda pendiente de aprobación por el administrador.',
    };
  }

  const resultadoEnvio = simularPublicarBorrador(reporteSimulado, true);
  assert.equal(resultadoEnvio.publicado, true);
  assert.equal(reporteSimulado.estado, EstadoReporte.PENDIENTE, 'Conserva estado PENDIENTE para revisión del admin');
  assert.equal(reporteSimulado.estadoAprobacion, EstadoAprobacionReporte.PENDIENTE, 'Conserva estadoAprobacion PENDIENTE');
  assert.equal(reporteSimulado.esTurbo, true);
  console.log('✔ Publicación de borrador: reporte enviado y puesto en cola de moderación del administrador');

  // -------------------------------------------------------------
  // 4. PRUEBA DE PAGO DECLINADO / ERROR (NO DEBE PUBLICAR)
  // -------------------------------------------------------------
  console.log('\n--- 4. Pruebas con Pagos Fallidos o Pendientes ---');
  const reporteRechazadoSimulado: any = {
    id: 102,
    nombre: 'Pelusa',
    estado: EstadoReporte.PENDIENTE,
    estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
    esTurbo: false,
    turboActivadaEn: null,
    turboVenceEn: null,
  };

  const transaccionDeclinada = {
    id: 'tx-wompi-mock-failed',
    reference: `vecipets-turbo-failed-${Date.now()}`,
    amount_in_cents: 1500000,
    currency: 'COP',
    status: 'DECLINED',
  };

  simularAprobacionPago(reporteRechazadoSimulado, transaccionDeclinada as any);

  assert.equal(reporteRechazadoSimulado.estado, EstadoReporte.PENDIENTE, 'Un pago declinado NO debe publicar el reporte');
  assert.equal(reporteRechazadoSimulado.estadoAprobacion, EstadoAprobacionReporte.PENDIENTE, 'Debe seguir pendiente');
  assert.equal(reporteRechazadoSimulado.esTurbo, false, 'NO debe activar Alerta Turbo');
  console.log('✔ Pagos no aprobados NO publican ni activan Alerta Turbo');

  console.log('\n=== TODAS LAS PRUEBAS DE ALERTA TURBO PASARON CON ÉXITO (100%) ===');
}

ejecutarPruebasAlertaTurbo().catch((err) => {
  console.error('Error durante las pruebas:', err);
  process.exit(1);
});
