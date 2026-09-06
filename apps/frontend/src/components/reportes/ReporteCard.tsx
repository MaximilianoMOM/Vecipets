'use client';

import React from 'react';
import Link from 'next/link';
import { Reporte } from '@/lib/api-client';

interface ReporteCardProps {
  reporte: Reporte;
}

export default function ReporteCard({ reporte }: ReporteCardProps) {
  let badgeColor = 'bg-rose-500 text-white';
  let badgeText = 'Perdido';

  if (reporte.tipo === 'ENCONTRADO' || reporte.estado === 'ENCONTRADO') {
    badgeColor = 'bg-emerald-500 text-white';
    badgeText = 'Encontrado';
  } else if (reporte.tipo === 'ADOPCION' || reporte.estado === 'EN_ADOPCION') {
    badgeColor = 'bg-purple-500 text-white';
    badgeText = 'En Adopción';
  } else if (reporte.estado === 'REUNIDO' || reporte.estado === 'ADOPTADO') {
    badgeColor = 'bg-blue-600 text-white';
    badgeText = reporte.estado === 'REUNIDO' ? '¡Reunido!' : '¡Adoptado!';
  }

  const iconoEspecie =
    reporte.especie === 'PERRO' ? '🐶' : reporte.especie === 'GATO' ? '🐱' : '🐾';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group">
      {/* IMAGEN DE LA MASCOTA */}
      <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
        {reporte.fotoUrl ? (
          <img
            src={reporte.fotoUrl}
            alt={reporte.nombreMascota || reporte.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <span className="text-4xl mb-1">📷</span>
            <span className="text-xs font-semibold">Sin imagen</span>
          </div>
        )}

        {/* BADGE DE TIPO DE REPORTE */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {iconoEspecie} {reporte.especie}
          </span>
        </div>

        {reporte.recompensa && reporte.recompensa > 0 ? (
          <span className="absolute bottom-3 right-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
            💰 Recompensa
          </span>
        ) : null}
      </div>

      {/* DETALLES DE LA TARJETA */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
            <span>📅 {new Date(reporte.fechaEvento || reporte.createdAt).toLocaleDateString('es-ES')}</span>
            <span>📍 {reporte.ciudad || 'Ciudad'}</span>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1 group-hover:text-[#5E7BC4] transition-colors">
            {reporte.nombreMascota ? `${reporte.nombreMascota}` : reporte.titulo}
          </h3>

          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">
            📍 {reporte.ubicacion}
          </p>

          <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
            {reporte.descripcion}
          </p>
        </div>

        <Link
          href={`/reportes/${reporte.id}`}
          className="w-full text-center bg-[#EEF2FC] hover:bg-[#5E7BC4] text-[#5E7BC4] hover:text-white font-bold text-xs py-3 rounded-xl transition-all block shadow-xs"
        >
          Ver Información y Contacto →
        </Link>
      </div>
    </div>
  );
}
