import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarRecompensaAReporte1795528500000 implements MigrationInterface {
  name = 'AgregarRecompensaAReporte1795528500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reportes"
      ADD COLUMN "recompensa" numeric(10, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reportes"
      DROP COLUMN "recompensa"
    `);
  }
}
