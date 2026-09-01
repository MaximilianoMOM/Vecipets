import 'dotenv/config';
import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando roles iniciales en Supabase...');

  const roles = [
    {
      nombre: RoleName.CIUDADANO,
      descripcion: 'Ciudadano general registrado en la plataforma',
    },
    {
      nombre: RoleName.ADMINISTRADOR,
      descripcion: 'Administrador general y moderador del sistema',
    },
    {
      nombre: RoleName.REFUGIO,
      descripcion: 'Refugio o fundación de rescate autorizada',
    },
    {
      nombre: RoleName.VETERINARIA,
      descripcion: 'Veterinaria o centro médico aliado',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { nombre: role.nombre },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles creados exitosamente en Supabase PostgreSQL');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });