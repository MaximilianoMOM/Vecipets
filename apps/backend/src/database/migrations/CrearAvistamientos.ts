import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearAvistamientos1795651200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE avistamientos (
        id serial PRIMARY KEY,
        reporte_id integer NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
        usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
        direccion varchar(200) NOT NULL,
        barrio_sector varchar(150) NOT NULL,
        latitud double precision NOT NULL CHECK (latitud BETWEEN -90 AND 90),
        longitud double precision NOT NULL CHECK (longitud BETWEEN -180 AND 180),
        comentario varchar(1000) NOT NULL,
        fecha_avistamiento timestamptz NOT NULL,
        imagen_tipo varchar,
        imagen bytea,
        visible boolean NOT NULL DEFAULT true,
        creado_en timestamptz NOT NULL DEFAULT now(),
        actualizado_en timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX avistamientos_reporte_fecha ON avistamientos (reporte_id, fecha_avistamiento DESC)');
    await queryRunner.query('CREATE INDEX avistamientos_usuario_creacion ON avistamientos (usuario_id, creado_en DESC)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE avistamientos');
  }
}
