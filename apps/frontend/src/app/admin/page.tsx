'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapItem } from '../mapa/MapClient'; // O la ruta donde tengas tu tipo MapItem

interface ReporteModeracion extends MapItem {
    estadoModeracion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    fechaReporte: string;
    contacto?: string;
}

export default function AdminModeracionPage() {
    // Listado de reportes de ejemplo que la comunidad ha enviado y están esperando revisión
    const [reportes, setReportes] = useState<ReporteModeracion[]>([
        {
            id: '101',
            name: 'Rocky (Pastor Alemán)',
            category: 'perro',
            status: 'PERDIDO',
            locationName: 'Estadio, Medellín',
            lat: 6.2530,
            lng: -75.5890,
            estadoModeracion: 'PENDIENTE',
            fechaReporte: 'Hoy, 10:30 AM',
            phone: '300 111 2233',
        },
        {
            id: '102',
            name: 'Misi (Gata Calico)',
            category: 'gato',
            status: 'HALLAZGO',
            locationName: 'Robledo, Medellín',
            lat: 6.2700,
            lng: -75.5850,
            estadoModeracion: 'PENDIENTE',
            fechaReporte: 'Ayer, 4:15 PM',
            phone: '310 999 8877',
        },
    ]);

    const [filtroTab, setFiltroTab] = useState<'PENDIENTE' | 'APROBADO'>('PENDIENTE');

    // Función para aprobar un reporte
    const handleAprobar = (id: string) => {
        setReportes((prev) =>
            prev.map((rep) =>
                rep.id === id ? { ...rep, estadoModeracion: 'APROBADO' } : rep
            )
        );
    };

    // Función para rechazar / eliminar un reporte
    const handleRechazar = (id: string) => {
        setReportes((prev) =>
            prev.map((rep) =>
                rep.id === id ? { ...rep, estadoModeracion: 'RECHAZADO' } : rep
            )
        );
    };

    const reportesFiltrados = reportes.filter((r) => r.estadoModeracion === filtroTab);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Cabecera del Panel */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                            Moderación de Contenido 🛡️
                        </span>
                        <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
                            Panel de Aprobación de Reportes
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Revisa las solicitudes enviadas por los ciudadanos antes de que aparezcan en el mapa público.
                        </p>
                    </div>
                    <Link
                        href="/mapa"
                        className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition text-center"
                    >
                        Ver Mapa Público 🗺️
                    </Link>
                </div>

                {/* Pestañas de Filtrado (Pendientes vs Aprobados) */}
                <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setFiltroTab('PENDIENTE')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                            filtroTab === 'PENDIENTE'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        ⏳ Pendientes de Revisión ({reportes.filter(r => r.estadoModeracion === 'PENDIENTE').length})
                    </button>
                    <button
                        onClick={() => setFiltroTab('APROBADO')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                            filtroTab === 'APROBADO'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        ✅ Publicados / Aprobados ({reportes.filter(r => r.estadoModeracion === 'APROBADO').length})
                    </button>
                </div>

                {/* Listado de Reportes */}
                <div className="space-y-4">
                    {reportesFiltrados.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-2">
                            <p className="text-3xl">📭</p>
                            <p className="text-sm font-semibold text-gray-700">No hay reportes en esta sección</p>
                            <p className="text-xs text-gray-400">Todo el contenido pendiente ha sido procesado.</p>
                        </div>
                    ) : (
                        reportesFiltrados.map((reporte) => (
                            <div 
                                key={reporte.id}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-md"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                            reporte.status === 'PERDIDO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {reporte.status}
                                        </span>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-gray-100 text-gray-700">
                                            {reporte.category}
                                        </span>
                                        <span className="text-xs text-gray-400">Enviado: {reporte.fechaReporte}</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-gray-900 text-base">{reporte.name}</h3>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <span>📍</span> {reporte.locationName} (Lat: {reporte.lat}, Lng: {reporte.lng})
                                    </p>
                                    {reporte.phone && (
                                        <p className="text-xs text-indigo-600 font-medium">
                                            📞 Contacto: {reporte.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Botones de Acción de Moderación */}
                                {reporte.estadoModeracion === 'PENDIENTE' ? (
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleRechazar(reporte.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition"
                                        >
                                            ❌ Rechazar
                                        </button>
                                        <button
                                            onClick={() => handleAprobar(reporte.id)}
                                            className="flex-1 md:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                                        >
                                            ✅ Aprobar y Publicar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100">
                                        Publicado en el Mapa ✨
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}