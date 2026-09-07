'use client';

import { useEffect, useState } from 'react';

interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edadAprox?: number;
  color: string;
  caracteristicas?: string;
  fotoUrl?: string;
  createdAt?: string;
}

interface Ubicacion {
  id: string;
  direccion: string;
  comuna: string;
  barrio: string;
  latitud?: number | string;
  longitud?: number | string;
}

interface Reporte {
  id: string;
  tipo: string;
  estado: string;
  titulo: string;
  descripcion: string;
  fechaAcontecimiento: string;
  createdAt: string;
  mascota?: Mascota | null;
  ubicacion?: Ubicacion | null;
}

interface UsuarioActivo {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  activo: boolean;
  estado: string;
  createdAt: string;

  role: {
    nombre: string;
    descripcion?: string;
  };

  cantidadMascotas: number;
  cantidadReportes: number;

  mascotas: Mascota[];
  reportes: Reporte[];
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
    capacidad?: number;
    horario?: string;
    sitioWeb?: string | null;
    ubicacion?: Ubicacion | null;
  } | null;

  veterinaria?: {
    nombre: string;
    urgencias24h?: boolean;
    horario?: string;
    ubicacion?: Ubicacion | null;
  } | null;
}

export default function AdminUsuariosPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';

  const [usuarios, setUsuarios] = useState<UsuarioActivo[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const [cargandoUsuarios, setCargandoUsuarios] =
    useState(true);

  const [cargandoSolicitudes, setCargandoSolicitudes] =
    useState(true);

  const [mensaje, setMensaje] = useState('');

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioActivo | null>(null);

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);

  const [procesandoId, setProcesandoId] =
    useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');

  /**
   * Obtener token
   */
  const obtenerToken = () => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('vecipets_access_token')
    );
  };

  /**
   * Cargar usuarios activos
   */
  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);

      const token = obtenerToken();

      if (!token) {
        throw new Error(
          'No se encontró el token de autenticación.',
        );
      }

      const response = await fetch(
        `${API_URL}/admin/usuarios-activos`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();

        console.error(
          'ERROR USUARIOS ACTIVOS:',
          errorData,
        );

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      const data: UsuarioActivo[] =
        await response.json();

      setUsuarios(data);
    } catch (error) {
      console.error(
        'ERROR CARGANDO USUARIOS:',
        error,
      );

      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje(
          'No fue posible cargar los usuarios activos.',
        );
      }
    } finally {
      setCargandoUsuarios(false);
    }
  };

  /**
   * Cargar solicitudes pendientes
   */
  const cargarSolicitudes = async () => {
    try {
      setCargandoSolicitudes(true);

      const token = obtenerToken();

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

      if (!response.ok) {
        const errorData = await response.text();

        console.error(
          'ERROR SOLICITUDES:',
          errorData,
        );

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      const data: Solicitud[] =
        await response.json();

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
      setCargandoSolicitudes(false);
    }
  };

  /**
   * Cargar información inicial
   */
  useEffect(() => {
    cargarUsuarios();
    cargarSolicitudes();
  }, []);

  /**
   * Aprobar solicitud
   */
  const aprobarSolicitud = async (id: string) => {
    try {
      setProcesandoId(id);
      setMensaje('');

      const token = obtenerToken();

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

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      setMensaje(
        'Solicitud aprobada correctamente.',
      );

      setSolicitudSeleccionada(null);

      await Promise.all([
        cargarSolicitudes(),
        cargarUsuarios(),
      ]);
    } catch (error) {
      console.error(
        'ERROR APROBANDO:',
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

  /**
   * Rechazar solicitud
   */
  const rechazarSolicitud = async (id: string) => {
    try {
      setProcesandoId(id);
      setMensaje('');

      const token = obtenerToken();

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

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      setMensaje(
        'Solicitud rechazada correctamente.',
      );

      setSolicitudSeleccionada(null);

      await Promise.all([
        cargarSolicitudes(),
        cargarUsuarios(),
      ]);
    } catch (error) {
      console.error(
        'ERROR RECHAZANDO:',
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

  /**
   * Eliminar usuario
   */
  const eliminarUsuario = async (
    usuario: UsuarioActivo,
  ) => {
    if (
      usuario.role.nombre ===
      'ADMINISTRADOR'
    ) {
      setMensaje(
        'No se puede eliminar un usuario administrador.',
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombreCompleto}"?\n\nEsta acción desactivará su cuenta y ya no aparecerá entre los usuarios activos.`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(usuario.id);
      setMensaje('');

      const token = obtenerToken();

      if (!token) {
        throw new Error(
          'No se encontró el token de autenticación.',
        );
      }

      const response = await fetch(
        `${API_URL}/admin/usuarios-activos/${usuario.id}/eliminar`,
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

        console.error(
          'ERROR ELIMINANDO USUARIO:',
          errorData,
        );

        throw new Error(
          `Error ${response.status}: ${errorData}`,
        );
      }

      setUsuarios((usuariosActuales) =>
        usuariosActuales.filter(
          (item) =>
            item.id !== usuario.id,
        ),
      );

      if (
        usuarioSeleccionado?.id ===
        usuario.id
      ) {
        setUsuarioSeleccionado(null);
      }

      setMensaje(
        `El usuario "${usuario.nombreCompleto}" fue eliminado correctamente.`,
      );
    } catch (error) {
      console.error(
        'ERROR ELIMINANDO USUARIO:',
        error,
      );

      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje(
          'No fue posible eliminar el usuario.',
        );
      }
    } finally {
      setProcesandoId(null);
    }
  };

  /**
   * Filtrar usuarios
   */
  const usuariosFiltrados = usuarios.filter(
    (usuario) => {
      const texto = busqueda
        .toLowerCase()
        .trim();

      if (!texto) {
        return true;
      }

      return (
        usuario.nombreCompleto
          .toLowerCase()
          .includes(texto) ||
        usuario.email
          .toLowerCase()
          .includes(texto) ||
        usuario.telefono
          .toLowerCase()
          .includes(texto) ||
        usuario.role.nombre
          .toLowerCase()
          .includes(texto)
      );
    },
  );

  const formatearFecha = (
    fecha: string,
  ) => {
    try {
      return new Date(
        fecha,
      ).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const obtenerNombreRol = (
    rol: string,
  ) => {
    switch (rol) {
      case 'CIUDADANO':
        return 'Ciudadano';

      case 'ADMINISTRADOR':
        return 'Administrador';

      case 'REFUGIO':
        return 'Refugio';

      case 'VETERINARIA':
        return 'Veterinaria';

      default:
        return rol;
    }
  };

  const obtenerColorRol = (
    rol: string,
  ) => {
    switch (rol) {
      case 'CIUDADANO':
        return 'bg-blue-100 text-blue-700';

      case 'ADMINISTRADOR':
        return 'bg-purple-100 text-purple-700';

      case 'REFUGIO':
        return 'bg-green-100 text-green-700';

      case 'VETERINARIA':
        return 'bg-orange-100 text-orange-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const obtenerColorEstadoReporte = (
    estado: string,
  ) => {
    switch (estado) {
      case 'PUBLICO':
        return 'bg-green-100 text-green-700';

      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-700';

      case 'RECHAZADO':
        return 'bg-red-100 text-red-700';

      case 'RESUELTO':
        return 'bg-blue-100 text-blue-700';

      case 'CERRADO':
        return 'bg-gray-100 text-gray-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de usuarios
          </h1>

          <p className="mt-2 text-gray-600">
            Administra los usuarios activos,
            sus mascotas y los reportes realizados
            en VeciPets.
          </p>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-700">
              {mensaje}
            </p>

            <button
              type="button"
              onClick={() => setMensaje('')}
              className="ml-4 text-gray-400 transition hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              👥
            </div>

            <p className="text-sm font-medium text-gray-500">
              Usuarios activos
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-800">
              {usuarios.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🐶
            </div>

            <p className="text-sm font-medium text-gray-500">
              Mascotas registradas
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-800">
              {usuarios.reduce(
                (total, usuario) =>
                  total +
                  usuario.cantidadMascotas,
                0,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
              📋
            </div>

            <p className="text-sm font-medium text-gray-500">
              Reportes realizados
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-800">
              {usuarios.reduce(
                (total, usuario) =>
                  total +
                  usuario.cantidadReportes,
                0,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
              ⏳
            </div>

            <p className="text-sm font-medium text-gray-500">
              Solicitudes pendientes
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-800">
              {solicitudes.length}
            </p>
          </div>

        </div>

        {/* USUARIOS ACTIVOS */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Usuarios activos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Consulta las mascotas y reportes
                realizados por cada usuario.
              </p>
            </div>

            {/* BUSCADOR */}
            <div className="w-full lg:w-80">
              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                placeholder="Buscar usuario..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

          </div>

          {cargandoUsuarios ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-gray-500">
                Cargando usuarios activos...
              </p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-12 text-center">
              <div className="mb-3 text-4xl">
                👥
              </div>

              <p className="font-medium text-gray-600">
                {busqueda
                  ? 'No se encontraron usuarios con esa búsqueda.'
                  : 'No hay usuarios activos.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

              {usuariosFiltrados.map(
                (usuario) => (
                  <div
                    key={usuario.id}
                    className="rounded-2xl border border-gray-200 p-5 transition hover:shadow-md"
                  >

                    {/* CABECERA USUARIO */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                          {usuario.nombreCompleto
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-800">
                            {usuario.nombreCompleto}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {usuario.email}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {usuario.telefono}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorRol(
                          usuario.role.nombre,
                        )}`}
                      >
                        {obtenerNombreRol(
                          usuario.role.nombre,
                        )}
                      </span>

                    </div>

                    {/* ESTADO */}
                    <div className="mt-5 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                      <span className="text-sm font-medium text-green-700">
                        Usuario activo
                      </span>
                    </div>

                    {/* ESTADÍSTICAS USUARIO */}
                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-blue-50 p-4">
                        <p className="text-xs font-medium text-blue-600">
                          Mascotas
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-800">
                          {usuario.cantidadMascotas}
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-xs font-medium text-orange-600">
                          Reportes
                        </p>

                        <p className="mt-1 text-2xl font-bold text-orange-800">
                          {usuario.cantidadReportes}
                        </p>
                      </div>

                    </div>

                    {/* FECHA */}
                    <p className="mt-4 text-xs text-gray-400">
                      Registrado el{' '}
                      {formatearFecha(
                        usuario.createdAt,
                      )}
                    </p>

                    {/* BOTONES */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        onClick={() =>
                          setUsuarioSeleccionado(
                            usuario,
                          )
                        }
                        className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                      >
                        Ver detalles
                      </button>

                      {usuario.role.nombre !==
                        'ADMINISTRADOR' && (
                        <button
                          type="button"
                          disabled={
                            procesandoId ===
                            usuario.id
                          }
                          onClick={() =>
                            eliminarUsuario(
                              usuario,
                            )
                          }
                          className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {procesandoId ===
                          usuario.id
                            ? 'Eliminando...'
                            : '🗑️ Eliminar usuario'}
                        </button>
                      )}

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </section>

        {/* SOLICITUDES PENDIENTES */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Solicitudes pendientes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Solicitudes de refugios y veterinarias
              que requieren aprobación.
            </p>
          </div>

          {cargandoSolicitudes ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />

              <p className="text-gray-500">
                Cargando solicitudes...
              </p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-10 text-center">
              <div className="mb-3 text-3xl">
                ✅
              </div>

              <p className="text-gray-600">
                No hay solicitudes pendientes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {solicitudes.map(
                (solicitud) => {
                  const esRefugio =
                    solicitud.role.nombre ===
                    'REFUGIO';

                  return (
                    <div
                      key={solicitud.id}
                      className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                          <div className="mb-2 flex flex-wrap items-center gap-3">

                            <h3 className="text-lg font-bold text-gray-800">
                              {solicitud.nombreCompleto}
                            </h3>

                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                              {esRefugio
                                ? 'REFUGIO'
                                : 'VETERINARIA'}
                            </span>

                          </div>

                          <p className="text-sm text-gray-600">
                            Correo:{' '}
                            {solicitud.email}
                          </p>

                          <p className="text-sm text-gray-600">
                            Teléfono:{' '}
                            {solicitud.telefono}
                          </p>

                          {esRefugio &&
                            solicitud.refugio && (
                              <p className="mt-1 text-sm text-gray-600">
                                Refugio:{' '}
                                {
                                  solicitud
                                    .refugio
                                    .nombre
                                }
                              </p>
                            )}

                          {!esRefugio &&
                            solicitud.veterinaria && (
                              <p className="mt-1 text-sm text-gray-600">
                                Veterinaria:{' '}
                                {
                                  solicitud
                                    .veterinaria
                                    .nombre
                                }
                              </p>
                            )}

                          <p className="mt-2 text-sm font-semibold text-orange-600">
                            Estado:{' '}
                            {solicitud.estado}
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              setSolicitudSeleccionada(
                                solicitud,
                              )
                            }
                            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Ver detalles
                          </button>

                          <button
                            type="button"
                            disabled={
                              procesandoId ===
                              solicitud.id
                            }
                            onClick={() =>
                              aprobarSolicitud(
                                solicitud.id,
                              )
                            }
                            className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {procesandoId ===
                            solicitud.id
                              ? 'Procesando...'
                              : 'Aprobar'}
                          </button>

                          <button
                            type="button"
                            disabled={
                              procesandoId ===
                              solicitud.id
                            }
                            onClick={() =>
                              rechazarSolicitud(
                                solicitud.id,
                              )
                            }
                            className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Rechazar
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                },
              )}

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          MODAL DETALLES DEL USUARIO
          ===================================================== */}

      {usuarioSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setUsuarioSeleccionado(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER MODAL */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles del usuario
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Información, mascotas y reportes.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUsuarioSeleccionado(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            <div className="space-y-8 p-6">

              {/* DATOS DEL USUARIO */}
              <section>

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                    👤
                  </div>

                  <h3 className="text-lg font-bold text-gray-800">
                    Información personal
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-5 md:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Nombre completo
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {
                        usuarioSeleccionado.nombreCompleto
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Correo electrónico
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {
                        usuarioSeleccionado.email
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Teléfono
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {
                        usuarioSeleccionado.telefono
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Rol
                    </p>

                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorRol(
                        usuarioSeleccionado
                          .role.nombre,
                      )}`}
                    >
                      {obtenerNombreRol(
                        usuarioSeleccionado
                          .role.nombre,
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Estado
                    </p>

                    <p className="mt-1 font-semibold text-green-600">
                      ● Activo
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Fecha de registro
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formatearFecha(
                        usuarioSeleccionado.createdAt,
                      )}
                    </p>
                  </div>

                </div>

              </section>

              {/* RESUMEN */}
              <section>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-blue-50 p-5">
                    <p className="text-sm font-medium text-blue-600">
                      Mascotas registradas
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-800">
                      {
                        usuarioSeleccionado
                          .cantidadMascotas
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-5">
                    <p className="text-sm font-medium text-orange-600">
                      Reportes realizados
                    </p>

                    <p className="mt-1 text-3xl font-bold text-orange-800">
                      {
                        usuarioSeleccionado
                          .cantidadReportes
                      }
                    </p>
                  </div>

                </div>

              </section>

              {/* MASCOTAS */}
              <section>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
                      🐾
                    </div>

                    <h3 className="text-lg font-bold text-gray-800">
                      Mascotas
                    </h3>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {
                      usuarioSeleccionado
                        .mascotas.length
                    }
                  </span>
                </div>

                {usuarioSeleccionado
                  .mascotas.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      Este usuario no tiene mascotas
                      registradas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {usuarioSeleccionado.mascotas.map(
                      (mascota) => (
                        <div
                          key={mascota.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >

                          <div className="flex gap-4">

                            {mascota.fotoUrl ? (
                              <img
                                src={
                                  mascota.fotoUrl
                                }
                                alt={
                                  mascota.nombre
                                }
                                className="h-20 w-20 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-3xl">
                                🐶
                              </div>
                            )}

                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-800">
                                {
                                  mascota.nombre
                                }
                              </h4>

                              <p className="mt-1 text-sm text-gray-600">
                                {
                                  mascota.especie
                                }
                              </p>

                              <p className="text-sm text-gray-600">
                                Raza:{' '}
                                {
                                  mascota.raza
                                }
                              </p>

                              <p className="text-sm text-gray-600">
                                Color:{' '}
                                {
                                  mascota.color
                                }
                              </p>

                              {mascota.edadAprox !==
                                undefined && (
                                <p className="text-sm text-gray-600">
                                  Edad aprox.:{' '}
                                  {
                                    mascota.edadAprox
                                  } años
                                </p>
                              )}
                            </div>

                          </div>

                          {mascota.caracteristicas && (
                            <p className="mt-4 text-sm text-gray-500">
                              {
                                mascota.caracteristicas
                              }
                            </p>
                          )}

                        </div>
                      ),
                    )}

                  </div>
                )}

              </section>

              {/* REPORTES */}
              <section>

                <div className="mb-4 flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg">
                      📋
                    </div>

                    <h3 className="text-lg font-bold text-gray-800">
                      Reportes realizados
                    </h3>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {
                      usuarioSeleccionado
                        .reportes.length
                    }
                  </span>

                </div>

                {usuarioSeleccionado
                  .reportes.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      Este usuario no ha realizado
                      reportes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {usuarioSeleccionado.reportes.map(
                      (reporte) => (
                        <div
                          key={reporte.id}
                          className="rounded-xl border border-gray-200 p-5"
                        >

                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                            <div>
                              <h4 className="font-bold text-gray-800">
                                {reporte.titulo}
                              </h4>

                              <div className="mt-2 flex flex-wrap gap-2">

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {reporte.tipo}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorEstadoReporte(
                                    reporte.estado,
                                  )}`}
                                >
                                  {
                                    reporte.estado
                                  }
                                </span>

                              </div>
                            </div>

                            <span className="text-xs text-gray-400">
                              {formatearFecha(
                                reporte.createdAt,
                              )}
                            </span>

                          </div>

                          <p className="mt-4 text-sm leading-6 text-gray-600">
                            {
                              reporte.descripcion
                            }
                          </p>

                          {/* MASCOTA DEL REPORTE */}
                          {reporte.mascota && (
                            <div className="mt-4 rounded-lg bg-blue-50 p-4">

                              <p className="text-xs font-semibold uppercase text-blue-600">
                                Mascota asociada
                              </p>

                              <p className="mt-1 font-bold text-blue-900">
                                {
                                  reporte
                                    .mascota
                                    .nombre
                                }
                              </p>

                              <p className="text-sm text-blue-800">
                                {
                                  reporte
                                    .mascota
                                    .especie
                                }{' '}
                                ·{' '}
                                {
                                  reporte
                                    .mascota
                                    .raza
                                }
                              </p>

                            </div>
                          )}

                          {/* UBICACIÓN */}
                          {reporte.ubicacion && (
                            <div className="mt-4 rounded-lg bg-gray-50 p-4">

                              <p className="text-xs font-semibold uppercase text-gray-500">
                                Ubicación
                              </p>

                              <p className="mt-1 text-sm text-gray-700">
                                {
                                  reporte
                                    .ubicacion
                                    .direccion
                                }
                              </p>

                              <p className="text-sm text-gray-600">
                                Barrio:{' '}
                                {
                                  reporte
                                    .ubicacion
                                    .barrio
                                }
                                {' · '}
                                Comuna:{' '}
                                {
                                  reporte
                                    .ubicacion
                                    .comuna
                                }
                              </p>

                            </div>
                          )}

                          <p className="mt-4 text-xs text-gray-400">
                            Fecha del acontecimiento:{' '}
                            {formatearFecha(
                              reporte.fechaAcontecimiento,
                            )}
                          </p>

                        </div>
                      ),
                    )}

                  </div>
                )}

              </section>

            </div>

            {/* FOOTER MODAL */}
            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-between">

              <div>
                {usuarioSeleccionado.role.nombre !==
                  'ADMINISTRADOR' && (
                  <button
                    type="button"
                    disabled={
                      procesandoId ===
                      usuarioSeleccionado.id
                    }
                    onClick={() =>
                      eliminarUsuario(
                        usuarioSeleccionado,
                      )
                    }
                    className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {procesandoId ===
                    usuarioSeleccionado.id
                      ? 'Eliminando...'
                      : '🗑️ Eliminar usuario'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setUsuarioSeleccionado(null)
                }
                className="rounded-xl bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-900"
              >
                Cerrar
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          MODAL SOLICITUD PENDIENTE
          ===================================================== */}

      {solicitudSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSolicitudSeleccionada(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Detalles de solicitud
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    solicitudSeleccionada
                      .nombreCompleto
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSolicitudSeleccionada(
                    null,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            <div className="space-y-6 p-6">

              <div className="rounded-xl bg-gray-50 p-5">

                <h3 className="mb-4 font-bold text-gray-800">
                  Responsable
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>
                      Nombre:
                    </strong>{' '}
                    {
                      solicitudSeleccionada
                        .nombreCompleto
                    }
                  </p>

                  <p>
                    <strong>
                      Correo:
                    </strong>{' '}
                    {
                      solicitudSeleccionada.email
                    }
                  </p>

                  <p>
                    <strong>
                      Teléfono:
                    </strong>{' '}
                    {
                      solicitudSeleccionada.telefono
                    }
                  </p>

                  <p>
                    <strong>
                      Tipo:
                    </strong>{' '}
                    {
                      solicitudSeleccionada
                        .role.nombre
                    }
                  </p>
                </div>

              </div>

              {solicitudSeleccionada.refugio && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">

                  <h3 className="mb-4 font-bold text-green-800">
                    Información del refugio
                  </h3>

                  <div className="space-y-2 text-sm text-gray-700">

                    <p>
                      <strong>
                        Nombre:
                      </strong>{' '}
                      {
                        solicitudSeleccionada
                          .refugio.nombre
                      }
                    </p>

                    {solicitudSeleccionada
                      .refugio
                      .capacidad !==
                      undefined && (
                      <p>
                        <strong>
                          Capacidad:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .refugio
                            .capacidad
                        }
                      </p>
                    )}

                    {solicitudSeleccionada
                      .refugio
                      .horario && (
                      <p>
                        <strong>
                          Horario:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .refugio
                            .horario
                        }
                      </p>
                    )}

                    {solicitudSeleccionada
                      .refugio
                      .sitioWeb && (
                      <p>
                        <strong>
                          Sitio web:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .refugio
                            .sitioWeb
                        }
                      </p>
                    )}

                    {solicitudSeleccionada
                      .refugio
                      .ubicacion && (
                      <p>
                        <strong>
                          Ubicación:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .refugio
                            .ubicacion
                            .direccion
                        }
                        {' · '}
                        {
                          solicitudSeleccionada
                            .refugio
                            .ubicacion
                            .barrio
                        }
                      </p>
                    )}

                  </div>

                </div>
              )}

              {solicitudSeleccionada.veterinaria && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

                  <h3 className="mb-4 font-bold text-orange-800">
                    Información de la veterinaria
                  </h3>

                  <div className="space-y-2 text-sm text-gray-700">

                    <p>
                      <strong>
                        Nombre:
                      </strong>{' '}
                      {
                        solicitudSeleccionada
                          .veterinaria
                          .nombre
                      }
                    </p>

                    <p>
                      <strong>
                        Urgencias 24 horas:
                      </strong>{' '}
                      {
                        solicitudSeleccionada
                          .veterinaria
                          .urgencias24h
                          ? 'Sí'
                          : 'No'
                      }
                    </p>

                    {solicitudSeleccionada
                      .veterinaria
                      .horario && (
                      <p>
                        <strong>
                          Horario:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .veterinaria
                            .horario
                        }
                      </p>
                    )}

                    {solicitudSeleccionada
                      .veterinaria
                      .ubicacion && (
                      <p>
                        <strong>
                          Ubicación:
                        </strong>{' '}
                        {
                          solicitudSeleccionada
                            .veterinaria
                            .ubicacion
                            .direccion
                        }
                        {' · '}
                        {
                          solicitudSeleccionada
                            .veterinaria
                            .ubicacion
                            .barrio
                        }
                      </p>
                    )}

                  </div>

                </div>
              )}

            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setSolicitudSeleccionada(
                    null,
                  )
                }
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
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
                  rechazarSolicitud(
                    solicitudSeleccionada.id,
                  )
                }
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Rechazar
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
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Aprobar
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}