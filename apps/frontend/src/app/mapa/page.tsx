'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapaGeneralDynamic } from '@/components/mapa/MapDynamicWrapper';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function MapaPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [centroMapa, setCentroMapa] = useState<[number, number]>([4.6097, -74.0817]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const datos = await reportesAPI.getReportes();
        setReportes(datos);
        if (datos.length > 0 && datos[0].latitud && datos[0].longitud) {
          setCentroMapa([datos[0].latitud, datos[0].longitud]);
        }
      } catch (err) {
        // Mock data
        const mock: Reporte[] = [
          {
            id: '1',
            titulo: 'Perro Beagle extraviado',
            nombreMascota: 'Bruno',
            especie: 'PERRO',
            tipo: 'PERDIDA',
            estado: 'PUBLICO',
            descripcion: 'Se extravió en el Parque Virrey.',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Parque Virrey, Bogotá',
            latitud: 4.6735,
            longitud: -74.0561,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3001234567',
            createdAt: '2026-09-04T10:00:00Z',
          },
          {
            id: '2',
            titulo: 'Gata mestiza en parqueadero',
            nombreMascota: 'Luna',
            especie: 'GATO',
            tipo: 'HALLAZGO',
            estado: 'PUBLICO',
            descripcion: 'Apareció en un parqueadero cubierto.',
            fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Barrio Palermo, Bogotá',
            latitud: 4.6300,
            longitud: -74.0700,
            fechaEvento: '2026-09-05',
            contactoTelefono: '3119876543',
            createdAt: '2026-09-05T08:00:00Z',
          },
        ];
        setReportes(mock);
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, []);

  const seleccionarReporte = (rep: Reporte) => {
    setReporteSeleccionado(rep);
    if (rep.latitud && rep.longitud) {
      setCentroMapa([rep.latitud, rep.longitud]);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-slate-100">
      
      {/* PANEL LATERAL DE REPORTES */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-lg">
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-1">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>🗺️</span>
            <span>Explorador en Vivo</span>
          </h1>
          <p className="text-xs text-slate-500">
            {reportes.length} publicaciones con ubicación registrada
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : reportes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No hay reportes geolocalizados actualmente.
            </p>
          ) : (
            reportes.map((rep) => {
              const esSeleccionado = reporteSeleccionado?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => seleccionarReporte(rep)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    esSeleccionado
                      ? 'bg-[#EEF2FC] border-[#5E7BC4] shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={rep.fotoUrl}
                    alt={rep.titulo}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase text-white ${
                          rep.tipo === 'PERDIDA' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      >
                        {rep.tipo}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 truncate">
                      {rep.nombreMascota || rep.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      📍 {rep.ubicacion}
                    </p>
                    <Link
                      href={`/reportes/${rep.id}`}
                      className="text-[10px] font-bold text-[#5E7BC4] hover:underline mt-1 block"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ÁREA DE MAPA A PANTALLA COMPLETA */}
      <div className="flex-1 h-full relative">
        <MapaGeneralDynamic
          reportes={reportes}
          centroInicial={centroMapa}
          zoomInicial={13}
          onSelectReporte={(rep) => setReporteSeleccionado(rep)}
        />
      </div>

    </div>
  );
}