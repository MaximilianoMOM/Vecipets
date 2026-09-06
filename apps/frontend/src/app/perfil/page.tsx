
'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import { useToast } from '@/context/ToastContext';

import {
  authAPI,
  reportesAPI,
  Usuario,
  Reporte,
} from '@/lib/api-client';

export default function PerfilPage() {
  const { mostrarToast } = useToast();

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [misReportes, setMisReportes] =
    useState<Reporte[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [nombre, setNombre] =
    useState('');

  const [telefono, setTelefono] =
    useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        // =====================================================
        // CARGAR USUARIO
        // =====================================================

        const datosUser =
          await authAPI.getPerfil();

        setUsuario(datosUser);

        setNombre(
          datosUser.nombre || '',
        );

        setTelefono(
          datosUser.telefono || '',
        );

        // =====================================================
        // CARGAR REPORTES POR SEPARADO
        // =====================================================

        try {
          const todosReportes =
            await reportesAPI.getReportes();

          const reportesUsuario =
            todosReportes.filter(
              (reporte) =>
                reporte.usuarioId ===
                datosUser.id,
            );

          setMisReportes(
            reportesUsuario,
          );
        } catch (errorReportes) {
          /*
           * IMPORTANTE:
           *
           * Si /reportes responde Unauthorized,
           * NO debemos sacar al usuario del perfil.
           *
           * Simplemente mostramos 0 reportes.
           */

          console.error(
            'No se pudieron cargar los reportes:',
            errorReportes,
          );

          setMisReportes([]);
        }
      } catch (errorPerfil) {
        console.error(
          'Error al cargar el perfil:',
          errorPerfil,
        );

        // =====================================================
        // INTENTAR RECUPERAR USUARIO DEL LOCALSTORAGE
        // =====================================================

        if (
          typeof window !==
          'undefined'
        ) {
          const usuarioGuardado =
            localStorage.getItem(
              'vecipets_user',
            );

          if (usuarioGuardado) {
            try {
              const usuarioLocal =
                JSON.parse(
                  usuarioGuardado,
                ) as Usuario;

              setUsuario(
                usuarioLocal,
              );

              setNombre(
                usuarioLocal.nombre ||
                  '',
              );

              setTelefono(
                usuarioLocal.telefono ||
                  '',
              );

              setMisReportes([]);
            } catch (errorLocal) {
              console.error(
                'Error al leer el usuario guardado:',
                errorLocal,
              );

              mostrarToast(
                'No se pudo recuperar la sesión.',
                'error',
              );
            }
          } else {
            mostrarToast(
              'No se pudo cargar la información del perfil.',
              'error',
            );
          }
        }
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [mostrarToast]);

  // ===========================================================
  // GUARDAR CAMBIOS
  // ===========================================================

  const guardarCambios = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!usuario) {
      return;
    }

    const usuarioActualizado: Usuario =
      {
        ...usuario,
        nombre,
        telefono,
      };

    setUsuario(
      usuarioActualizado,
    );

    // Guardar temporalmente en localStorage
    if (
      typeof window !==
      'undefined'
    ) {
      localStorage.setItem(
        'vecipets_user',
        JSON.stringify(
          usuarioActualizado,
        ),
      );
    }

    mostrarToast(
      'Perfil actualizado correctamente.',
      'exito',
    );
  };

  // ===========================================================
  // CARGANDO
  // ===========================================================

  if (cargando) {
    return (
      <div className="py-16 max-w-4xl mx-auto px-4">
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  // ===========================================================
  // SIN SESIÓN
  // ===========================================================

  if (!usuario) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">

            <div className="text-5xl mb-4">
              🔐
            </div>

            <h1 className="text-xl font-black text-slate-900">
              No hay una sesión activa
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Inicia sesión para poder
              ver tu perfil.
            </p>

            <Link
              href="/login"
              className="inline-block mt-6 bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3 px-6 rounded-xl transition-all text-sm"
            >
              Iniciar sesión
            </Link>

          </div>
        </div>
      </div>
    );
  }

  // ===========================================================
  // DETERMINAR SI ES ADMINISTRADOR
  // ===========================================================

  const esAdministrador =
    usuario.rol?.toUpperCase() ===
    'ADMINISTRADOR';

  const estadoUsuario =
    usuario.estado?.toUpperCase();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* =====================================================
            CABECERA
        ===================================================== */}

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">

          {/* AVATAR */}

          <div className="w-20 h-20 rounded-full bg-[#5E7BC4] text-white flex items-center justify-center text-3xl font-black shadow-md">
            {usuario.nombre
              ? usuario.nombre
                  .charAt(0)
                  .toUpperCase()
              : '👤'}
          </div>

          {/* INFORMACIÓN */}

          <div className="space-y-2 text-center sm:text-left">

            <h1 className="text-2xl font-black text-slate-900">
              {usuario.nombre}
            </h1>

            <p className="text-xs text-slate-500 font-medium">
              {usuario.email}
            </p>

            {/* ROL */}

            {usuario.rol && (
              <div>
                <span className="inline-block text-[10px] font-bold text-[#5E7BC4] bg-[#EEF2FC] px-2.5 py-1 rounded-full uppercase">
                  {usuario.rol}
                </span>
              </div>
            )}

            {/* ESTADO */}

            <div>

              {estadoUsuario ===
                'APROBADO' ||
              usuario.activo !==
                false ? (
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  🟢 Cuenta activa
                </span>
              ) : (
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
                  🟡 {usuario.estado}
                </span>
              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            CONTENIDO
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===================================================
              INFORMACIÓN PERSONAL
          =================================================== */}

          <div
            className={
              esAdministrador
                ? 'lg:col-span-7'
                : 'lg:col-span-5'
            }
          >

            <form
              onSubmit={
                guardarCambios
              }
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4"
            >

              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Información Personal
              </h3>

              {/* NOMBRE */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />

              </div>

              {/* CORREO */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>

                <input
                  type="email"
                  value={
                    usuario.email ||
                    ''
                  }
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed"
                />

              </div>

              {/* TELÉFONO */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono de Contacto
                </label>

                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />

              </div>

              {/* BOTÓN */}

              <button
                type="submit"
                className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3 rounded-xl shadow-xs transition-all text-xs"
              >
                Guardar Cambios
              </button>

            </form>

          </div>

          {/* ===================================================
              INFORMACIÓN ADMINISTRADOR
          =================================================== */}

          {esAdministrador && (
            <div className="lg:col-span-5">

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">

                <div>

                  <h3 className="text-base font-bold text-slate-900">
                    Panel de Administración
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Accesos principales para
                    gestionar VeciPets.
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Link
                    href="/admin"
                    className="p-4 rounded-2xl bg-[#EEF2FC] hover:bg-[#5E7BC4] hover:text-white transition-all"
                  >
                    <span className="text-2xl">
                      📊
                    </span>

                    <p className="text-xs font-bold mt-2">
                      Dashboard
                    </p>
                  </Link>

                  <Link
                    href="/admin/usuarios"
                    className="p-4 rounded-2xl bg-[#EEF2FC] hover:bg-[#5E7BC4] hover:text-white transition-all"
                  >
                    <span className="text-2xl">
                      👥
                    </span>

                    <p className="text-xs font-bold mt-2">
                      Usuarios
                    </p>
                  </Link>

                  <Link
                    href="/admin/refugios"
                    className="p-4 rounded-2xl bg-[#EEF2FC] hover:bg-[#5E7BC4] hover:text-white transition-all"
                  >
                    <span className="text-2xl">
                      🏠
                    </span>

                    <p className="text-xs font-bold mt-2">
                      Refugios
                    </p>
                  </Link>

                  <Link
                    href="/admin/veterinarias"
                    className="p-4 rounded-2xl bg-[#EEF2FC] hover:bg-[#5E7BC4] hover:text-white transition-all"
                  >
                    <span className="text-2xl">
                      🩺
                    </span>

                    <p className="text-xs font-bold mt-2">
                      Veterinarias
                    </p>
                  </Link>

                </div>

                <Link
                  href="/admin"
                  className="block text-center w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3 rounded-xl transition-all text-xs"
                >
                  Ir al Panel de Administración →
                </Link>

              </div>

            </div>
          )}

        </div>

        {/* =====================================================
            MIS REPORTES
        ===================================================== */}

        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <h3 className="text-lg font-extrabold text-slate-900">
              Mis Reportes Publicados (
              {misReportes.length}
              )
            </h3>

            <Link
              href="/reportar"
              className="text-xs font-bold text-[#5E7BC4] bg-[#EEF2FC] px-3 py-1.5 rounded-xl hover:bg-[#5E7BC4] hover:text-white transition-colors"
            >
              + Nuevo Reporte
            </Link>

          </div>

          {/* SIN REPORTES */}

          {misReportes.length ===
          0 ? (

            <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 space-y-2">

              <span className="text-3xl block">
                📋
              </span>

              <p className="text-xs font-bold text-slate-700">
                Aún no has creado
                reportes
              </p>

              <p className="text-[11px] text-slate-400">
                Si se te extravió una
                mascota o encontraste
                una, publícala aquí.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {misReportes.map(
                (rep) => (

                  <div
                    key={rep.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
                  >

                    <div className="flex items-center gap-3">

                      {/* FOTO DEL REPORTE */}

                      {rep.fotoUrl ? (
                        <img
                          src={rep.fotoUrl}
                          alt={rep.titulo}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                          🐾
                        </div>
                      )}

                      <div>

                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase">
                          {
                            rep.estado
                          }
                        </span>

                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mt-0.5">
                          {rep.nombreMascota ||
                            rep.titulo}
                        </h4>

                        <span className="text-[11px] text-slate-400">
                          📍{' '}
                          {
                            rep.ubicacion
                          }
                        </span>

                      </div>

                    </div>

                    <Link
                      href={`/reportes/${rep.id}`}
                      className="text-xs font-bold text-[#5E7BC4] hover:underline whitespace-nowrap"
                    >
                      Ver / Editar →
                    </Link>

                  </div>

                ),
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

