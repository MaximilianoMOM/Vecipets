'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReporteCard from '../reportes/ReporteCard';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function AlertsSection() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const datos = await reportesAPI.getReportes({ tipo: 'PERDIDA' });
        setReportes(datos.slice(0, 3));
      } catch (err) {
        // Datos mock de respaldo si el backend aún no está iniciado localmente
        setReportes([
          {
            id: '1',
            titulo: 'Perro extraviado en el norte',
            nombreMascota: 'Max',
            especie: 'PERRO',
            tipo: 'PERDIDA',
            estado: 'PUBLICO',
            descripcion: 'Se extravió cerca a la estación principal. Lleva collar azul.',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Zona Norte, Calle 127',
            latitud: 4.7109,
            longitud: -74.0721,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3001234567',
            createdAt: '2026-09-04T10:00:00Z',
          },
          {
            id: '2',
            titulo: 'Gata mestiza encontrada',
            nombreMascota: 'Luna',
            especie: 'GATO',
            tipo: 'HALLAZGO',
            estado: 'PUBLICO',
            descripcion: 'Encontrada refugiada bajo un automóvil. Es muy cariñosa.',
            fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Barrio Palermo',
            latitud: 4.6300,
            longitud: -74.0700,
            fechaEvento: '2026-09-05',
            contactoTelefono: '3119876543',
            createdAt: '2026-09-05T08:00:00Z',
          },
          {
            id: '3',
            titulo: 'Perrita extraviada en el centro',
            nombreMascota: 'Kira',
            especie: 'PERRO',
            tipo: 'PERDIDA',
            estado: 'PUBLICO',
            descripcion: 'Buscamos a Kira, se perdió cerca del parque central.',
            fotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Parque Central, Bogotá',
            latitud: 4.6500,
            longitud: -74.0900,
            fechaEvento: '2026-09-01',
            contactoTelefono: '3205551234',
            createdAt: '2026-09-01T12:00:00Z',
          },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarAlertas();
  }, []);

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                Alertas Recientes
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#292A2F] tracking-tight">
              Mascotas que necesitan ayuda urgente
            </h2>
          </div>
          <Link
            href="/reportes"
            className="text-sm font-bold text-[#5E7BC4] hover:text-[#4F6FB8] flex items-center gap-1 group"
          >
            <span>Ver todos los reportes</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* GRID DE TARJETAS */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportes.map((reporte) => (
              <ReporteCard key={reporte.id} reporte={reporte} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
