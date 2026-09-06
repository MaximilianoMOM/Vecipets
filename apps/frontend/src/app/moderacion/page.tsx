'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface ReportePendiente {
  id: string;
  titulo: string;
  motivoReporte: string;
  reportadoPor: string;
  fecha: string;
  fotoUrl: string;
}

export default function ModeracionPage() {
  const { mostrarToast } = useToast();

  const [pendientes, setPendientes] = useState<ReportePendiente[]>([
    {
      id: 'mod-1',
      titulo: 'Publicación con número telefónico posiblemente incorrecto',
      motivoReporte: 'Posible spam o teléfono erróneo',
      reportadoPor: 'vecino_comunitario@ejemplo.com',
      fecha: '2026-09-05',
      fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mod-2',
      titulo: 'Reporte de animal repetido dos veces',
      motivoReporte: 'Publicación duplicada',
      reportadoPor: 'maria.gomez@ejemplo.com',
      fecha: '2026-09-04',
      fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const aprobarPublicacion = (id: string) => {
    setPendientes((prev) => prev.filter((p) => p.id !== id));
    mostrarToast('Publicación verificada y mantenida visible.', 'exito');
  };

  const ocultarPublicacion = (id: string) => {
    setPendientes((prev) => prev.filter((p) => p.id !== id));
    mostrarToast('Publicación removida del catálogo general.', 'info');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 space-y-2">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3.5 py-1 rounded-full border border-purple-200">
            Panel Administrativo
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Tablero de Moderación Comunitaria
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Revisa las alertas flagged por vecinos para mantener la calidad y veracidad de la información.
          </p>
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 space-y-3">
            <span className="text-5xl block">🎉</span>
            <h3 className="text-lg font-bold text-slate-800">
              ¡Sin alertas pendientes de moderación!
            </h3>
            <p className="text-xs text-slate-500">
              Todas las publicaciones han sido verificadas por el equipo comunitario.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img
                    src={p.fotoUrl}
                    alt={p.titulo}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase">
                      ⚠️ {p.motivoReporte}
                    </span>
                    <h3 className="font-bold text-base text-slate-800 mt-1">
                      {p.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Reportado por {p.reportadoPor} el {p.fecha}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => aprobarPublicacion(p.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => ocultarPublicacion(p.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
                  >
                    🗑️ Ocultar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
