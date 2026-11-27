import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearAliadosMapa1795651200001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE aliados_mapa (
        id serial PRIMARY KEY,
        tipo varchar NOT NULL CHECK (tipo IN ('veterinaria', 'refugio')),
        nombre varchar NOT NULL,
        direccion varchar NOT NULL,
        municipio varchar NOT NULL,
        latitud double precision NOT NULL CHECK (latitud BETWEEN -90 AND 90),
        longitud double precision NOT NULL CHECK (longitud BETWEEN -180 AND 180),
        contacto text,
        horarios text,
        servicios text,
        descripcion text,
        publicado boolean NOT NULL DEFAULT false
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE aliados_mapa');
  }
}
