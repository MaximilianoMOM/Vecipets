import React from 'react';

export default function HeaderAliados() {
    return (
        <div className="text-center space-y-3 mb-8">
            {/* Badge Superior */}
            <span className="inline-block bg-amber-100 text-amber-600 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full uppercase border border-amber-200 shadow-sm">
                DIRECTORIO ALIADO
            </span>

            {/* Título Principal */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Refugios y Clínicas Veterinarias
            </h1>

            {/* Subtítulo */}
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
                Encuentra centros de atención médica, albergues de paso y aliados comunitarios en tu zona.
            </p>
        </div>
    );
}