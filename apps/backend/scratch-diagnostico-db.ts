import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env directamente desde la carpeta apps/backend
dotenv.config({ path: path.join(__dirname, '.env') });

import AppDataSource from './src/database/data-source';

async function diagnostico() {
  console.log('=== DIAGNÓSTICO DE BASE DE DATOS VECIPETS ===');

  try {
    // 1. Conexión a la base de datos
    console.log('Iniciando conexión con PostgreSQL...');
    await AppDataSource.initialize();
    console.log('✔ Conexión establecida con éxito.');

    // 2. Información del servidor y base de datos
    const infoDb = await AppDataSource.query(
      'SELECT current_database() as database_name, current_user as db_user, version() as pg_version;'
    );
    console.log('Base de datos conectada:', infoDb[0]?.database_name);
    console.log('Usuario de base de datos:', infoDb[0]?.db_user);

    // 3. Entidades registradas en TypeORM
    console.log('\n--- Entidades registradas en TypeORM ---');
    const entidades = AppDataSource.entityMetadatas.map((e: any) => ({
      nombreEntidad: e.name,
      nombreTabla: e.tableName,
      columnas: e.columns.map((c: any) => c.propertyName),
    }));
    entidades.forEach((e: any) => {
      console.log(`- Entidad ${e.nombreEntidad} -> Tabla '${e.nombreTabla}' (${e.columnas.length} columnas)`);
    });

    // 4. Tablas existentes en PostgreSQL (schema public)
    console.log('\n--- Tablas existentes en PostgreSQL (schema public) ---');
    const tablasDb = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const nombresTablas = tablasDb.map((t: any) => t.table_name);
    console.log('Tablas encontradas:', nombresTablas.join(', '));

    // Verificar tablas clave
    const tablasRequeridas = ['usuarios', 'reportes', 'pagos', 'intentos_pago'];
    for (const req of tablasRequeridas) {
      const existe = nombresTablas.includes(req);
      console.log(`  * Tabla '${req}': ${existe ? 'EXISTE ✔' : 'NO EXISTE ❌'}`);
    }

    // 5. Columnas de la tabla 'reportes'
    console.log('\n--- Columnas de la tabla "reportes" en PostgreSQL ---');
    const columnasReportes = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reportes' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    columnasReportes.forEach((c: any) => {
      console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`);
    });

    // 6. Migraciones ejecutadas vs pendientes
    console.log('\n--- Estado de migraciones ---');
    const existeTablaMigraciones = nombresTablas.includes('migrations');
    if (existeTablaMigraciones) {
      const migracionesEjecutadas = await AppDataSource.query(`
        SELECT id, timestamp, name 
        FROM migrations 
        ORDER BY timestamp ASC;
      `);
      console.log(`Migraciones registradas en tabla 'migrations' (${migracionesEjecutadas.length}):`);
      migracionesEjecutadas.forEach((m: any) => {
        console.log(`  ✔ [${m.id}] ${m.name} (timestamp: ${m.timestamp})`);
      });
    } else {
      console.log('Aviso: No se encontró tabla "migrations".');
    }

    const migracionesPendientes = await AppDataSource.showMigrations();
    console.log('¿Hay migraciones pendientes?:', migracionesPendientes ? 'SÍ' : 'NO (Esquema al día)');

    // 7. Verificación de los cinco pagos históricos
    console.log('\n--- Verificación de pagos históricos ---');
    const conteoPagos = await AppDataSource.query('SELECT COUNT(*) as total FROM pagos;');
    const totalPagos = parseInt(conteoPagos[0]?.total ?? '0', 10);
    console.log(`Total de registros en tabla 'pagos': ${totalPagos}`);

    const pagos = await AppDataSource.query(`
      SELECT id, referencia, monto_centavos, moneda, concepto, estado, creado_en 
      FROM pagos 
      ORDER BY id ASC;
    `);

    console.log(`Detalle de los registros encontrados (${pagos.length}):`);
    pagos.forEach((p: any) => {
      console.log(
        `  ID ${p.id} | Ref: ${p.referencia} | Monto: ${p.monto_centavos} ${p.moneda} | Concepto: ${p.concepto} | Estado: ${p.estado} | Creado: ${p.creado_en}`
      );
    });

    // 8. Intentos de pago registrados
    console.log('\n--- Intentos de pago registrados ---');
    const intentos = await AppDataSource.query(`
      SELECT id, pago_id, wompi_transaction_id, estado, monto_centavos, moneda, metodo_pago, creado_en
      FROM intentos_pago
      ORDER BY id ASC;
    `);
    console.log(`Total de registros en 'intentos_pago': ${intentos.length}`);
    intentos.forEach((it: any) => {
      console.log(
        `  ID ${it.id} | Pago ID: ${it.pago_id} | Wompi ID: ${it.wompi_transaction_id} | Estado: ${it.estado} | Monto: ${it.monto_centavos}`
      );
    });

    // 9. Reportes existentes
    console.log('\n--- Reportes registrados ---');
    const conteoReportes = await AppDataSource.query('SELECT COUNT(*) as total FROM reportes;');
    console.log(`Total de reportes en la base de datos: ${conteoReportes[0]?.total}`);

  } catch (err: any) {
    console.error('❌ Error durante el diagnóstico:', err.message || err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n✔ Conexión cerrada.');
    }
  }
}

diagnostico();
