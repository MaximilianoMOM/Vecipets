/*
  Warnings:

  - You are about to drop the column `updated_at` on the `usuarios` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- DropForeignKey
ALTER TABLE "reportes" DROP CONSTRAINT "reportes_mascota_id_fkey";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "updated_at",
ADD COLUMN     "estado" "UserStatus" NOT NULL DEFAULT 'PENDIENTE';

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_mascota_id_fkey" FOREIGN KEY ("mascota_id") REFERENCES "mascotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
