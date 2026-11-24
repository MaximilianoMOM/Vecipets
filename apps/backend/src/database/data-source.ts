
import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Pago } from '../pagos/pago.entity';
import { IntentoPago } from '../pagos/intento-pago.entity';
import { Reporte } from '../reportes/reporte.entity';
import { Usuario } from '../usuarios/usuario.entity';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('No se ha configurado DATABASE_URL');
}

const isProduction = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,

  entities: [
    Pago,
    IntentoPago,
    Reporte,
    Usuario,
  ],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,

  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});

export default AppDataSource;
