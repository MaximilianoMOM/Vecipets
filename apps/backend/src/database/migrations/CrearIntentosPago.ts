
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearIntentosPago1795303344703 implements MigrationInterface {
  name = 'CrearIntentosPago1795303344703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "intentos_pago" (
        "id" SERIAL NOT NULL,
        "pago_id" integer NOT NULL,
        "wompi_transaction_id" character varying(100) NOT NULL,
        "estado" character varying(20) NOT NULL,
        "monto_centavos" integer NOT NULL,
        "moneda" character varying(3) NOT NULL,
        "metodo_pago" character varying(30),
        "creado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_intentos_pago" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_intentos_pago_wompi_transaction_id"
          UNIQUE ("wompi_transaction_id"),
        CONSTRAINT "FK_intentos_pago_pago"
          FOREIGN KEY ("pago_id")
          REFERENCES "pagos"("id")
          ON DELETE RESTRICT
          ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_intentos_pago_pago_id"
      ON "intentos_pago" ("pago_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_intentos_pago_pago_id"
    `);

    await queryRunner.query(`
      DROP TABLE "intentos_pago"
    `);
  }
}
