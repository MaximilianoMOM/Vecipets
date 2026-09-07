'use client';

import { useEffect, useState } from 'react';

interface Ubicacion {
  direccion: string;
  comuna: string;
  barrio: string;
  latitud: number | string;
  longitud: number | string;
}

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
    capacidad?: number | null;
    horario?: string | null;
    sitioWeb?: string | null;
    ubicacion?: Ubicacion | null;
  } | null;

  veterinaria?: {
    nombre: string;
    urgencias24h?: boolean | null;
    horario?: string | null;
    ubicacion?: Ubicacion | null;
  } | null;
}

export default function AdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);

  const [procesandoId, setProcesandoId] = useState<string | null>(null);

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
      console.error(
        'ERROR CARGANDO SOLICITUDES:',
        error,
      );

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
      setProcesandoId(id);

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

      setSolicitudSeleccionada(null);

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
    } finally {
      setProcesandoId(null);
    }
  };

  // ==========================================
  // RECHAZAR SOLICITUD
  // ==========================================
  const rechazarSolicitud = async (id: string) => {
    try {
      setMensaje('');
      setProcesandoId(id);

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

      setSolicitudSeleccionada(null);

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
    } finally {
      setProcesandoId(null);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  const esRefugio = (solicitud: Solicitud) =>
    solicitud.role.nombre === 'REFUGIO';

  const esVeterinaria = (solicitud: Solicitud) =>
    solicitud.role.nombre === 'VETERINARIA';

  const textoNoDisponible = 'No disponible';

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* ======================================
            ENCABEZADO
        ====================================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Administrador
          </h1>

          <p className="mt-2 text-gray-600">
            Gestiona las solicitudes de refugios y
            veterinarias.
          </p>
        </div>

        {/* ======================================
            MENSAJE
        ====================================== */}
        {mensaje && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-gray-700 shadow-sm">
            {mensaje}
          </div>
        )}

        {/* ======================================
            SOLICITUDES
        ====================================== */}
        <section className="rounded-xl bg-white p-6 shadow-sm">

          {/* CABECERA */}
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
              {solicitudes.length}{' '}
              {solicitudes.length === 1
                ? 'pendiente'
                : 'pendientes'}
            </span>
          </div>

          {/* ====================================
              CARGANDO
          ==================================== */}
          {cargando ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-gray-500">
                Cargando solicitudes...
              </p>
            </div>

          ) : solicitudes.length === 0 ? (

            /* ==================================
               SIN SOLICITUDES
            ================================== */
            <div className="rounded-lg bg-gray-50 py-10 text-center">

              <div className="mb-3 text-4xl">
                ✓
              </div>

              <p className="font-medium text-gray-700">
                No hay solicitudes pendientes.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Todas las solicitudes han sido gestionadas.
              </p>
            </div>

          ) : (

            /* ==================================
               LISTA
            ================================== */
            <div className="space-y-4">

              {solicitudes.map((solicitud) => {

                const refugio = esRefugio(solicitud);
                const veterinaria =
                  esVeterinaria(solicitud);

                const procesando =
                  procesandoId === solicitud.id;

                return (
                  <div
                    key={solicitud.id}
                    className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      {/* ==============================
                          INFORMACIÓN
                      ============================== */}
                      <div className="min-w-0">

                        <div className="mb-2 flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-semibold text-gray-800">
                            {solicitud.nombreCompleto}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              refugio
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {refugio
                              ? 'REFUGIO'
                              : 'VETERINARIA'}
                          </span>

                        </div>

                        <p className="text-sm text-gray-600">
                          <strong>Correo:</strong>{' '}
                          {solicitud.email}
                        </p>

                        <p className="text-sm text-gray-600">
                          <strong>Teléfono:</strong>{' '}
                          {solicitud.telefono}
                        </p>

                        {refugio &&
                          solicitud.refugio && (
                            <p className="mt-1 text-sm text-gray-600">
                              <strong>Refugio:</strong>{' '}
                              {solicitud.refugio.nombre}
                            </p>
                          )}

                        {veterinaria &&
                          solicitud.veterinaria && (
                            <p className="mt-1 text-sm text-gray-600">
                              <strong>Veterinaria:</strong>{' '}
                              {solicitud.veterinaria.nombre}
                            </p>
                          )}

                        <p className="mt-2 text-sm font-medium text-orange-600">
                          Estado: {solicitud.estado}
                        </p>

                      </div>

                      {/* ==============================
                          BOTONES
                      ============================== */}
                      <div className="flex flex-wrap gap-3">

                        {/* VER DETALLES */}
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            setSolicitudSeleccionada(
                              solicitud,
                            )
                          }
                          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Ver detalles
                        </button>

                        {/* APROBAR */}
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            aprobarSolicitud(
                              solicitud.id,
                            )
                          }
                          className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {procesando
                            ? 'Procesando...'
                            : 'Aprobar'}
                        </button>

                        {/* RECHAZAR */}
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            rechazarSolicitud(
                              solicitud.id,
                            )
                          }
                          className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {procesando
                            ? 'Procesando...'
                            : 'Rechazar'}
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

      {/* ==========================================
          MODAL DE DETALLES
      ========================================== */}
      {solicitudSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSolicitudSeleccionada(null);
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* ====================================
                ENCABEZADO MODAL
            ==================================== */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white p-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles de la solicitud
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Revisa la información antes de tomar
                  una decisión.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSolicitudSeleccionada(null)
                }
                disabled={procesandoId === solicitudSeleccionada.id}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* ==================================
                  INFORMACIÓN DEL RESPONSABLE
              ================================== */}
              <div className="rounded-xl border border-gray-200 p-5">

                <h3 className="mb-4 text-lg font-bold text-gray-800">
                  👤 Información del responsable
                </h3>

                <div className="grid gap-3 text-sm text-gray-600">

                  <div>
                    <span className="font-semibold text-gray-800">
                      Nombre:
                    </span>{' '}
                    {solicitudSeleccionada.nombreCompleto ||
                      textoNoDisponible}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-800">
                      Correo:
                    </span>{' '}
                    {solicitudSeleccionada.email ||
                      textoNoDisponible}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-800">
                      Teléfono:
                    </span>{' '}
                    {solicitudSeleccionada.telefono ||
                      textoNoDisponible}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-800">
                      Rol:
                    </span>{' '}
                    {solicitudSeleccionada.role?.nombre ||
                      textoNoDisponible}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-800">
                      Estado:
                    </span>{' '}
                    <span className="font-medium text-orange-600">
                      {solicitudSeleccionada.estado ||
                        textoNoDisponible}
                    </span>
                  </div>

                </div>
              </div>

              {/* ==================================
                  INFORMACIÓN VETERINARIA
              ================================== */}
              {esVeterinaria(
                solicitudSeleccionada,
              ) &&
                solicitudSeleccionada.veterinaria && (

                  <div className="rounded-xl border border-gray-200 p-5">

                    <h3 className="mb-4 text-lg font-bold text-gray-800">
                      🩺 Información de la veterinaria
                    </h3>

                    <div className="grid gap-3 text-sm text-gray-600">

                      <div>
                        <span className="font-semibold text-gray-800">
                          Nombre:
                        </span>{' '}
                        {solicitudSeleccionada.veterinaria
                          .nombre ||
                          textoNoDisponible}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">
                          Horario:
                        </span>{' '}
                        {solicitudSeleccionada.veterinaria
                          .horario ||
                          textoNoDisponible}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">
                          Urgencias 24 horas:
                        </span>{' '}
                        {solicitudSeleccionada.veterinaria
                          .urgencias24h === true
                          ? 'Sí'
                          : solicitudSeleccionada
                              .veterinaria
                              .urgencias24h === false
                            ? 'No'
                            : textoNoDisponible}
                      </div>

                    </div>

                    {/* UBICACIÓN */}
                    {solicitudSeleccionada.veterinaria
                      .ubicacion && (

                      <div className="mt-5 border-t border-gray-200 pt-5">

                        <h4 className="mb-3 font-semibold text-gray-800">
                          📍 Ubicación
                        </h4>

                        <div className="grid gap-3 text-sm text-gray-600">

                          <div>
                            <span className="font-semibold text-gray-800">
                              Dirección:
                            </span>{' '}
                            {solicitudSeleccionada
                              .veterinaria
                              .ubicacion
                              .direccion ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Comuna:
                            </span>{' '}
                            {solicitudSeleccionada
                              .veterinaria
                              .ubicacion
                              .comuna ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Barrio:
                            </span>{' '}
                            {solicitudSeleccionada
                              .veterinaria
                              .ubicacion
                              .barrio ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Coordenadas:
                            </span>{' '}
                            {
                              solicitudSeleccionada
                                .veterinaria
                                .ubicacion
                                .latitud
                            }
                            ,{' '}
                            {
                              solicitudSeleccionada
                                .veterinaria
                                .ubicacion
                                .longitud
                            }
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

              {/* ==================================
                  INFORMACIÓN REFUGIO
              ================================== */}
              {esRefugio(
                solicitudSeleccionada,
              ) &&
                solicitudSeleccionada.refugio && (

                  <div className="rounded-xl border border-gray-200 p-5">

                    <h3 className="mb-4 text-lg font-bold text-gray-800">
                      🏠 Información del refugio
                    </h3>

                    <div className="grid gap-3 text-sm text-gray-600">

                      <div>
                        <span className="font-semibold text-gray-800">
                          Nombre:
                        </span>{' '}
                        {solicitudSeleccionada.refugio
                          .nombre ||
                          textoNoDisponible}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">
                          Capacidad:
                        </span>{' '}
                        {solicitudSeleccionada.refugio
                          .capacidad !== null &&
                        solicitudSeleccionada.refugio
                          .capacidad !== undefined
                          ? solicitudSeleccionada.refugio
                              .capacidad
                          : textoNoDisponible}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">
                          Horario:
                        </span>{' '}
                        {solicitudSeleccionada.refugio
                          .horario ||
                          textoNoDisponible}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800">
                          Sitio web:
                        </span>{' '}
                        {solicitudSeleccionada.refugio
                          .sitioWeb ||
                          textoNoDisponible}
                      </div>

                    </div>

                    {/* UBICACIÓN */}
                    {solicitudSeleccionada.refugio
                      .ubicacion && (

                      <div className="mt-5 border-t border-gray-200 pt-5">

                        <h4 className="mb-3 font-semibold text-gray-800">
                          📍 Ubicación
                        </h4>

                        <div className="grid gap-3 text-sm text-gray-600">

                          <div>
                            <span className="font-semibold text-gray-800">
                              Dirección:
                            </span>{' '}
                            {solicitudSeleccionada
                              .refugio
                              .ubicacion
                              .direccion ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Comuna:
                            </span>{' '}
                            {solicitudSeleccionada
                              .refugio
                              .ubicacion
                              .comuna ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Barrio:
                            </span>{' '}
                            {solicitudSeleccionada
                              .refugio
                              .ubicacion
                              .barrio ||
                              textoNoDisponible}
                          </div>

                          <div>
                            <span className="font-semibold text-gray-800">
                              Coordenadas:
                            </span>{' '}
                            {
                              solicitudSeleccionada
                                .refugio
                                .ubicacion
                                .latitud
                            }
                            ,{' '}
                            {
                              solicitudSeleccionada
                                .refugio
                                .ubicacion
                                .longitud
                            }
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

            </div>

            {/* ====================================
                BOTONES MODAL
            ==================================== */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={
                  procesandoId ===
                  solicitudSeleccionada.id
                }
                onClick={() =>
                  setSolicitudSeleccionada(null)
                }
                className="rounded-lg bg-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cerrar
              </button>

              <button
                type="button"
                disabled={
                  procesandoId ===
                  solicitudSeleccionada.id
                }
                onClick={() =>
                  aprobarSolicitud(
                    solicitudSeleccionada.id,
                  )
                }
                className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesandoId ===
                solicitudSeleccionada.id
                  ? 'Procesando...'
                  : 'Aprobar solicitud'}
              </button>

              <button
                type="button"
                disabled={
                  procesandoId ===
                  solicitudSeleccionada.id
                }
                onClick={() =>
                  rechazarSolicitud(
                    solicitudSeleccionada.id,
                  )
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesandoId ===
                solicitudSeleccionada.id
                  ? 'Procesando...'
                  : 'Rechazar solicitud'}
              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}

