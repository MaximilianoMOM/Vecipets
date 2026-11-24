
import assert from 'node:assert/strict';

import { AlmacenamientoService } from '../src/reportes/almacenamiento.service';
import { ValidacionImagenesService } from '../src/validacion-imagenes/validacion-imagenes.service';

async function ejecutarPruebasFase1() {
  console.log('--- INICIANDO PRUEBAS UNITARIAS FASE 1 ---');

  // 1. PRUEBAS DE ALMACENAMIENTO

  const almacenamiento = new AlmacenamientoService();

  const bufferJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  ]);

  const extJpeg = almacenamiento.validarBuffer(
    bufferJpeg,
    'image/jpeg',
  );

  assert.equal(extJpeg, 'jpg');
  console.log('✔ Validación de firma JPEG correcta');

  const bufferPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const extPng = almacenamiento.validarBuffer(
    bufferPng,
    'image/png',
  );

  assert.equal(extPng, 'png');
  console.log('✔ Validación de firma PNG correcta');

  const bufferInvalido = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
  ]);

  assert.throws(
    () =>
      almacenamiento.validarBuffer(
        bufferInvalido,
        'image/jpeg',
      ),
    /El archivo no corresponde a una imagen válida/,
  );

  console.log('✔ Rechazo de archivo inválido correcto');

  // 2. PRUEBAS DE VALIDACIÓN CON ROBOFLOW

  const mockConfigService = {
    get: () => 'valor-de-prueba',
  } as any;

  const validacionService = new ValidacionImagenesService(
    mockConfigService,
  );

  const archivo = {
    originalname: 'mascota.jpg',
    mimetype: 'image/jpeg',
    size: 100,
    buffer: bufferJpeg,
  };

  // CASO 1: Mascota detectada con suficiente confianza.

  validacionService.analizarConRoboflow = async () => ({
    review_status: 'eligible_for_publication',
    candidate_count: 1,
    confident_count: 1,
  });

  const decisionAprobada =
    await validacionService.validarImagenReporte(archivo);

  assert.equal(decisionAprobada.estado, 'APROBADA');
  assert.equal(decisionAprobada.aprobada, true);
  assert.equal(decisionAprobada.errorServicio, false);
  assert.equal(decisionAprobada.animal.contieneAnimal, true);

  console.log('✔ Publicación automática con mascota confirmada');

  // CASO 2: Detección dudosa.

  validacionService.analizarConRoboflow = async () => ({
    review_status: 'manual_review_uncertain',
    candidate_count: 1,
    confident_count: 0,
  });

  const decisionDudosa =
    await validacionService.validarImagenReporte(archivo);

  assert.equal(decisionDudosa.estado, 'DUDOSA');
  assert.equal(decisionDudosa.aprobada, false);
  assert.equal(decisionDudosa.esDudosa, true);
  assert.equal(decisionDudosa.errorServicio, false);

  console.log('✔ Detección dudosa enviada a revisión administrativa');

  // CASO 3: No se detectó ninguna mascota.

  validacionService.analizarConRoboflow = async () => ({
    review_status: 'manual_review_no_pet',
    candidate_count: 0,
    confident_count: 0,
  });

  const decisionSinMascota =
    await validacionService.validarImagenReporte(archivo);

  assert.equal(decisionSinMascota.estado, 'DUDOSA');
  assert.equal(decisionSinMascota.aprobada, false);
  assert.equal(decisionSinMascota.esDudosa, true);
  assert.equal(decisionSinMascota.animal.contieneAnimal, false);

  console.log('✔ Imagen sin mascota enviada a revisión administrativa');

  // CASO 4: Fallo del servicio de Roboflow.

  validacionService.analizarConRoboflow = async () => {
    throw new Error('Network timeout con Roboflow');
  };

  const decisionErrorServicio =
    await validacionService.validarImagenReporte(archivo);

  assert.equal(decisionErrorServicio.estado, 'DUDOSA');
  assert.equal(decisionErrorServicio.aprobada, false);
  assert.equal(decisionErrorServicio.errorServicio, true);

  console.log('✔ Fallo de Roboflow manejado de forma segura');

  console.log('--- TODAS LAS PRUEBAS FASE 1 PASARON EXITOSAMENTE ---');
}

ejecutarPruebasFase1().catch((error) => {
  console.error('Error en pruebas Fase 1:', error);
  process.exit(1);
});
