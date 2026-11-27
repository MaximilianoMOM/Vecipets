'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  MapPin,
  Calendar,
  AlertTriangle,
  Zap,
  ArrowLeft,
} from 'lucide-react';

import apiClient from '@/lib/api-client';
import { leerCoordenadas } from '@/lib/reportes-mapa';
import Avistamientos from '../components/Avistamientos';

export default function ReporteDetallePage() {
  const params = useParams();
  const reporteId = params?.id ? Number(params.id) : null;

  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // CARGAR INFORMACIÓN DEL REPORTE
  // ==========================================

  useEffect(() => {
    if (
      !reporteId ||
      !Number.isInteger(reporteId) ||
      reporteId <= 0
    ) {
      setReporte(null);
      setError('El identificador del reporte no es válido.');
      setCargando(false);
      return;
    }

    let cancelado = false;

    const cargarReporte = async () => {
      setCargando(true);
      setError(null);
      setReporte(null);

      try {
        const respuesta = await apiClient.get(
          `/reportes/${reporteId}`
        );

        if (!cancelado) {
          setReporte(
            respuesta.data?.reporte ?? respuesta.data
          );
        }
      } catch (err: any) {
        if (!cancelado) {
          const mensaje = err.response?.data?.message;

          if (err.response?.status === 404) {
            setError('Reporte no encontrado.');
          } else {
            setError(
              Array.isArray(mensaje)
                ? mensaje.join('. ')
                : typeof mensaje === 'string'
                  ? mensaje
                  : 'No se pudo cargar el reporte.'
            );
          }
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void cargarReporte();

    return () => {
      cancelado = true;
    };
  }, [reporteId]);

  // ==========================================
  // URL DE LA IMAGEN
  // ==========================================

  const obtenerUrlImagen = (
    url?: string | null
  ): string => {
    if (!url) {
      return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600';
    }

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';

    return `${apiUrl.replace(/\/+$/, '')}${
      url.startsWith('/') ? '' : '/'
    }${url}`;
  };

  // ==========================================
  // ESTADO DE CARGA
  // ==========================================

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto py-24 flex flex-col items-center justify-center space-y-3">

          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />

          <p className="text-xs font-semibold text-slate-500">
            Cargando información del reporte...
          </p>

        </div>
      </main>
    );
  }

  // ==========================================
  // ESTADO DE ERROR
  // ==========================================

  if (error || !reporte) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto py-20 text-center space-y-4">

          <p className="text-sm text-slate-700 font-semibold">
            {error || 'Reporte no encontrado.'}
          </p>

          <Link
            href="/reportes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a los reportes
          </Link>

        </div>
      </main>
    );
  }

  // ==========================================
  // INFORMACIÓN DE LA MASCOTA
  // ==========================================

  const esPerdida =
    (reporte.tipo || reporte.estado || '')
      .toUpperCase() === 'PERDIDA';

  const caracteristicas = [
    {
      etiqueta: 'Color',
      valor: reporte.color,
    },
    {
      etiqueta: 'Tamaño',
      valor: reporte.tamano,
    },
    {
      etiqueta: 'Sexo',
      valor: reporte.sexo,
    },
    {
      etiqueta: 'Edad aprox.',
      valor: reporte.edad,
    },
  ].filter(
    ({ valor }) =>
      (typeof valor === 'string' &&
        valor.trim() !== '') ||
      (typeof valor === 'number' &&
        Number.isFinite(valor))
  );

  // ==========================================
  // VALIDACIÓN DE COORDENADAS
  // ==========================================

  const coordenadas = leerCoordenadas(
    reporte.latitud,
    reporte.longitud
  );

  const reportePublico =
    reporte.estado === 'PUBLICO' &&
    reporte.estadoAprobacion === 'APROBADO';

  const avistamientosActivos =
    !!reporteId &&
    esPerdida &&
    reportePublico;

  // ==========================================
  // INTERFAZ DEL DETALLE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* BOTÓN DE REGRESO */}

        <Link
          href="/reportes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado general
        </Link>

        {/* TARJETA PRINCIPAL DE LA MASCOTA */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-[2fr_3fr]">

          {/* FOTOGRAFÍA */}

          <div className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-slate-100 sm:h-96 md:h-auto md:min-h-96">

            <img
              src={obtenerUrlImagen(reporte.imagenUrl)}
              alt={reporte.nombre}
              className="h-full w-full object-contain md:absolute md:inset-0"
            />

            {/* ESTADO DEL REPORTE */}

            <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md flex items-center gap-1 ${
                  esPerdida
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
              >
                {esPerdida ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    MASCOTA PERDIDA
                  </>
                ) : (
                  'MASCOTA ENCONTRADA'
                )}
              </span>

              {/* INDICADOR DE ALERTA TURBO */}

              {reporte.esTurbo && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">

                  <Zap className="w-3.5 h-3.5 fill-amber-950" />

                  ALERTA TURBO ACTIVA

                </span>
              )}

            </div>
          </div>

          {/* DATOS DE LA MASCOTA */}

          <div className="min-w-0 space-y-5 p-5 sm:p-8">

            <div>

              <h1 className="text-3xl font-black text-slate-900">
                {reporte.nombre}
              </h1>

              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {reporte.especie}
                {reporte.raza
                  ? ` • ${reporte.raza}`
                  : ''}
              </p>

            </div>

            {/* CARACTERÍSTICAS */}

            {caracteristicas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">

                {caracteristicas.map(
                  ({ etiqueta, valor }) => (
                    <div key={etiqueta}>

                      <span className="text-slate-400 block font-bold uppercase text-[10px]">
                        {etiqueta}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {valor}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

            {/* RECOMPENSA */}

            {Number(reporte.recompensa) > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">

                <div>

                  <span className="text-xs font-bold text-amber-900 block">
                    Recompensa ofrecida
                  </span>

                  <span className="text-xs text-amber-700">
                    Por información que permita encontrar a{' '}
                    {reporte.nombre}
                  </span>

                </div>

                <span className="text-base font-black text-amber-800">
                  ${reporte.recompensa} COP
                </span>

              </div>
            )}

            {/* DESCRIPCIÓN */}

            <div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Descripción detallada
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {reporte.descripcion}
              </p>

            </div>

            {/* INFORMACIÓN DEL EVENTO */}

            <div className="flex flex-wrap gap-4 text-xs text-slate-600 border-t border-slate-100 pt-4">

              <div className="flex items-center gap-1.5 font-medium">

                <Calendar className="w-4 h-4 text-emerald-600" />

                <span>
                  <strong>Fecha del suceso:</strong>{' '}
                  {reporte.fechaEvento || 'Reciente'}
                </span>

              </div>

              <div className="flex items-center gap-1.5 font-medium">

                <MapPin className="w-4 h-4 text-emerald-600" />

                <span>
                  <strong>Barrio / Sector:</strong>{' '}
                  {reporte.barrioSector}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* UBICACIÓN REGISTRADA */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">

                <MapPin className="w-4 h-4 text-emerald-600" />

                Ubicación registrada del suceso

              </h3>

              <p className="text-xs text-slate-500 mt-1">

                {reporte.barrioSector}

                {reporte.direccion
                  ? ` • ${reporte.direccion}`
                  : ''}

              </p>

            </div>

            {coordenadas && reportePublico && (
              <Link
                href={`/mapa#reporte-${reporte.id}`}
                className="text-xs font-bold text-indigo-700 hover:underline"
              >
                Ver en el mapa general
              </Link>
            )}

          </div>

          {!coordenadas && (
            <div className="mt-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-5">

              <MapPin className="w-8 h-8 text-slate-300 mb-2" />

              <p className="text-xs font-bold text-slate-600">
                Coordenadas no registradas
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                El reporte cuenta con sector descriptivo:{' '}
                {reporte.barrioSector}
              </p>

            </div>
          )}

        </div>

        {/* MAPA, REGISTRO E HISTORIAL DE AVISTAMIENTOS */}

        <Avistamientos
          key={reporteId}
          id={reporteId}
          activo={avistamientosActivos}
          original={
            coordenadas
              ? {
                  lat: coordenadas.lat,
                  lng: coordenadas.lng,
                }
              : undefined
          }
          originalLabel={`${reporte.nombre} (${reporte.barrioSector})`}
          sectorOriginal={reporte.barrioSector}
          direccionOriginal={reporte.direccion}
        />

      </div>

    </main>
  );
}