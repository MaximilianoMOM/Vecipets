import React from 'react';

interface BuscadorFiltrosProps {
    busqueda: string;
    setBusqueda: (val: string) => void;
    categoriaActiva: string;
    setCategoriaActiva: (cat: string) => void;
}

const CATEGORIAS = [
    { id: 'TODOS', label: 'TODOS' },
    { id: 'REFUGIO', label: 'REFUGIO' },
    { id: 'VETERINARIA', label: 'VETERINARIA' },
    { id: 'CLINICA', label: 'CLINICA' },
];

export default function BuscadorFiltros({
    busqueda,
    setBusqueda,
    categoriaActiva,
    setCategoriaActiva,
}: BuscadorFiltrosProps) {
    return (
        <div className="bg-white rounded-3xl p-3 md:p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-10 max-w-5xl mx-auto">

            {/* Input de Búsqueda */}
            <div className="relative w-full md:flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    🔍
                </div>
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre de refugio, clínica o dirección..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>

            {/* Botones Filtro de Categorías */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                {CATEGORIAS.map((cat) => {
                    const isActive = categoriaActiva === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setCategoriaActiva(cat.id)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase transition-all whitespace-nowrap ${isActive
                                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80'
                                }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

        </div>
    );
}