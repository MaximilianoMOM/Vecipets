'use client';

import { useState } from 'react';

const publicacionesMock = [
    {
        id: 1,
        nombre: 'Bruno',
        especie: 'perro',
        estado: 'PERDIDO',
        ubicacion: 'Parque Virrey, Bogotá',
        imagen: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
    {
        id: 2,
        nombre: 'Luna',
        especie: 'gato',
        estado: 'HALLAZGO',
        ubicacion: 'Barrio Palermo, Bogotá',
        imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
        id: 3,
        nombre: 'Max',
        especie: 'perro',
        estado: 'PERDIDO',
        ubicacion: 'Usaquén, Bogotá',
        imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
];

export default function MapaExploradorPage() {
    const [filtroEspecie, setFiltroEspecie] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const publicacionesFiltradas = publicacionesMock.filter((pub) => {
        const coincideEspecie = filtroEspecie === 'todos' || pub.especie === filtroEspecie;
        const coincideEstado = filtroEstado === 'todos' || pub.estado === filtroEstado;
        return coincideEspecie && coincideEstado;
    });

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col">

            {/* Contenedor principal de la vista de mapa */}
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* =================================================== */}
                {/* PANEL IZQUIERDO: Filtros y Tarjetas (4 Columnas)    */}
                {/* =================================================== */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex flex-col space-y-4">

                    {/* Título y contador */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">🗺️</span>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Explorador en Vivo</h1>
                        </div>
                        <p className="text-xs text-gray-500">
                            {publicacionesFiltradas.length} publicaciones con ubicación registrada
                        </p>
                    </div>

                    {/* Filtros avanzados */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">

                        {/* Especie */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
                            <button
                                onClick={() => setFiltroEspecie('todos')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${filtroEspecie === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🐾 Todos
                            </button>
                            <button
                                onClick={() => setFiltroEspecie('perro')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${filtroEspecie === 'perro' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🐶 Perros
                            </button>
                            <button
                                onClick={() => setFiltroEspecie('gato')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${filtroEspecie === 'gato' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🐱 Gatos
                            </button>
                        </div>

                        {/* Estado */}
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="todos">Filtrar por estado (Todos)</option>
                            <option value="PERDIDO">🚨 Solo Perdidos</option>
                            <option value="HALLAZGO">🐾 Solo Hallazgos</option>
                        </select>
                    </div>

                    {/* Listado de Tarjetas (Con scroll vertical si hay muchas mascotas) */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {publicacionesFiltradas.length > 0 ? (
                            publicacionesFiltradas.map((pub) => (
                                <div
                                    key={pub.id}
                                    className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition flex items-center gap-3 cursor-pointer group"
                                >
                                    <img
                                        src={pub.imagen}
                                        alt={pub.nombre}
                                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{pub.nombre}</h4>
                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pub.badgeColor}`}>
                                                {pub.estado}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <span>📍</span> {pub.ubicacion}
                                        </p>
                                        <span className="text-[11px] font-semibold text-indigo-600 group-hover:underline mt-1 inline-block">
                                            Ver detalle →
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                No hay publicaciones que coincidan con los filtros.
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-800 text-center">
                        <span className="font-bold">[Módulo Maxi]:</span> Sincronizado con marcadores del mapa.
                    </div>

                </div>

                {/* =================================================== */}
                {/* PANEL DERECHO: El Mapa Interactivo(Maxi)      */}
                {/* =================================================== */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative w-full h-[600px] lg:h-[calc(100vh-140px)] flex flex-col">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-100 to-indigo-50/30">
                        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-200 max-w-md space-y-3">
                            <span className="text-4xl">🗺️</span>
                            <h3 className="font-bold text-gray-900 text-base">Mapa Interactivo en Tiempo Real</h3>
                            <p className="text-xs text-gray-500">
                                Aquí se conectará la librería de mapas (Leaflet / OpenStreetMap) para mostrar los pines de las mascotas filtradas a la izquierda.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}