'use client';

import { useEffect, useState } from 'react';

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  activo: boolean;
  estado: string;
  createdAt: string;
  role: {
    nombre: string;
    descripcion?: string | null;
  };
}

interface Ubicacion {
  id: string;
  direccion: string;
  comuna: string;
  barrio: string;
  latitud: string | number;
  longitud: string | number;
}

interface Refugio {
  id: string;
  nombre: string;
  capacidad: number;
  horario: string;
  sitioWeb?: string | null;
  createdAt: string;
  usuario: Usuario;
  ubicacion: Ubicacion;
}

interface Estadisticas {
  totalRefugios: number;
  refugiosActivos: number;
  capacidadTotal: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api/v1';

const obtenerToken = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('vecipets_access_token');

  console.log('¿Existe token?:', !!token);
  console.log('Longitud del token:', token?.length);

  return token;
};

export default function RefugiosPage() {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<Estadisticas>({
      totalRefugios: 0,
      refugiosActivos: 0,
      capacidadTotal: 0,
    });

  const [refugioSeleccionado, setRefugioSeleccionado] =
    useState<Refugio | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      const token = obtenerToken();

      if (!token) {
        setError(
          'No se encontró el token de autenticación. Inicia sesión nuevamente.',
        );
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [refugiosResponse, estadisticasResponse] =
        await Promise.all([
          fetch(`${API_URL}/refugios`, {
            method: 'GET',
            headers,
          }),

          fetch(`${API_URL}/refugios/estadisticas`, {
            method: 'GET',
            headers,
          }),
        ]);

      if (refugiosResponse.status === 401) {
        throw new Error(
          'No autorizado. El token puede haber expirado.',
        );
      }

      if (refugiosResponse.status === 403) {
        throw new Error(
          'No tienes permisos de administrador para consultar los refugios.',
        );
      }

      if (!refugiosResponse.ok) {
        throw new Error(
          `Error al cargar refugios: ${refugiosResponse.status}`,
        );
      }

      if (!estadisticasResponse.ok) {
        throw new Error(
          `Error al cargar estadísticas: ${estadisticasResponse.status}`,
        );
      }

      const refugiosData =
        await refugiosResponse.json();

      const estadisticasData =
        await estadisticasResponse.json();

      setRefugios(refugiosData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error(
        'Error cargando refugios:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar los refugios.',
      );
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = async (id: string) => {
    try {
      const token = obtenerToken();

      if (!token) {
        setError(
          'No se encontró el token de autenticación.',
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/refugios/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener el refugio: ${response.status}`,
        );
      }

      const data = await response.json();

      setRefugioSeleccionado(data);
    } catch (err) {
      console.error(
        'Error obteniendo detalle:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible obtener el detalle del refugio.',
      );
    }
  };

  const cerrarDetalle = () => {
    setRefugioSeleccionado(null);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString(
      'es-CO',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-100 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>

              <p className="text-gray-600">
                Cargando refugios...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Refugios
              </h1>

              <p className="mt-2 text-gray-600">
                Consulta y administra los refugios
                registrados en VeciPets.
              </p>
            </div>

            <button
              onClick={cargarDatos}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">
              Ocurrió un error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total de refugios
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {estadisticas.totalRefugios}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Refugios activos
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {estadisticas.refugiosActivos}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Capacidad total
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {estadisticas.capacidadTotal}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              animales
            </p>
          </div>
        </div>

        {/* LISTA DE REFUGIOS */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Refugios registrados
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {refugios.length}{' '}
                {refugios.length === 1
                  ? 'refugio encontrado'
                  : 'refugios encontrados'}
              </p>
            </div>
          </div>

          {refugios.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">
                🏠
              </div>

              <h3 className="text-xl font-semibold text-gray-700">
                No hay refugios registrados
              </h3>

              <p className="mt-2 text-gray-500">
                Actualmente no existen refugios
                registrados en VeciPets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {refugios.map((refugio) => (
                <div
                  key={refugio.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* CABECERA CARD */}
                  <div className="border-b border-gray-100 bg-green-50 p-6">
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl">
                          🏠
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {refugio.nombre}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Refugio VeciPets
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          refugio.usuario.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {refugio.usuario.activo
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="space-y-4 p-6">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Responsable
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {refugio.usuario.nombreCompleto}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Correo
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-700">
                          {refugio.usuario.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Teléfono
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {refugio.usuario.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Capacidad
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {refugio.capacidad}{' '}
                          animales
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Horario
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {refugio.horario}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Ubicación
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {refugio.ubicacion.direccion}
                      </p>

                      <p className="text-sm text-gray-500">
                        {refugio.ubicacion.barrio},{' '}
                        {refugio.ubicacion.comuna}
                      </p>
                    </div>

                    {/* BOTÓN DETALLE */}
                    <button
                      onClick={() =>
                        abrirDetalle(refugio.id)
                      }
                      className="mt-2 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DETALLE */}
      {refugioSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={cerrarDetalle}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {refugioSeleccionado.nombre}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Información completa del refugio
                </p>
              </div>

              <button
                onClick={cerrarDetalle}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-6">

              {/* DATOS DEL REFUGIO */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-green-700">
                  Información del refugio
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Nombre
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {refugioSeleccionado.nombre}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Capacidad
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {refugioSeleccionado.capacidad}{' '}
                      animales
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Horario
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {refugioSeleccionado.horario}
                    </p>
                  </div>

                  {refugioSeleccionado.sitioWeb && (
                    <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Sitio web
                      </p>

                      <a
                        href={
                          refugioSeleccionado.sitioWeb
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-blue-600 hover:underline"
                      >
                        {
                          refugioSeleccionado.sitioWeb
                        }
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* UBICACIÓN */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-green-700">
                  Ubicación
                </h3>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">
                    {
                      refugioSeleccionado.ubicacion
                        .direccion
                    }
                  </p>

                  <p className="mt-1 text-gray-600">
                    Barrio:{' '}
                    {
                      refugioSeleccionado.ubicacion
                        .barrio
                    }
                  </p>

                  <p className="text-gray-600">
                    Comuna:{' '}
                    {
                      refugioSeleccionado.ubicacion
                        .comuna
                    }
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Coordenadas:{' '}
                    {
                      refugioSeleccionado.ubicacion
                        .latitud
                    }
                    ,{' '}
                    {
                      refugioSeleccionado.ubicacion
                        .longitud
                    }
                  </p>
                </div>
              </div>

              {/* RESPONSABLE */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-green-700">
                  Responsable
                </h3>

                <div className="rounded-lg bg-gray-50 p-4">

                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Nombre completo
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {
                        refugioSeleccionado.usuario
                          .nombreCompleto
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Correo
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-700">
                        {
                          refugioSeleccionado.usuario
                            .email
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Teléfono
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {
                          refugioSeleccionado.usuario
                            .telefono
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Estado
                      </p>

                      <p className="mt-1 text-sm font-semibold text-green-600">
                        {
                          refugioSeleccionado.usuario
                            .estado
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Registro
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatearFecha(
                          refugioSeleccionado.usuario
                            .createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE REGISTRO */}
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  <strong>Nota:</strong> desde este
                  módulo se administra la información
                  general del refugio. Los datos médicos
                  de los animales, como vacunación o
                  desparasitación, corresponden al módulo
                  de veterinarias.
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-gray-100 p-6">
              <button
                onClick={cerrarDetalle}
                className="w-full rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}