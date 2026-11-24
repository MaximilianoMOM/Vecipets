import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablaNotificaciones1795600000000 implements MigrationInterface {
  name = 'CrearTablaNotificaciones1795600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notificaciones" (
        "id" SERIAL PRIMARY KEY,
        "titulo" character varying(150) NOT NULL,
        "usuario_nombre" character varying(150) NOT NULL,
        "reporte_id" integer NOT NULL,
        "monto" character varying(50) NOT NULL DEFAULT '$15.000 COP',
        "referencia" character varying(100) NOT NULL UNIQUE,
        "fecha_pago" TIMESTAMP WITH TIME ZONE NOT NULL,
        "estado" character varying(30) NOT NULL DEFAULT 'Aprobado',
        "enlace_reporte" character varying(255) NOT NULL,
        "leida" boolean NOT NULL DEFAULT false,
        "creado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "notificaciones"
    `);
  }
}
