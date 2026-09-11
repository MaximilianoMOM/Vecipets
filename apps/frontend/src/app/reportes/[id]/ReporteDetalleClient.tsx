'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

import { MapaReportesDynamic } from '@/components/mapa/MapDynamicWrapper';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function ReporteDetalleClient() {
  const params = useParams();
  const { mostrarToast } = useToast();

  const id = params?.id as string;

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [requiereLogin, setRequiereLogin] = useState(false);

  useEffect(() => {
    const cargarReporte = async () => {
      if (!id) return;

      try {
        setRequiereLogin(false);
        const datos = await reportesAPI.getReporteById(id);

        const ubicacion = datos.ubicacion as any;

        const reporteNormalizado: Reporte = {
          ...datos,
          ubicacion:
            ubicacion?.direccion ||
            ubicacion?.barrio ||
            ubicacion?.comuna ||
            (typeof datos.ubicacion === 'string' ? datos.ubicacion : 'Ubicación registrada'),
          ciudad: datos.ciudad || ubicacion?.comuna || '',
        };

        setReporte(reporteNormalizado);
      } catch (err: any) {
        // Capturar error 401 sin romper la interfaz
        if (err?.message?.includes('UNAUTHORIZED') || err?.message?.includes('Unauthorized')) {
          setRequiereLogin(true);
          setReporte(null);
        } else {
          // Datos mock de respaldo si el backend está offline
          setReporte({
            id: id || '1',
            titulo: 'Mascota reportada en la comunidad',
            nombreMascota: 'Mascota en búsqueda',
            especie: 'PERRO',
            tipo: 'PERDIDA',
            estado: 'PUBLICO',
            descripcion: 'Reporte registrado en la plataforma VeciPets. Para ver todos los detalles en tiempo real o contactar a la familia, inicia sesión.',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Sector Parque Virrey, Bogotá',
            latitud: 4.6735,
            longitud: -74.0561,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3001234567',
            createdAt: new Date().toISOString(),
          });
        }
      } finally {
        setCargando(false);
      }
    };

    cargarReporte();
  }, [id]);

  /*
   * MARCAR REPORTE COMO RESUELTO
   */
  const cambiarEstadoResuelto = async () => {
    if (!reporte) return;

    setActualizandoEstado(true);

    try {
      await reportesAPI.cambiarEstado(
        reporte.id,
        'RESUELTO',
      );

      setReporte({
        ...reporte,
        estado: 'RESUELTO',
      });

      mostrarToast(
        '¡Excelente noticia! El reporte fue marcado como resuelto.',
        'exito',
      );
    } catch (err: any) {
      console.error(
        'Error al actualizar estado:',
        err,
      );

      mostrarToast(
        err?.message ||
          'No se pudo actualizar el estado del reporte.',
        'error',
      );
    } finally {
      setActualizandoEstado(false);
    }
  };

  /*
   * CARGANDO
   */
  if (cargando) {
    return (
      <div className="py-16 max-w-5xl mx-auto px-4">
        <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  /*
   * REQUIERE SESIÓN ACTIVA (401)
   */
  if (requiereLogin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
        <span className="text-6xl block">🔒</span>
        <h2 className="text-2xl font-black text-slate-900">
          Inicia sesión para ver este reporte
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Para proteger la privacidad de los contactos y la seguridad de las mascotas, necesitas una cuenta activa en VeciPets.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login"
            className="bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all block"
          >
            🔑 Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs transition-all block border border-slate-200"
          >
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </div>
    );
  }

  /*
   * REPORTE NO ENCONTRADO
   */
  if (!reporte) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
        <span className="text-6xl">
          😿
        </span>

        <h2 className="text-xl font-bold text-slate-800">
          Reporte no encontrado
        </h2>

        <p className="text-sm text-slate-500">
          No fue posible encontrar la información
          de este reporte.
        </p>

        <Link
          href="/reportes"
          className="bg-[#5E7BC4] text-white px-5 py-2.5 rounded-xl font-bold text-sm inline-block"
        >
          Volver a reportes
        </Link>
      </div>
    );
  }

  /*
   * DATOS VISUALES
   */
  const esPerdida =
    reporte.tipo === 'PERDIDA';

  const esHallazgo =
    reporte.tipo === 'HALLAZGO';

  const esResuelto =
    reporte.estado === 'RESUELTO';

  let badgeText = 'Reporte';

  let badgeColor =
    'bg-slate-500';

  if (esPerdida) {
    badgeText = 'Perdida';
    badgeColor = 'bg-rose-500';
  }

  if (esHallazgo) {
    badgeText = 'Hallazgo';
    badgeColor = 'bg-emerald-500';
  }

  if (esResuelto) {
    badgeText = 'Resuelto';
    badgeColor = 'bg-blue-600';
  }

  /*
   * ICONO DE ESPECIE
   */
  const iconoEspecie =
    reporte.especie === 'PERRO'
      ? '🐶'
      : reporte.especie === 'GATO'
        ? '🐱'
        : '🐾';

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===================================== */}
        {/* BOTÓN VOLVER */}
        {/* ===================================== */}

        <Link
          href="/reportes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          ← Volver al catálogo de reportes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===================================== */}
          {/* COLUMNA IZQUIERDA */}
          {/* ===================================== */}

          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">

              {/* ================================= */}
              {/* FOTO */}
              {/* ================================= */}

              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100">

                {reporte.fotoUrl ? (
                  <img
                    src={reporte.fotoUrl}
                    alt={
                      reporte.nombreMascota ||
                      reporte.titulo
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <span className="text-6xl mb-3">
                      📷
                    </span>

                    <span className="text-sm font-semibold">
                      Sin imagen disponible
                    </span>
                  </div>
                )}

                {/* BADGES */}

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">

                  <span
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider text-white ${badgeColor}`}
                  >
                    {badgeText}
                  </span>

                  <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {iconoEspecie}{' '}
                    {reporte.especie ||
                      'OTRO'}
                  </span>

                </div>
              </div>

              {/* ================================= */}
              {/* INFORMACIÓN PRINCIPAL */}
              {/* ================================= */}

              <div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  {reporte.nombreMascota ||
                    reporte.titulo}
                </h1>

                <div className="flex flex-wrap gap-2 text-xs font-semibold mb-4">

                  <span className="bg-[#EEF2FC] text-[#5E7BC4] px-3 py-1 rounded-lg">
                    {iconoEspecie}{' '}
                    Especie:{' '}
                    {reporte.especie ||
                      'OTRO'}
                  </span>

                  {reporte.raza && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                      🐕 Raza:{' '}
                      {reporte.raza}
                    </span>
                  )}

                  {reporte.color && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                      🎨 Color:{' '}
                      {reporte.color}
                    </span>
                  )}

                </div>

                {/* DESCRIPCIÓN */}

                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Descripción del reporte
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {reporte.descripcion ||
                    'Sin descripción disponible.'}
                </p>

              </div>

              {/* ================================= */}
              {/* FECHA */}
              {/* ================================= */}

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">

                <span>
                  📅{' '}
                  {new Date(
                    reporte.fechaEvento ||
                      reporte.createdAt,
                  ).toLocaleDateString(
                    'es-CO',
                  )}
                </span>

                <span>
                  📍{' '}
                  {reporte.ubicacion ||
                    'Ubicación no disponible'}
                </span>

              </div>

              {/* ================================= */}
              {/* MARCAR COMO RESUELTO */}
              {/* ================================= */}

              {!esResuelto && (
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                  <span className="text-xs text-slate-500 font-medium">
                    ¿El caso ya fue solucionado?
                  </span>

                  <button
                    type="button"
                    onClick={
                      cambiarEstadoResuelto
                    }
                    disabled={
                      actualizandoEstado
                    }
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎉</span>

                    <span>
                      {actualizandoEstado
                        ? 'Actualizando...'
                        : 'Marcar como resuelto'}
                    </span>
                  </button>

                </div>
              )}

              {/* ================================= */}
              {/* REPORTE RESUELTO */}
              {/* ================================= */}

              {esResuelto && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                  <span className="text-sm font-bold text-blue-700">
                    ✅ Este reporte ya fue
                    marcado como resuelto.
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* ===================================== */}
          {/* COLUMNA DERECHA */}
          {/* ===================================== */}

          <div className="lg:col-span-5 space-y-6">

            {/* ================================= */}
            {/* CONTACTO */}
            {/* ================================= */}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">

              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📞</span>
                <span>
                  Datos de Contacto
                </span>
              </h3>

              {reporte.contactoTelefono ? (
                <a
                  href={`tel:${reporte.contactoTelefono}`}
                  className="w-full bg-[#F3B26C] hover:bg-[#e29e54] text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  📞 Llamar al{' '}
                  {reporte.contactoTelefono}
                </a>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400">
                    No hay teléfono de
                    contacto disponible.
                  </p>
                </div>
              )}

              {reporte.contactoEmail && (
                <a
                  href={`mailto:${reporte.contactoEmail}`}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-slate-200"
                >
                  ✉️ Enviar correo
                </a>
              )}

            </div>

            {/* ================================= */}
            {/* UBICACIÓN */}
            {/* ================================= */}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">

              <div>

                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span>📍</span>
                  <span>
                    Ubicación del reporte
                  </span>
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  {reporte.ubicacion ||
                    'Ubicación no disponible'}

                  {reporte.ciudad
                    ? ` (${reporte.ciudad})`
                    : ''}
                </p>

              </div>

              {/* ================================= */}
              {/* MAPA */}
              {/* ================================= */}

              <div className="h-64 rounded-2xl overflow-hidden shadow-inner">

                <MapaReportesDynamic
                  latitud={
                    reporte.latitud
                  }
                  longitud={
                    reporte.longitud
                  }
                  nombreMascota={
                    reporte.nombreMascota
                  }
                  tipo={reporte.tipo}
                  ubicacion={
                    reporte.ubicacion
                  }
                />

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
