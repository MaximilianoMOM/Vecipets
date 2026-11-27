import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarSolicitudEstablecimiento1795710600000 implements MigrationInterface {
  name = 'AgregarSolicitudEstablecimiento1795710600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE usuarios
        ADD COLUMN solicitud_establecimiento jsonb,
        ADD CONSTRAINT usuarios_solicitud_establecimiento_valida CHECK (
          solicitud_establecimiento IS NULL OR (
            rol IN ('REFUGIO', 'VETERINARIA')
            AND jsonb_typeof(solicitud_establecimiento) = 'object'
            AND COALESCE(length(btrim(solicitud_establecimiento->>'nombre')) BETWEEN 1 AND 100, false)
            AND COALESCE(length(btrim(solicitud_establecimiento->>'direccion')) BETWEEN 1 AND 180, false)
            AND (
              COALESCE(length(btrim(solicitud_establecimiento->>'instagram')) > 0, false)
              OR COALESCE(length(btrim(solicitud_establecimiento->>'facebook')) > 0, false)
              OR COALESCE(length(btrim(solicitud_establecimiento->>'tiktok')) > 0, false)
            )
          )
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE usuarios
        DROP CONSTRAINT usuarios_solicitud_establecimiento_valida,
        DROP COLUMN solicitud_establecimiento
    `);
  }
}
