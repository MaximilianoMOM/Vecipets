
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActualizarEstadosPago1795400000000
  implements MigrationInterface
{
  name = 'ActualizarEstadosPago1795400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pagos"
      DROP CONSTRAINT "pagos_estado_valido"
    `);

    await queryRunner.query(`
      ALTER TABLE "pagos"
      ADD CONSTRAINT "pagos_estado_valido"
      CHECK (
        "estado" IN (
          'PENDIENTE',
          'APROBADO',
          'RECHAZADO',
          'EXPIRADO',
          'ERROR',
          'ANULADO'
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pagos"
      DROP CONSTRAINT "pagos_estado_valido"
    `);

    await queryRunner.query(`
      ALTER TABLE "pagos"
      ADD CONSTRAINT "pagos_estado_valido"
      CHECK (
        "estado" IN (
          'PENDIENTE',
          'APROBADO',
          'RECHAZADO',
          'EXPIRADO'
        )
      )
    `);
  }
}
