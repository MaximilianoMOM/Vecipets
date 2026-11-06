'use client';

import { useState } from 'react';

const pasos = [
    {
        id: '01',
        titulo: 'Reporta en Segundos',
        descripcion: 'Crea un anuncio con fotos, características distintivas y selecciona la ubicación exacta en el mapa interactivo.',
        icono: '📝',
    },
    {
        id: '02',
        titulo: 'Difusión Comunitaria',
        descripcion: 'La plataforma notifica automáticamente a vecinos, refugios y veterinarias cercanas en un radio de acción rápido.',
        icono: '📡',
    },
    {
        id: '03',
        titulo: 'Reunifica la Familia',
        descripcion: 'Ponte en contacto seguro a través de los datos de enlace directos y celebra la pronta reunificación de tu mascota.',
        icono: '❤️',
    },
];

export default function ComoFunciona() {
    const [hoveredStep, setHoveredStep] = useState<string | null>('01'); // Inicia con el primer paso seleccionado por defecto

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white w-full">
            <div className="max-w-6xl mx-auto text-center space-y-12">

                {/* Encabezado */}
                <div className="space-y-3">
                    <span className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50/80 px-3.5 py-1.5 rounded-full border border-indigo-100">
                        Proceso sencillo y efectivo
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        ¿Cómo funciona VeciPets?
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Tres pasos clave para movilizar a la comunidad y maximizar las posibilidades de reencuentro.
                    </p>
                </div>

                {/* Tarjetas interactivas con diseño exacto y animación al hacer hover */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {pasos.map((paso) => {
                        const isActive = hoveredStep === paso.id;

                        return (
                            <div
                                key={paso.id}
                                onMouseEnter={() => setHoveredStep(paso.id)}
                                className={`relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between bg-white ${isActive
                                        ? 'border-indigo-500 shadow-2xl -translate-y-2 ring-4 ring-indigo-500/10'
                                        : 'border-gray-100 shadow-lg shadow-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div>
                                    {/* Fila superior: Icono y Número Gigante Animado */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {paso.icono}
                                        </div>

                                        <span className={`text-4xl font-black tracking-tighter transition-colors duration-300 select-none ${isActive ? 'text-indigo-600/80' : 'text-gray-200'
                                            }`}>
                                            {paso.id}
                                        </span>
                                    </div>

                                    {/* Título de la tarjeta */}
                                    <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${isActive ? 'text-indigo-950' : 'text-gray-900'
                                        }`}>
                                        {paso.titulo}
                                    </h3>

                                    {/* Descripción */}
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {paso.descripcion}
                                    </p>
                                </div>

                                {/* Pie de tarjeta con enlace interactivo animado */}
                                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className={`text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-400'
                                        }`}>
                                        Paso indispensable
                                    </span>
                                    <span className={`text-xs font-bold transition-transform duration-300 ${isActive ? 'text-indigo-600 translate-x-1' : 'text-gray-300'
                                        }`}>
                                        →
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}