import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SepararBorradoresDeModeracion1795708800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE reportes ADD COLUMN enviado_revision boolean NOT NULL DEFAULT true');
    await queryRunner.query(`
      UPDATE reportes AS reporte
      SET enviado_revision = false
      WHERE reporte.estado = 'PENDIENTE' AND NOT reporte.es_turbo
      AND EXISTS (
        SELECT 1 FROM pagos WHERE pagos.reporte_id = reporte.id AND pagos.concepto = 'ALERTA_TURBO'
      )
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE reportes DROP COLUMN enviado_revision');
  }
}
