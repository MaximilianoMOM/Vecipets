'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useReportesMapa } from '@/lib/use-reportes-mapa';

// Importación dinámica del mapa interactivo para evitar errores de SSR con Leaflet en Next.js
const MapClient = dynamic(() => import('../../mapa/MapClient'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-3xl">
            <p className="text-gray-500 font-medium animate-pulse">Cargando mapa interactivo...</p>
        </div>
    ),
});

export default function MapaSeccion() {
    const { items, estado } = useReportesMapa(12);
    return (
        <section id="mapa" className="py-20 px-4 bg-white w-full border-t border-gray-100">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Encabezado del apartado */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-primary uppercase bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                            Geolocalización en VIVO
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
                            Explora el mapa de reportes comunitarios
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base mt-2 max-w-xl">
                            Consulta los reportes públicos recientes y abre cada ficha desde el mapa.
                        </p>
                    </div>

                    {/* Botón de acción principal */}
                    <div>
                        <Link
                            href="/mapa"
                            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition shadow-lg flex items-center gap-2"
                        >
                            <span>🗺️</span> Abrir Mapa a Pantalla Completa
                        </Link>
                    </div>
                </div>

                {/* Contenedor Visual del Mapa Real Integrado */}
                <div className="relative w-full h-[450px] rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100">
                    <MapClient items={items} selectedItem={null} scrollWheelZoom={false} />
                    {estado !== 'listo' || items.length === 0 ? (
                        <p role="status" className="absolute bottom-7 left-3 z-10 max-w-[85%] rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow">
                            {estado === 'cargando' ? 'Cargando reportes…' : estado === 'error'
                                ? 'No se pudieron cargar los reportes del mapa.' : 'Aún no hay reportes públicos con ubicación.'}
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
