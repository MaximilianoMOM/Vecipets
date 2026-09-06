'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-[#EEF2FC] py-16 md:py-24 relative overflow-hidden border-b border-blue-100">
      {/* Luces de fondo estilo glassmorphism */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F3B26C]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#5E7BC4]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* TEXTOS Y CTAS */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-blue-200/60 shadow-xs">
              <span className="text-lg">🐾</span>
              <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-wider">
                Red Comunitaria de Rescate y Alerta
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#292A2F] tracking-tight leading-[1.15]">
              Ayudamos a reunir <br className="hidden sm:inline" />
              <span className="text-[#5E7BC4]">familias con sus mascotas</span>
            </h1>

            <p className="text-base sm:text-lg text-[#53627A] font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Si tu peludo se ha extraviado o encontraste un animal sin hogar en la calle, conéctate con la red vecinal más grande para su pronto regreso a casa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/reportar"
                className="w-full sm:w-auto bg-[#F3B26C] hover:bg-[#e29e54] text-slate-950 font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
              >
                <span>📢</span>
                <span>Reportar Mascota Perdida</span>
              </Link>
              <Link
                href="/reportes"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#5E7BC4] border-2 border-[#5E7BC4]/30 font-bold text-base px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Buscar Mascotas</span>
              </Link>
            </div>

            {/* ESTADÍSTICAS RÁPIDAS */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#5E7BC4]">1,240+</span>
                <span className="text-xs font-semibold text-[#53627A]">Reuniones Exitosas</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#F3B26C]">480+</span>
                <span className="text-xs font-semibold text-[#53627A]">Reportes Activos</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600">85+</span>
                <span className="text-xs font-semibold text-[#53627A]">Refugios Aliados</span>
              </div>
            </div>
          </div>

          {/* ILUSTRACIÓN / CARDS DE VISTA PREVIA */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"
                  alt="Mascota buscando hogar"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-xs py-1 px-3 rounded-full shadow-md">
                  🚨 URGENTE - PERDIDO
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-800">Bruno (Beagle)</h3>
                  <span className="text-xs font-semibold text-slate-400">Hace 2h</span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  📍 Visto por última vez en Parque Central
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                    💰 Recompensa
                  </span>
                  <Link
                    href="/reportes"
                    className="text-xs font-bold text-[#5E7BC4] hover:underline"
                  >
                    Ver caso completo →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
