'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Importación dinámica del mapa interactivo para evitar errores de SSR con Leaflet en Next.js
const MapClient = dynamic(() => import('./MapaInteractivo'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-3xl">
            <p className="text-gray-500 font-medium animate-pulse">Cargando mapa interactivo...</p>
        </div>
    ),
});

export default function MapaSeccion() {
    return (
        <section id="mapa" className="py-20 px-4 bg-white w-full border-t border-gray-100">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Encabezado del apartado */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
                            Geolocalización en VIVO
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
                            Explora el mapa de reportes comunitarios
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base mt-2 max-w-xl">
                            Visualiza en tiempo real los avistamientos y reportes activos cerca de tu ubicación o barrio.
                        </p>
                    </div>

                    {/* Botón de acción principal */}
                    <div>
                        <Link
                            href="/mapa"
                            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                        >
                            <span>🗺️</span> Abrir Mapa a Pantalla Completa
                        </Link>
                    </div>
                </div>

                {/* Contenedor Visual del Mapa Real Integrado */}
                <div className="relative w-full h-[450px] rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100">
                    <MapClient />
                </div>
            </div>
        </section>
    );
}