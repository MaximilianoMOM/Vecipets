'use client';

import dynamic from 'next/dynamic';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Zap,
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { leerCoordenadas } from '@/lib/reportes-mapa';
import type { MapaInteractivoProps } from '@/app/components/map/MapaInteractivo';

const MapaInteractivoDetalle = dynamic<MapaInteractivoProps>(
  () => import('@/app/components/map/MapaInteractivo'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
        <p className="text-xs text-slate-500 font-medium">Cargando mapa con ubicación registrada...</p>
      </div>
    ),
  }
);

export default function ReporteDetallePage() {
  const params = useParams();
  const reporteId = params?.id ? Number(params.id) : null;

  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reporteId || isNaN(reporteId)) return;

    let cancelado = false;
    const cargarReporte = async () => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await apiClient.get(`/reportes/${reporteId}`);
        if (!cancelado) {
          setReporte(respuesta.data?.reporte ?? respuesta.data);
        }
      } catch (err: any) {
        if (!cancelado) {
          if (err.response?.status === 404) {
            notFound();
          }
          setError(err.response?.data?.message || 'No se pudo cargar el reporte.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    void cargarReporte();
    return () => {
      cancelado = true;
    };
  }, [reporteId]);

  const obtenerUrlImagen = (url?: string | null): string => {
    if (!url) return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando información del reporte...</p>
        </div>
      </main>
    );
  }

  if (error || !reporte) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <p className="text-sm text-slate-700 font-semibold">{error || 'Reporte no encontrado.'}</p>
          <Link
            href="/reportes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a los reportes
          </Link>
        </div>
      </main>
    );
  }

  const esPerdida = (reporte.tipo || reporte.estado || '').toUpperCase() === 'PERDIDA';
  const coordenadas = leerCoordenadas(reporte.latitud, reporte.longitud);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Botón de regreso */}
        <Link
          href="/reportes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al listado general
        </Link>

        {/* Tarjeta Principal de la Mascota */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
            <img
              src={obtenerUrlImagen(reporte.imagenUrl)}
              alt={reporte.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md flex items-center gap-1 ${
                  esPerdida ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              >
                {esPerdida ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> MASCOTA PERDIDA
                  </>
                ) : (
                  'MASCOTA ENCONTRADA'
                )}
              </span>
              {reporte.esTurbo && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-amber-950" /> ALERTA TURBO ACTIVA
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{reporte.nombre}</h1>
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {reporte.especie} {reporte.raza ? `• ${reporte.raza}` : ''}
              </p>
            </div>

            {/* Características de la Mascota */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Color</span>
                <span className="font-semibold text-slate-800">{reporte.color || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Tamaño</span>
                <span className="font-semibold text-slate-800">{reporte.tamano || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Sexo</span>
                <span className="font-semibold text-slate-800">{reporte.sexo || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Edad aprox.</span>
                <span className="font-semibold text-slate-800">{reporte.edad || 'No especificada'}</span>
              </div>
            </div>

            {/* Recompensa */}
            {reporte.recompensa && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Recompensa ofrecida</span>
                  <span className="text-xs text-amber-700">Por información que permita encontrar a {reporte.nombre}</span>
                </div>
                <span className="text-base font-black text-amber-800">${reporte.recompensa} COP</span>
              </div>
            )}

            {/* Descripción */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Descripción detallada
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {reporte.descripcion}
              </p>
            </div>

            {/* Información del Evento */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span><strong>Fecha del suceso:</strong> {reporte.fechaEvento || 'Reciente'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span><strong>Barrio / Sector:</strong> {reporte.barrioSector}</span>
              </div>
            </div>

            {/* Información de Contacto Autorizada */}
            {reporte.usuario && (
              <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Contacto Autorizado del Tutor
                </h4>
                <div className="text-xs text-slate-700 space-y-1 pt-1">
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>Publicado por:</strong> {reporte.usuario.nombre}</span>
                  </p>
                  {reporte.usuario.correo && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Correo de contacto:</strong> {reporte.usuario.correo}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa con Ubicación Real Registrada */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Ubicación Registrada del Suceso
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {reporte.barrioSector} {reporte.direccion ? `• ${reporte.direccion}` : ''}
              </p>
            </div>
            {coordenadas && reporte.estado === 'PUBLICO' && (
              <Link href={`/mapa#reporte-${reporte.id}`} className="text-right text-xs font-bold text-indigo-700 hover:underline">
                Ver en el mapa general
              </Link>
            )}
          </div>

          {coordenadas ? (
            <div className="h-[360px] w-full rounded-2xl border border-slate-200 overflow-hidden">
              <MapaInteractivoDetalle
                lat={coordenadas.lat}
                lng={coordenadas.lng}
                etiqueta={`${reporte.nombre} (${reporte.barrioSector})`}
              />
            </div>
          ) : (
            <div className="h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Coordenadas no registradas</p>
              <p className="text-[11px] text-slate-400">El reporte cuenta con sector descriptivo: {reporte.barrioSector}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
