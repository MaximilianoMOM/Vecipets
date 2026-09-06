# VeciPets Backend API (NestJS + Prisma + PostgreSQL)

API RESTful para la plataforma **VeciPets**.

## 🚀 Requisitos e Instalación

Para ver la guía completa paso a paso de todo el proyecto, consulta el [README principal en la raíz](../../README.md).

### Instalación Rápida
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno en .env
# PORT=4000
# JWT_SECRET=vecipets_super_secret_jwt_key_2026
# REFRESH_TOKEN_SECRET=vecipets_super_secret_refresh_key_2026
# DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/vecipets?schema=public"

# 3. Generar cliente Prisma
npx prisma generate

# 4. Migrar base de datos y sembrar datos iniciales (Admin)
npx prisma migrate dev --name init
npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run start:dev
```

### 🔐 Credenciales del Administrador
* **Correo:** `administradorvecipets@gmail.com`
* **Contraseña:** `vecipets2026`
* **Rol:** `ADMINISTRADOR`
