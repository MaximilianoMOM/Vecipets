'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { veterinariasAPI, Refugio } from '@/lib/api-client';

export default function VeterinariasPage() {
  const [veterinarias, setVeterinarias] = useState<Refugio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [soloUrgencias, setSoloUrgencias] = useState(false);

  useEffect(() => {
    const cargarVeterinarias = async () => {
      try {
        const datos = await veterinariasAPI.getVeterinarias();
        if (datos && datos.length > 0) {
          setVeterinarias(datos);
        } else {
          throw new Error('Sin datos en API');
        }
      } catch (err) {
        // Datos mock de respaldo
        setVeterinarias([
          {
            id: '1',
            nombre: 'Clínica Veterinaria San Francisco 24h',
            tipo: 'VETERINARIA',
            direccion: 'Calle 100 #19-60, Bogotá',
            telefono: '+57 300 987 6543',
            horario: 'Urgencias 24 Horas / 7 Días',
            servicios: ['Urgencias 24h', 'Cirugía General', 'Ecografía', 'Hospitalización'],
            latitud: 4.68,
            longitud: -74.05,
            imagenUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '2',
            nombre: 'Centro Veterinario Huellitas de Prueba',
            tipo: 'VETERINARIA',
            direccion: 'Carrera 43A #12-45, Medellín',
            telefono: '+57 315 222 3344',
            horario: 'Lunes a Sábado: 7:00 AM - 8:00 PM',
            servicios: ['Consulta Externa', 'Vacunación', 'Profilaxis Dental', 'Microchip'],
            latitud: 6.244203,
            longitud: -75.581212,
            imagenUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '3',
            nombre: 'Hospital Veterinario Especializado Central',
            tipo: 'CLINICA',
            direccion: 'Av. El Dorado #68B-31, Bogotá',
            telefono: '+57 601 555 0199',
            horario: 'Atención 24 Horas',
            servicios: ['Urgencias 24h', 'Laboratorio Clínico', 'Rayos X', 'Cuidados Intensivos'],
            latitud: 4.66,
            longitud: -74.10,
            imagenUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
          },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarVeterinarias();
  }, []);

  const veterinariasFiltradas = veterinarias.filter((v) => {
    const esUrgencia =
      v.horario?.toLowerCase().includes('24') ||
      v.servicios?.some((s) => s.toLowerCase().includes('24h') || s.toLowerCase().includes('urgencia'));
    const coincideUrgencia = !soloUrgencias || esUrgencia;
    const coincideBusqueda =
      !busqueda ||
      v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.direccion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideUrgencia && coincideBusqueda;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
            🏥 Directorio Médico Veterinario
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Clínicas Veterinarias y Atención de Urgencias
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Encuentra centros médicos, atención de emergencias 24/7 y especialistas aliados cerca de ti.
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTRO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre de veterinaria, barrio o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-2/3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => setSoloUrgencias(!soloUrgencias)}
            className={`w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              soloUrgencias
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🚨</span>
            <span>Solo Urgencias 24 Horas</span>
          </button>
        </div>

        {/* GRID DE VETERINARIAS */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : veterinariasFiltradas.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 max-w-md mx-auto my-8 space-y-2">
            <span className="text-4xl block">🏥</span>
            <h3 className="text-base font-bold text-slate-800">No se encontraron clínicas</h3>
            <p className="text-xs text-slate-500">Intenta desmarcar los filtros o cambiar la búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {veterinariasFiltradas.map((vet) => {
              const es24h =
                vet.horario?.toLowerCase().includes('24') ||
                vet.servicios?.some((s) => s.toLowerCase().includes('24h'));

              return (
                <div
                  key={vet.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-48 bg-slate-100 relative">
                      {vet.imagenUrl ? (
                        <img
                          src={vet.imagenUrl}
                          alt={vet.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏥</div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {es24h && (
                          <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                            🚨 Urgencias 24h
                          </span>
                        )}
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                          Veterinaria
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-extrabold text-lg text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                        {vet.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-start gap-1">
                        <span>📍</span>
                        <span>{vet.direccion}</span>
                      </p>
                      {vet.horario && (
                        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <span>🕒</span>
                          <span>{vet.horario}</span>
                        </p>
                      )}

                      {vet.servicios && vet.servicios.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {vet.servicios.map((s) => (
                            <span
                              key={s}
                              className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex gap-2">
                    <a
                      href={`tel:${vet.telefono}`}
                      className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors block shadow-xs"
                    >
                      📞 Llamar
                    </a>
                    <Link
                      href={`/mapa?lat=${vet.latitud}&lng=${vet.longitud}`}
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center"
                      title="Ver en Mapa"
                    >
                      🗺️ Mapa
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}