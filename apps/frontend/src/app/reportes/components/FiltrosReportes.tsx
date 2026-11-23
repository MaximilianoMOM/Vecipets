'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface FiltrosProps {
    busqueda: string;
    setBusqueda: (val: string) => void;
    filtroEspecie: string;
    setFiltroEspecie: (val: string) => void;
    filtroEstado: string;
    setFiltroEstado: (val: string) => void;
    filtroMunicipio: string;
    setFiltroMunicipio: (val: string) => void;
    totalResultados: number;
    onReset: () => void;
}

export function FiltrosReportes({
    busqueda,
    setBusqueda,
    filtroEspecie,
    setFiltroEspecie,
    filtroEstado,
    setFiltroEstado,
    filtroMunicipio,
    setFiltroMunicipio,
    totalResultados,
    onReset,
}: FiltrosProps) {
    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 mb-6 space-y-4">
            {/* Buscador de texto */}
            <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, raza, barrio o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Selectores de filtro en grid  */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Filtro por Tipo / Estado */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Estado</label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="perdida">Mascotas Perdidas</option>
                        <option value="encontrada">Mascotas Encontradas</option>
                    </select>
                </div>

                {/* Filtro por Especie */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Especie</label>
                    <select
                        value={filtroEspecie}
                        onChange={(e) => setFiltroEspecie(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="todas">Todas las especies</option>
                        <option value="Perro">Perros</option>
                        <option value="Gato">Gatos</option>
                        <option value="Otro">Otros</option>
                    </select>
                </div>

                {/* Filtro por Municipio */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ciudad / Municipio</label>
                    <select
                        value={filtroMunicipio}
                        onChange={(e) => setFiltroMunicipio(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="todos">Todos los municipios</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Bello">Bello</option>
                        <option value="Envigado">Envigado</option>
                        <option value="Itagüí">Itagüí</option>
                        <option value="Sabaneta">Sabaneta</option>
                    </select>
                </div>
            </div>

            {/* Pie de Filtros: Contador y Limpieza */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">
                    Mostrando <strong className="text-emerald-600">{totalResultados}</strong> reporte(s)
                </span>
                <button
                    onClick={onReset}
                    className="flex items-center gap-1 font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Limpiar filtros
                </button>
            </div>
        </div>
    );
}