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

interface Veterinaria {
  id: string;
  nombre: string;
  urgencias24h: boolean;
  horario: string;
  sitioWeb?: string | null;
  createdAt: string;
  usuario: Usuario;
  ubicacion: Ubicacion;
}

interface Estadisticas {
  totalVeterinarias: number;
  veterinariasActivas: number;
  veterinariasConUrgencias: number;
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

export default function VeterinariasPage() {
  const [veterinarias, setVeterinarias] = useState<
    Veterinaria[]
  >([]);

  const [estadisticas, setEstadisticas] =
    useState<Estadisticas>({
      totalVeterinarias: 0,
      veterinariasActivas: 0,
      veterinariasConUrgencias: 0,
    });

  const [
    veterinariaSeleccionada,
    setVeterinariaSeleccionada,
  ] = useState<Veterinaria | null>(null);

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

      const [
        veterinariasResponse,
        estadisticasResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/veterinarias`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_URL}/veterinarias/estadisticas`, {
          method: 'GET',
          headers,
        }),
      ]);

      if (veterinariasResponse.status === 401) {
        throw new Error(
          'No autorizado. El token puede haber expirado.',
        );
      }

      if (veterinariasResponse.status === 403) {
        throw new Error(
          'No tienes permisos de administrador para consultar las veterinarias.',
        );
      }

      if (!veterinariasResponse.ok) {
        throw new Error(
          `Error al cargar veterinarias: ${veterinariasResponse.status}`,
        );
      }

      if (!estadisticasResponse.ok) {
        throw new Error(
          `Error al cargar estadísticas: ${estadisticasResponse.status}`,
        );
      }

      const veterinariasData =
        await veterinariasResponse.json();

      const estadisticasData =
        await estadisticasResponse.json();

      setVeterinarias(veterinariasData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error(
        'Error cargando veterinarias:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar las veterinarias.',
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
        `${API_URL}/veterinarias/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 401) {
        throw new Error(
          'No autorizado. El token puede haber expirado.',
        );
      }

      if (response.status === 403) {
        throw new Error(
          'No tienes permisos para consultar esta veterinaria.',
        );
      }

      if (!response.ok) {
        throw new Error(
          `Error al obtener la veterinaria: ${response.status}`,
        );
      }

      const data = await response.json();

      setVeterinariaSeleccionada(data);
    } catch (err) {
      console.error(
        'Error obteniendo detalle:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible obtener el detalle de la veterinaria.',
      );
    }
  };

  const cerrarDetalle = () => {
    setVeterinariaSeleccionada(null);
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
                Cargando veterinarias...
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
                Veterinarias
              </h1>

              <p className="mt-2 text-gray-600">
                Consulta y administra las veterinarias
                registradas en VeciPets.
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

          {/* TOTAL */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de veterinarias
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {estadisticas.totalVeterinarias}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                🏥
              </div>
            </div>
          </div>

          {/* ACTIVAS */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Veterinarias activas
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {estadisticas.veterinariasActivas}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                ✓
              </div>
            </div>
          </div>

          {/* URGENCIAS */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Urgencias 24 horas
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-500">
                  {
                    estadisticas.veterinariasConUrgencias
                  }
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl">
                🚨
              </div>
            </div>
          </div>
        </div>

        {/* LISTA */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Veterinarias registradas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {veterinarias.length}{' '}
              {veterinarias.length === 1
                ? 'veterinaria encontrada'
                : 'veterinarias encontradas'}
            </p>
          </div>

          {veterinarias.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">
                🏥
              </div>

              <h3 className="text-xl font-semibold text-gray-700">
                No hay veterinarias registradas
              </h3>

              <p className="mt-2 text-gray-500">
                Actualmente no existen veterinarias
                registradas en VeciPets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {veterinarias.map(
                (veterinaria) => (
                  <div
                    key={veterinaria.id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                  >

                    {/* CABECERA */}
                    <div className="border-b border-gray-100 bg-green-50 p-6">
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl">
                            🏥
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {veterinaria.nombre}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Veterinaria VeciPets
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            veterinaria.usuario
                              .activo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {veterinaria.usuario.activo
                            ? 'Activa'
                            : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="space-y-4 p-6">

                      {/* RESPONSABLE */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Responsable
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {
                            veterinaria.usuario
                              .nombreCompleto
                          }
                        </p>
                      </div>

                      {/* CONTACTO */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Correo
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-700">
                            {
                              veterinaria.usuario
                                .email
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Teléfono
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {
                              veterinaria.usuario
                                .telefono
                            }
                          </p>
                        </div>
                      </div>

                      {/* HORARIO / URGENCIAS */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Horario
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {veterinaria.horario}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Urgencias 24h
                          </p>

                          {veterinaria.urgencias24h ? (
                            <span className="mt-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Sí, disponible
                            </span>
                          ) : (
                            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              No disponible
                            </span>
                          )}
                        </div>
                      </div>

                      {/* UBICACIÓN */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Ubicación
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {
                            veterinaria.ubicacion
                              .direccion
                          }
                        </p>

                        <p className="text-sm text-gray-500">
                          {
                            veterinaria.ubicacion
                              .barrio
                          }
                          ,{' '}
                          {
                            veterinaria.ubicacion
                              .comuna
                          }
                        </p>
                      </div>

                      {/* BOTÓN */}
                      <button
                        onClick={() =>
                          abrirDetalle(
                            veterinaria.id,
                          )
                        }
                        className="mt-2 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      {veterinariaSeleccionada && (
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

            {/* HEADER MODAL */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {
                    veterinariaSeleccionada.nombre
                  }
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Información completa de la veterinaria
                </p>
              </div>

              <button
                onClick={cerrarDetalle}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-6 p-6">

              {/* INFORMACIÓN GENERAL */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-green-700">
                  Información de la veterinaria
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Nombre
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {
                        veterinariaSeleccionada.nombre
                      }
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Urgencias 24 horas
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        veterinariaSeleccionada
                          .urgencias24h
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {veterinariaSeleccionada
                        .urgencias24h
                        ? 'Sí, disponible'
                        : 'No disponible'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      Horario
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {
                        veterinariaSeleccionada.horario
                      }
                    </p>
                  </div>

                  {veterinariaSeleccionada.sitioWeb && (
                    <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Sitio web
                      </p>

                      <a
                        href={
                          veterinariaSeleccionada.sitioWeb
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-blue-600 hover:underline"
                      >
                        {
                          veterinariaSeleccionada.sitioWeb
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
                      veterinariaSeleccionada
                        .ubicacion.direccion
                    }
                  </p>

                  <p className="mt-1 text-gray-600">
                    Barrio:{' '}
                    {
                      veterinariaSeleccionada
                        .ubicacion.barrio
                    }
                  </p>

                  <p className="text-gray-600">
                    Comuna:{' '}
                    {
                      veterinariaSeleccionada
                        .ubicacion.comuna
                    }
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Coordenadas:{' '}
                    {
                      veterinariaSeleccionada
                        .ubicacion.latitud
                    }
                    ,{' '}
                    {
                      veterinariaSeleccionada
                        .ubicacion.longitud
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
                        veterinariaSeleccionada
                          .usuario.nombreCompleto
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
                          veterinariaSeleccionada
                            .usuario.email
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Teléfono
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {
                          veterinariaSeleccionada
                            .usuario.telefono
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Estado
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          veterinariaSeleccionada
                            .usuario.activo
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {
                          veterinariaSeleccionada
                            .usuario.estado
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Registro
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatearFecha(
                          veterinariaSeleccionada
                            .usuario.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DEL MÓDULO */}
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  <strong>Nota:</strong> este módulo
                  permite consultar la información
                  administrativa de las veterinarias y
                  su disponibilidad de atención.
                </p>
              </div>
            </div>

            {/* FOOTER */}
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