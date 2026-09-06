'use client';

import React from 'react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#5E7BC4] to-[#4F6FB8] text-white relative overflow-hidden">
      {/* Círculos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F3B26C]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl mx-auto border border-white/30">
          🐾
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
          ¿Encontraste a una mascota sin hogar o necesitas ayuda?
        </h2>

        <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
          No estás solo. Toda la comunidad de VeciPets está lista para ayudarte a difundir la información de manera inmediata.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/reportar"
            className="w-full sm:w-auto bg-[#F3B26C] hover:bg-[#e29e54] text-slate-950 font-bold text-base px-9 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 text-center"
          >
            Publicar Reporte Ahora ✨
          </Link>
          <Link
            href="/registro"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-base px-9 py-4 rounded-2xl transition-all text-center"
          >
            Unirme como Voluntario 🤝
          </Link>
        </div>
      </div>
    </section>
  );
}
