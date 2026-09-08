'use client';

import { useEffect, useState } from 'react';
import { authAPI, reportesAPI, Usuario, Reporte } from '@/lib/api-client';

export default function PerfilPage() {
const [usuario, setUsuario] = useState<Usuario | null>(null);
const [reportes, setReportes] = useState<Reporte[]>([]);
const [loading, setLoading] = useState(true);
const [loadingReportes, setLoadingReportes] = useState(true);
const [error, setError] = useState('');

const [nombre, setNombre] = useState('');
const [telefono, setTelefono] = useState('');
const [guardando, setGuardando] = useState(false);
const [mensaje, setMensaje] = useState('');

useEffect(() => {
cargarPerfil();
}, []);

const cargarPerfil = async () => {
try {
setLoading(true);
setError('');


  const perfil = await authAPI.getPerfil();

  setUsuario(perfil);
  setNombre(perfil.nombre || '');
  setTelefono(perfil.telefono || '');

  await cargarReportes(perfil.id);
} catch (err: any) {
  console.error('Error cargando perfil:', err);

  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('vecipets_user');

    if (storedUser) {
      try {
        const usuarioGuardado = JSON.parse(storedUser) as Usuario;

        setUsuario(usuarioGuardado);
        setNombre(usuarioGuardado.nombre || '');
        setTelefono(usuarioGuardado.telefono || '');

        await cargarReportes(usuarioGuardado.id);
        return;
      } catch (storageError) {
        console.error(
          'Error leyendo usuario guardado:',
          storageError
        );
      }
    }
  }

  setError('No se pudo cargar la información del perfil.');
} finally {
  setLoading(false);
}


};

const cargarReportes = async (usuarioId: string) => {
try {
setLoadingReportes(true);


  const data = await reportesAPI.getReportes();

  const misReportes = data.filter(
    (reporte) => reporte.usuarioId === usuarioId
  );

  setReportes(misReportes);
} catch (err) {
  console.error('Error cargando reportes:', err);
  setReportes([]);
} finally {
  setLoadingReportes(false);
}


};

const guardarCambios = async () => {
if (!usuario) return;


try {
  setGuardando(true);
  setMensaje('');

  const usuarioActualizado: Usuario = {
    ...usuario,
    nombre,
    telefono,
  };

  setUsuario(usuarioActualizado);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'vecipets_user',
      JSON.stringify(usuarioActualizado)
    );
  }

  setMensaje('Información actualizada correctamente.');
} catch (err) {
  console.error('Error guardando cambios:', err);
  setMensaje('No se pudieron guardar los cambios.');
} finally {
  setGuardando(false);
}


};

if (loading) {
return ( <main className="min-h-screen bg-gray-50 flex items-center justify-center"> <div className="text-center"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>

```
      <p className="mt-4 text-gray-600">
        Cargando perfil...
      </p>
    </div>
  </main>
);


}

if (!usuario) {
return ( <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4"> <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full"> <div className="text-5xl mb-4">⚠️</div>


      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        No se pudo cargar el perfil
      </h1>

      <p className="text-gray-600 mb-6">
        {error || 'No encontramos la información del usuario.'}
      </p>

      <a
        href="/login"
        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
      >
        Iniciar sesión
      </a>
    </div>
  </main>
);


}

const rolUsuario = usuario.rol?.toUpperCase() || '';

const esAdministrador = rolUsuario === 'ADMINISTRADOR';
const esRefugio = rolUsuario === 'REFUGIO';
const esVeterinaria = rolUsuario === 'VETERINARIA';

const estadoUsuario = usuario.estado?.toUpperCase() || '';

const nombreMostrar = usuario.nombre || 'Usuario';

const nombreIniciales =
nombreMostrar
.split(' ')
.filter(Boolean)
.slice(0, 2)
.map((parte) => parte[0]?.toUpperCase())
.join('') || 'U';

const colorEstado =
estadoUsuario === 'APROBADO'
? 'bg-green-100 text-green-700'
: estadoUsuario === 'RECHAZADO'
? 'bg-red-100 text-red-700'
: 'bg-yellow-100 text-yellow-700';

const colorRol =
esAdministrador
? 'bg-purple-100 text-purple-700'
: esRefugio
? 'bg-orange-100 text-orange-700'
: esVeterinaria
? 'bg-blue-100 text-blue-700'
: 'bg-green-100 text-green-700';

return ( <main className="min-h-screen bg-gray-50 py-8 px-4"> <div className="max-w-6xl mx-auto">

```
    {/* ENCABEZADO */}
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
      <div className="bg-linear-to-r from-green-600 to-green-500 px-6 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* AVATAR */}
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-green-600">
              {nombreIniciales}
            </span>
          </div>

          <div className="text-center md:text-left text-white">
            <h1 className="text-3xl md:text-4xl font-bold">
              {nombreMostrar}
            </h1>

            <p className="mt-2 text-green-50">
              {usuario.email || 'Sin correo registrado'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${colorRol}`}
              >
                {esAdministrador
                  ? '👑 Administrador'
                  : esRefugio
                    ? '🏠 Refugio'
                    : esVeterinaria
                      ? '🩺 Veterinaria'
                      : '👤 Ciudadano'}
              </span>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${colorEstado}`}
              >
                {estadoUsuario === 'APROBADO'
                  ? '✓ Aprobado'
                  : estadoUsuario === 'RECHAZADO'
                    ? '✕ Rechazado'
                    : '⏳ Pendiente'}
              </span>

            </div>
          </div>
        </div>
      </div>
    </div>

    {/* CONTENIDO PRINCIPAL */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* INFORMACIÓN PERSONAL */}
      <section
        className={
          esAdministrador
            ? 'lg:col-span-7'
            : 'lg:col-span-12'
        }
      >
        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Información personal
              </h2>

              <p className="text-sm text-gray-500">
                Administra la información de tu cuenta
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {/* NOMBRE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>

              <input
                type="email"
                value={usuario.email || ''}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed"
              />
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>

              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ingresa tu teléfono"
              />
            </div>

            {/* ROL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rol
              </label>

              <div className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-3 text-gray-700">
                {esAdministrador
                  ? 'Administrador'
                  : esRefugio
                    ? 'Refugio'
                    : esVeterinaria
                      ? 'Veterinaria'
                      : 'Ciudadano'}
              </div>
            </div>

            {/* ESTADO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado de la cuenta
              </label>

              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${colorEstado}`}
                >
                  {estadoUsuario === 'APROBADO'
                    ? '✓ Aprobado'
                    : estadoUsuario === 'RECHAZADO'
                      ? '✕ Rechazado'
                      : '⏳ Pendiente'}
                </span>
              </div>
            </div>

            <button
              onClick={guardarCambios}
              disabled={guardando}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>

            {mensaje && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-center">
                {mensaje}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* PANEL ADMINISTRADOR */}
      {esAdministrador && (
        <section className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Panel de administración
                </h2>

                <p className="text-sm text-gray-500">
                  Gestiona VeciPets
                </p>
              </div>
            </div>

            <div className="space-y-3">

              <a
                href="/admin"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-center px-4 py-3 rounded-xl transition"
              >
                📊 Panel principal
              </a>

              <a
                href="/admin/usuarios"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-center px-4 py-3 rounded-xl transition"
              >
                👥 Gestionar usuarios
              </a>

              <a
                href="/admin/refugios"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-center px-4 py-3 rounded-xl transition"
              >
                🏠 Gestionar refugios
              </a>

              <a
                href="/admin/veterinarias"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-center px-4 py-3 rounded-xl transition"
              >
                🩺 Gestionar veterinarias
              </a>

            </div>
          </div>
        </section>
      )}

      {/* INFORMACIÓN DEL REFUGIO */}
      {esRefugio && usuario.refugio && (
        <section className="lg:col-span-12">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">

            <div className="bg-linear-to-r from-orange-500 to-orange-400 px-6 py-5">
              <div className="flex items-center gap-3 text-white">

                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🏠</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Información del refugio
                  </h2>

                  <p className="text-orange-50">
                    Datos registrados de tu refugio
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* NOMBRE */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Nombre del refugio
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.nombre || 'No registrado'}
                  </p>
                </div>

                {/* CAPACIDAD */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Capacidad
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.capacidad ?? 'No registrada'}
                  </p>
                </div>

                {/* HORARIO */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Horario de atención
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.horario || 'No registrado'}
                  </p>
                </div>

                {/* SITIO WEB */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Sitio web
                  </p>

                  {usuario.refugio.sitioWeb ? (
                    <a
                      href={usuario.refugio.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:underline wrap-break-word"
                    >
                      {usuario.refugio.sitioWeb}
                    </a>
                  ) : (
                    <p className="text-lg font-bold text-gray-800">
                      No registrado
                    </p>
                  )}
                </div>

                {/* DIRECCIÓN */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Dirección
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.ubicacion?.direccion ||
                      'No registrada'}
                  </p>
                </div>

                {/* COMUNA */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Comuna
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.ubicacion?.comuna ||
                      'No registrada'}
                  </p>
                </div>

                {/* BARRIO */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Barrio
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.ubicacion?.barrio ||
                      'No registrado'}
                  </p>
                </div>

                {/* LATITUD */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Latitud
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.ubicacion?.latitud ??
                      'No registrada'}
                  </p>
                </div>

                {/* LONGITUD */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Longitud
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.refugio.ubicacion?.longitud ??
                      'No registrada'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* INFORMACIÓN DE LA VETERINARIA */}
      {esVeterinaria && usuario.veterinaria && (
        <section className="lg:col-span-12">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">

            <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-5">
              <div className="flex items-center gap-3 text-white">

                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🩺</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Información de la veterinaria
                  </h2>

                  <p className="text-blue-50">
                    Datos registrados de tu veterinaria
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* NOMBRE */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Nombre de la veterinaria
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.nombre ||
                      'No registrada'}
                  </p>
                </div>

                {/* URGENCIAS */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Urgencias 24 horas
                  </p>

                  <p
                    className={`text-lg font-bold ${
                      usuario.veterinaria.urgencias24h
                        ? 'text-green-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {usuario.veterinaria.urgencias24h
                      ? '✓ Sí, disponible'
                      : '✕ No disponible'}
                  </p>
                </div>

                {/* HORARIO */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Horario de atención
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.horario ||
                      'No registrado'}
                  </p>
                </div>

                {/* DIRECCIÓN */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Dirección
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.ubicacion?.direccion ||
                      'No registrada'}
                  </p>
                </div>

                {/* COMUNA */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Comuna
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.ubicacion?.comuna ||
                      'No registrada'}
                  </p>
                </div>

                {/* BARRIO */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Barrio
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.ubicacion?.barrio ||
                      'No registrado'}
                  </p>
                </div>

                {/* LATITUD */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Latitud
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.ubicacion?.latitud ??
                      'No registrada'}
                  </p>
                </div>

                {/* LONGITUD */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    Longitud
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {usuario.veterinaria.ubicacion?.longitud ??
                      'No registrada'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* MIS REPORTES */}
      {!esAdministrador && (
        <section className="lg:col-span-12">
          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Mis reportes publicados
                  </h2>

                  <p className="text-sm text-gray-500">
                    Reportes de mascotas que has registrado
                  </p>
                </div>

              </div>

              <a
                href="/reportes"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition text-center"
              >
                Ver reportes
              </a>

            </div>

            {loadingReportes ? (
              <div className="py-10 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">

                <div className="text-5xl mb-4">
                  📋
                </div>

                <h3 className="text-lg font-semibold text-gray-700">
                  No tienes reportes publicados
                </h3>

                <p className="text-gray-500 mt-2">
                  Aquí aparecerán los reportes que registres.
                </p>

                <a
                  href="/reportes/crear"
                  className="inline-block mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  + Crear reporte
                </a>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {reportes.map((reporte) => (
                  <div
                    key={reporte.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                  >

                    <div className="flex items-center justify-between gap-3 mb-3">

                      <span className="font-bold text-gray-800">
                        {reporte.tipo === 'PERDIDA'
                          ? '🔴 Mascota perdida'
                          : '🟢 Mascota encontrada'}
                      </span>

                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {reporte.estado || 'Pendiente'}
                      </span>

                    </div>

                    <h3 className="text-lg font-bold text-gray-800">
                      {reporte.nombreMascota ||
                        'Mascota sin nombre'}
                    </h3>

                    {reporte.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {reporte.descripcion}
                      </p>
                    )}

                    <a
                      href={`/reportes/${reporte.id}`}
                      className="block mt-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition"
                    >
                      Ver reporte
                    </a>

                  </div>
                ))}

              </div>
            )}

          </div>
        </section>
      )}

    </div>
  </div>
</main>


);
}
