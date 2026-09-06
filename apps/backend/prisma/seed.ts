
import 'dotenv/config';

import {
  PrismaClient,
  RoleName,
  UserStatus,
} from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales en Supabase...');

  // =========================================================
  // ROLES
  // =========================================================

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
      where: {
        nombre: role.nombre,
      },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles creados/verificados');

  // =========================================================
  // BUSCAR ROL ADMINISTRADOR
  // =========================================================

  const adminRole = await prisma.role.findUnique({
    where: {
      nombre: RoleName.ADMINISTRADOR,
    },
  });

  if (!adminRole) {
    throw new Error('❌ No se encontró el rol ADMINISTRADOR');
  }

  // =========================================================
  // CREAR CONTRASEÑA ENCRIPTADA
  // =========================================================

  const passwordHash = await bcrypt.hash('vecipets2026', 10);

  // =========================================================
  // CREAR / ACTUALIZAR ADMINISTRADOR
  // =========================================================

  await prisma.user.upsert({
    where: {
      email: 'administradorvecipets@gmail.com',
    },

    update: {
      roleId: adminRole.id,
      estado: UserStatus.APROBADO,
      activo: true,
      passwordHash,
    },

    create: {
      nombreCompleto: 'Administrador VeciPets',
      email: 'administradorvecipets@gmail.com',
      passwordHash,
      telefono: '3000000000',
      roleId: adminRole.id,
      estado: UserStatus.APROBADO,
      activo: true,
    },
  });

  console.log('✅ Administrador creado/verificado');
  console.log('📧 Email: administradorvecipets@gmail.com');
  console.log('🔐 Contraseña configurada correctamente');
  console.log('👤 Rol: ADMINISTRADOR');
  console.log('🟢 Estado: APROBADO');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

