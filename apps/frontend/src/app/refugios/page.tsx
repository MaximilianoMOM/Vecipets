'use client';

import React, { useEffect, useState } from 'react';
import { refugiosAPI, Refugio } from '@/lib/api-client';

export default function RefugiosPage() {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  useEffect(() => {
    const cargarRefugios = async () => {
      try {
        const datos = await refugiosAPI.getRefugios();
        setRefugios(datos);
      } catch (err) {
        // Datos mock de respaldo
        setRefugios([
          {
            id: '1',
            nombre: 'Refugio Huellitas de Amor',
            tipo: 'REFUGIO',
            direccion: 'Av. Las Palmas #45-12, Bogotá',
            telefono: '+57 312 456 7890',
            horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
            servicios: ['Adopciones', 'Rescate', 'Hogar de paso'],
            latitud: 4.65,
            longitud: -74.08,
            imagenUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '2',
            nombre: 'Clínica Veterinaria San Francisco 24h',
            tipo: 'VETERINARIA',
            direccion: 'Calle 100 #19-60, Bogotá',
            telefono: '+57 300 987 6543',
            horario: 'Urgencias 24 Horas',
            servicios: ['Urgencias 24h', 'Cirugía', 'Ecografía', 'Hospitalización'],
            latitud: 4.68,
            longitud: -74.05,
            imagenUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '3',
            nombre: 'Centro Veterinario Comunitario San Rafael',
            tipo: 'CLINICA',
            direccion: 'Cra 15 #72-30, Medellín',
            telefono: '+57 315 222 3344',
            horario: 'Lunes a Viernes: 7:00 AM - 7:00 PM',
            servicios: ['Esterilización', 'Vacunación', 'Microchip de identificación'],
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

  const refugiosFiltrados = refugios.filter((r) => {
    const coincideTipo = filtroTipo === 'TODOS' || r.tipo === filtroTipo;
    const coincideBusqueda =
      !busqueda ||
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.direccion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold text-[#F3B26C] uppercase tracking-widest bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
            Directorio Aliado
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Refugios y Clínicas Veterinarias
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Encuentra centros de atención médica, albergues de paso y aliados comunitarios en tu zona.
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre de refugio, clínica o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
          />
          <div className="flex gap-2 w-full md:w-auto">
            {['TODOS', 'REFUGIO', 'VETERINARIA', 'CLINICA'].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  filtroTipo === t
                    ? 'bg-[#5E7BC4] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* GRID DE RESULTADOS */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : refugiosFiltrados.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 max-w-md mx-auto my-8 space-y-2">
            <span className="text-4xl block">🏥</span>
            <h3 className="text-base font-bold text-slate-800">No se encontraron centros</h3>
            <p className="text-xs text-slate-500">Prueba ajustando los criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {refugiosFiltrados.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-slate-100 relative">
                    {place.imagenUrl && (
                      <img
                        src={place.imagenUrl}
                        alt={place.nombre}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span
                      className={`absolute top-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${
                        place.tipo === 'REFUGIO'
                          ? 'bg-purple-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {place.tipo}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                      {place.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">📍 {place.direccion}</p>
                    {place.horario && (
                      <p className="text-xs text-slate-500 font-medium">🕒 {place.horario}</p>
                    )}

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
                </div>

                <div className="p-6 pt-0">
                  <a
                    href={`tel:${place.telefono}`}
                    className="w-full text-center bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold text-xs py-3 rounded-xl transition-colors block shadow-xs"
                  >
                    📞 Llamar al {place.telefono}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}