'use client';

import Link from 'next/link';

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

                {/* Contenedor Visual del Mapa (Espacio reservado para Maxi) */}
                <div className="relative w-full h-[450px] rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                    {/* ========================================================================= */}
                    {/* COMENTARIO PARA MAXI:                                                     */}
                    {/* Aquí debes integrar la librería definitiva del mapa (ej. Leaflet / Maps)  */}
                    {/* conectada con el endpoint del backend para renderizar los marcadores de    */}
                    {/* mascotas perdidas y zonas de calor en tiempo real.                         */}
                    {/* ========================================================================= */}

                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 via-transparent to-amber-500/10 pointer-events-none" />

                    <div className="z-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-md border border-gray-200 max-w-md">
                        <span className="text-2xl">📍</span>
                        <h4 className="font-bold text-gray-800 text-base mt-1">Módulo de Mapa Interactivo</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            [Espacio reservado para Maxi]: Aquí se renderizará el mapa de Leaflet/OpenStreetMap con las alertas activas de la comunidad.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
