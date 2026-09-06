
'use client';

import { useEffect, useState } from 'react';

interface Solicitud {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  estado: string;
  role: {
    nombre: string;
  };
  refugio?: {
    nombre: string;
  } | null;
  veterinaria?: {
    nombre: string;
  } | null;
}

export default function AdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';

  // ==========================================
  // CARGAR SOLICITUDES PENDIENTES
  // ==========================================
  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      setMensaje('');

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('vecipets_access_token');

      console.log('TOKEN ENCONTRADO:', !!token);

      if (!token) {
        throw new Error(
          'No se encontró el token de autenticación.',
        );
      }

      const response = await fetch(
        `${API_URL}/admin/solicitudes-pendientes`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // ==========================================
      // DIAGNÓSTICO DEL ERROR
      // ==========================================
      if (!response.ok) {
        const errorData = await response.text();

        console.error('ERROR ADMIN:', {
          status: response.status,
          statusText: response.statusText,
          respuesta: errorData,
        });

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      const data: Solicitud[] = await response.json();

      console.log('SOLICITUDES ADMIN:', data);

      setSolicitudes(data);
    } catch (error) {
      console.error('ERROR CARGANDO SOLICITUDES:', error);

      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje(
          'No fue posible cargar las solicitudes pendientes.',
        );
      }
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // EJECUTAR AL CARGAR LA PÁGINA
  // ==========================================
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // ==========================================
  // APROBAR SOLICITUD
  // ==========================================
  const aprobarSolicitud = async (id: string) => {
    try {
      setMensaje('');

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('vecipets_access_token');

      if (!token) {
        throw new Error(
          'No se encontró el token de autenticación.',
        );
      }

      const response = await fetch(
        `${API_URL}/admin/solicitudes/${id}/aprobar`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();

        console.error('ERROR APROBAR:', {
          status: response.status,
          statusText: response.statusText,
          respuesta: errorData,
        });

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      setMensaje(
        'Solicitud aprobada correctamente.',
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error(
        'ERROR APROBANDO SOLICITUD:',
        error,
      );

      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje(
          'No fue posible aprobar la solicitud.',
        );
      }
    }
  };

  // ==========================================
  // RECHAZAR SOLICITUD
  // ==========================================
  const rechazarSolicitud = async (id: string) => {
    try {
      setMensaje('');

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('vecipets_access_token');

      if (!token) {
        throw new Error(
          'No se encontró el token de autenticación.',
        );
      }

      const response = await fetch(
        `${API_URL}/admin/solicitudes/${id}/rechazar`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();

        console.error('ERROR RECHAZAR:', {
          status: response.status,
          statusText: response.statusText,
          respuesta: errorData,
        });

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      setMensaje(
        'Solicitud rechazada correctamente.',
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error(
        'ERROR RECHAZANDO SOLICITUD:',
        error,
      );

      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje(
          'No fue posible rechazar la solicitud.',
        );
      }
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Administrador
          </h1>

          <p className="mt-2 text-gray-600">
            Gestiona las solicitudes de refugios y
            veterinarias.
          </p>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-gray-700 shadow-sm">
            {mensaje}
          </div>
        )}

        {/* SOLICITUDES */}
        <section className="rounded-xl bg-white p-6 shadow-sm">

          {/* CABECERA DE SOLICITUDES */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Solicitudes pendientes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Solicitudes que requieren aprobación.
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {solicitudes.length} pendientes
            </span>
          </div>

          {/* CARGANDO */}
          {cargando ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">
                Cargando solicitudes...
              </p>
            </div>

          ) : solicitudes.length === 0 ? (

            /* SIN SOLICITUDES */
            <div className="rounded-lg bg-gray-50 py-10 text-center">
              <p className="text-gray-600">
                No hay solicitudes pendientes.
              </p>
            </div>

          ) : (

            /* LISTA DE SOLICITUDES */
            <div className="space-y-4">

              {solicitudes.map((solicitud) => {

                const esRefugio =
                  solicitud.role.nombre === 'REFUGIO';

                return (
                  <div
                    key={solicitud.id}
                    className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      {/* INFORMACIÓN */}
                      <div>

                        <div className="mb-2 flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-semibold text-gray-800">
                            {solicitud.nombreCompleto}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            {esRefugio
                              ? 'REFUGIO'
                              : 'VETERINARIA'}
                          </span>

                        </div>

                        <p className="text-sm text-gray-600">
                          Correo: {solicitud.email}
                        </p>

                        <p className="text-sm text-gray-600">
                          Teléfono: {solicitud.telefono}
                        </p>

                        {esRefugio &&
                          solicitud.refugio && (
                            <p className="mt-1 text-sm text-gray-600">
                              Refugio:{' '}
                              {solicitud.refugio.nombre}
                            </p>
                          )}

                        {!esRefugio &&
                          solicitud.veterinaria && (
                            <p className="mt-1 text-sm text-gray-600">
                              Veterinaria:{' '}
                              {solicitud.veterinaria.nombre}
                            </p>
                          )}

                        <p className="mt-2 text-sm font-medium text-orange-600">
                          Estado: {solicitud.estado}
                        </p>

                      </div>

                      {/* BOTONES */}
                      <div className="flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            aprobarSolicitud(
                              solicitud.id,
                            )
                          }
                          className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
                        >
                          Aprobar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            rechazarSolicitud(
                              solicitud.id,
                            )
                          }
                          className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
                        >
                          Rechazar
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </section>
      </div>
    </main>
  );
}
