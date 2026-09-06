'use client';

import React from 'react';

export default function HowItWorks() {
  const pasos = [
    {
      numero: '01',
      icono: '📝',
      titulo: 'Reporta en Segundos',
      descripcion: 'Crea un anuncio con fotos, características distintivas y selecciona la ubicación exacta en el mapa interactivo.',
      color: 'bg-[#EEF2FC] text-[#5E7BC4]',
    },
    {
      numero: '02',
      icono: '📡',
      titulo: 'Difusión Comunitaria',
      descripcion: 'La plataforma notifica automáticamente a vecinos, refugios y veterinarias cercanas en un radio de acción rápido.',
      color: 'bg-amber-50 text-[#F3B26C]',
    },
    {
      numero: '03',
      icono: '❤️',
      titulo: 'Reunifica la Familia',
      descripcion: 'Ponte en contacto seguro a través de los datos de enlace directos y celebra la pronta reunificación de tu mascota.',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-xs border border-slate-200">
            Proceso Sencillo y Efectivo
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#292A2F] tracking-tight">
            ¿Cómo funciona VeciPets?
          </h2>
          <p className="text-base text-[#53627A] font-medium">
            Tres pasos clave para movilizar a la comunidad y maximizar las posibilidades de reencuentro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {pasos.map((paso, index) => (
            <div
              key={paso.numero}
              className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${paso.color}`}>
                    {paso.icono}
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-[#5E7BC4] transition-colors">
                    {paso.numero}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#292A2F] mb-3">
                  {paso.titulo}
                </h3>
                <p className="text-sm text-[#53627A] leading-relaxed">
                  {paso.descripcion}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#5E7BC4]">
                Paso indispensable →
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
