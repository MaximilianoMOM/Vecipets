'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Users } from 'lucide-react';

export default function SeccionFinalAyuda() {
    return (
        <section className="relative w-full bg-gradient-to-br from-indigo-50 via-sky-50 to-slate-100 py-16 md:py-24 px-4 md:px-8 border-t border-slate-200">
            <div className="max-w-4xl mx-auto text-center space-y-6">

                {/* Icono superior flotante */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 text-2xl mx-auto">
                    🐾
                </div>

                {/* Título Principal */}
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    ¿Encontraste a una mascota sin su dueño <br className="hidden sm:inline" />
                    o necesitas ayuda?
                </h2>

                {/* Descripción */}
                <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
                    No estás solo. Toda la comunidad de VeciPets está lista para ayudarte a difundir la información de manera inmediata.
                </p>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">

                    {/* Botón 1: Publicar Reporte */}
                    <Link
                        href="/reportar"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5 text-slate-900" />
                        <span>Publicar Reporte Ahora ✨</span>
                    </Link>


                    <Link
                        href="/registro"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-sm rounded-2xl border border-indigo-200 shadow-sm hover:shadow transition-all transform active:scale-95"
                    >
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span>Unirme 🤝</span>
                    </Link>

                </div>

            </div>
        </section>
    );
}