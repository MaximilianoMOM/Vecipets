'use client';

import dynamic from 'next/dynamic';
import React from 'react';

export const MapaGeneralDynamic = dynamic(
  () => import('./MapaGeneralLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando mapa interactivo...
      </div>
    ),
  }
);

export const MapaSelectorDynamic = dynamic(
  () => import('./MapaSelectorUbicacion'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando selector de ubicación...
      </div>
    ),
  }
);

export const MapaReportesDynamic = dynamic(
  () => import('./MapaReportes'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando mapa de ubicación...
      </div>
    ),
  }
);
