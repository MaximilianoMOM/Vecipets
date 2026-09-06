'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { refugiosAPI, Refugio } from '@/lib/api-client';

export default function SupportPlaces() {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRefugios = async () => {
      try {
        const datos = await refugiosAPI.getRefugios();
        setRefugios(datos.slice(0, 3));
      } catch (err) {
        // Datos mock de respaldo
        setRefugios([
          {
            id: '1',
            nombre: 'Refugio Huellitas de Amor',
            tipo: 'REFUGIO',
            direccion: 'Av. Las Palmas #45-12',
            telefono: '+57 312 456 7890',
            horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
            servicios: ['Adopciones', 'Rescate', 'Hogar de paso'],
            latitud: 4.65,
            longitud: -74.08,
            imagenUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '2',
            nombre: 'Clínica Veterinaria San Francisco',
            tipo: 'VETERINARIA',
            direccion: 'Calle 100 #19-60',
            telefono: '+57 300 987 6543',
            horario: 'Urgencias 24 Horas',
            servicios: ['Urgencias 24h', 'Cirugía', 'Ecografía'],
            latitud: 4.68,
            longitud: -74.05,
            imagenUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '3',
            nombre: 'Centro Veterinario Comunitario',
            tipo: 'CLINICA',
            direccion: 'Cra 15 #72-30',
            telefono: '+57 315 222 3344',
            horario: 'Lunes a Viernes: 7:00 AM - 7:00 PM',
            servicios: ['Esterilización', 'Vacunación', 'Microchip'],
            latitud: 4.66,
            longitud: -74.06,
            imagenUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80',
          },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarRefugios();
  }, []);

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#F3B26C] uppercase tracking-widest bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full">
              Aliados Aliados y Puntos de Apoyo
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#292A2F] tracking-tight mt-3">
              Refugios y Clínicas Veterinarias
            </h2>
          </div>
          <Link
            href="/refugios"
            className="text-sm font-bold text-[#5E7BC4] hover:underline"
          >
            Ver directorio completo →
          </Link>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {refugios.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col"
              >
                <div className="h-44 bg-slate-200 relative">
                  {place.imagenUrl && (
                    <img
                      src={place.imagenUrl}
                      alt={place.nombre}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                      place.tipo === 'REFUGIO'
                        ? 'bg-purple-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {place.tipo}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800 mb-2">
                      {place.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      📍 {place.direccion}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      📞 {place.telefono}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {place.servicios?.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`tel:${place.telefono}`}
                    className="w-full text-center bg-[#EEF2FC] hover:bg-[#5E7BC4] text-[#5E7BC4] hover:text-white text-xs font-bold py-2.5 rounded-xl transition-colors block"
                  >
                    Contactar Ahora
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
