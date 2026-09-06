'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapaGeneralDynamic } from '../mapa/MapDynamicWrapper';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function MapSection() {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const datos = await reportesAPI.getReportes();
        setReportes(datos);
      } catch (err) {
        // Datos mock de demostración para vista mapa en home
        setReportes([
          {
            id: '1',
            titulo: 'Perro perdido en el parque',
            nombreMascota: 'Bobby',
            especie: 'PERRO',
            tipo: 'PERDIDA',
            estado: 'PUBLICO',
            descripcion: 'Beagle tricolor muy amigable',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Parque Virrey',
            latitud: 4.6735,
            longitud: -74.0561,
            fechaEvento: '2026-09-03',
            contactoTelefono: '3000000000',
            createdAt: '2026-09-03T10:00:00Z',
          },
          {
            id: '2',
            titulo: 'Gato siamés visto en tejado',
            nombreMascota: 'Milo',
            especie: 'GATO',
            tipo: 'HALLAZGO',
            estado: 'PUBLICO',
            descripcion: 'Ojos azules, collar rojo',
            fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Calle 85 con 15',
            latitud: 4.6698,
            longitud: -74.0579,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3110000000',
            createdAt: '2026-09-04T12:00:00Z',
          },
        ]);
      }
    };

    cargarReportes();
  }, []);

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-widest bg-[#EEF2FC] px-3.5 py-1 rounded-full">
              Geolocalización en Vivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#292A2F] tracking-tight mt-3">
              Explora el mapa de reportes comunitarios
            </h2>
            <p className="text-[#53627A] text-sm sm:text-base mt-2 max-w-xl">
              Visualiza en tiempo real los avistamientos y reportes activos cerca de tu ubicación o barrio.
            </p>
          </div>

          <Link
            href="/mapa"
            className="bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>🗺️</span>
            <span>Abrir Mapa a Pantalla Completa</span>
          </Link>
        </div>

        {/* CONTENEDOR DEL MAPA */}
        <div className="h-[480px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <MapaGeneralDynamic reportes={reportes} />
        </div>

      </div>
    </section>
  );
}
