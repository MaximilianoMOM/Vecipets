# 🐾 VeciPets - Plataforma Comunitaria de Mascotas Reportadas

VeciPets es una plataforma monorepo full-stack diseñada para la publicación, geolocalización y gestión comunitaria de reportes de mascotas perdidas y encontradas.

---

## 🚀 Requisitos Previos

Antes de ejecutar el proyecto desde cero en cualquier equipo, asegúrate de tener instalado:

1. **Node.js**: Versión `v18.x` o superior (Recomendado v20.x o v22.x).
2. **npm**: Administrador de paquetes incluido con Node.js (`npm -v`).
3. **PostgreSQL**: Servidor de base de datos PostgreSQL instalado localmente (puerto `5432`) o una cuenta/instancia en la nube (**Supabase**, **Render**, **Neon**).
4. **Git**: Para clonar el repositorio.

---

## 📁 Estructura del Monorepo

```text
VeciPets-4-09-26/
├── apps/
│   ├── backend/     # API REST NestJS (TypeScript, Prisma ORM, JWT, Bcrypt)
│   └── frontend/    # Web Next.js 16 (React 19, Turbopack, Tailwind CSS, Leaflet)
├── package.json     # Configuración monorepo raíz
└── README.md        # Documentación principal del proyecto
```

---

## ⚡ Guía Paso a Paso para Instalar e Iniciar desde Cero

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd VeciPets-4-09-26
```

---

### 2. Configuración e Instalación del Backend (`apps/backend`)

Abre una terminal y dirígete al directorio del backend:

```bash
cd apps/backend
npm install
```

#### a. Crear el archivo de Variables de Entorno (`.env`)
Crea un archivo llamado `.env` dentro del directorio `apps/backend/` con el siguiente contenido:

```env
PORT=4000
JWT_SECRET=vecipets_super_secret_jwt_key_2026
REFRESH_TOKEN_SECRET=vecipets_super_secret_refresh_key_2026
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/vecipets?schema=public"
```

> **Nota:** Reemplaza `TU_CONTRASEÑA` por la clave de tu usuario de PostgreSQL local o ingresa tu URL de conexión de **Supabase**.

#### b. Generar el Cliente de Prisma y Ejecutar la Base de Datos
```bash
# 1. Generar cliente Prisma en node_modules
npx prisma generate

# 2. Sincronizar o crear las tablas de la base de datos
npx prisma migrate dev --name init

# 3. Poblado inicial de datos (Roles y Administrador por defecto)
npx prisma db seed
```

#### c. Iniciar el Servidor Backend
```bash
npm run start:dev
```
*(El backend quedará activo escuchando en `http://localhost:4000/api/v1`)*.

---

### 3. Configuración e Instalación del Frontend (`apps/frontend`)

Abre una **segunda terminal** y dirígete a la carpeta del frontend:

```bash
cd apps/frontend
npm install
```

#### Iniciar la Aplicación Frontend
```bash
npm run dev
```
*(El frontend quedará activo en `http://localhost:3000`)*.

---

## 🔐 Credenciales del Administrador (Poblado de Datos / Seed)

Al ejecutar el comando `npx prisma db seed` en el backend, la base de datos registra los roles del sistema (`CIUDADANO`, `ADMINISTRADOR`, `REFUGIO`, `VETERINARIA`) y crea la cuenta de administración por defecto:

* **URL de Inicio de Sesión:** [http://localhost:3000/login](http://localhost:3000/login)
* **Correo Electrónico:** `administradorvecipets@gmail.com`
* **Contraseña:** `vecipets2026`
* **Rol:** `ADMINISTRADOR`
* **Estado:** `APROBADO`

---

## 👥 Roles y Permisos en la Plataforma

| Rol | Descripción | Proceso de Activación |
| :--- | :--- | :--- |
| **`CIUDADANO`** | Vecino que puede publicar reportes de mascotas perdidas o encontradas y contactar a otros dueños. | Automático al registrarse. |
| **`ADMINISTRADOR`** | Moderador principal con acceso a solicitudes pendientes, moderación general y gestión de casos. | Creado por Seed inicial. |
| **`REFUGIO`** | Albergue o fundación de rescate animal registrado con capacidad y ubicación en mapa. | Requiere aprobación previa de un Administrador. |
| **`VETERINARIA`** | Clínica o centro veterinario registrado con atención 24h y geolocalización. | Requiere aprobación previa de un Administrador. |

---

## 🗺️ Módulos y Rutas Principales del Frontend

* **Página Principal:** [http://localhost:3000/](http://localhost:3000/)
* **Mapa Explorador en Vivo:** [http://localhost:3000/mapa](http://localhost:3000/mapa)
* **Catálogo de Reportes:** [http://localhost:3000/reportes](http://localhost:3000/reportes)
* **Publicar Reporte:** [http://localhost:3000/reportar](http://localhost:3000/reportar)
* **Refugios y Veterinarias:** [http://localhost:3000/refugios](http://localhost:3000/refugios) y [http://localhost:3000/veterinarias](http://localhost:3000/veterinarias)
* **Panel de Moderación:** [http://localhost:3000/moderacion](http://localhost:3000/moderacion)

---

## 🧪 Pruebas de Compilación (Build de Producción)

Para validar que todo el código TypeScript compila limpiamente antes de desplegar en servidores (como Vercel o Render):

```bash
# Compilar Backend (NestJS)
cd apps/backend
npm run build

# Compilar Frontend (Next.js)
cd apps/frontend
npm run build
```
