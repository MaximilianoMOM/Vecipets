'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import AccountLayout, { accountCard, accountSecondary } from '../components/common/AccountLayout';
import UsuariosAdmin from './UsuariosAdmin';
import { MapItem } from '../mapa/MapClient'; // O la ruta donde tengas tu tipo MapItem

interface ReporteModeracion extends MapItem {
    estadoModeracion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    fechaReporte: string;
    contacto?: string;
}

export default function AdminPage() {
    const { user, loading } = useAuth();

    return (
        <AccountLayout title={<span className="text-indigo-600">Administración</span>} description="Gestiona el acceso de las cuentas de VeciPets.">
            {loading ? (
                <p role="status" className={accountCard}>Cargando el panel…</p>
            ) : user?.rol === 'ADMINISTRADOR' ? (
                <>
                    <UsuariosAdmin />
                    <AdminModeracionPage />
                </>
            ) : (
                <section className={accountCard}>
                    <p>{user ? 'Esta página requiere permisos de administrador.' : 'Inicia sesión para acceder al panel.'}</p>
                    {!user && <Link href="/login" className="mt-3 inline-block font-bold text-indigo-700 hover:underline">Iniciar sesión</Link>}
                </section>
            )}
        </AccountLayout>
    );
}

function AdminModeracionPage() {
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
        <section aria-label="Demostración de moderación de reportes">
            <div className="space-y-6">
                
                {/* Cabecera del Panel */}
                <div className={`${accountCard} flex flex-col justify-between gap-4 md:flex-row md:items-center`}>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            Demostración de moderación de reportes
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Practica con reportes de ejemplo. Los cambios solo se muestran en esta pantalla.
                        </p>
                    </div>
                    <Link
                        href="/mapa"
                        className={accountSecondary}
                    >
                        Ver mapa público
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
        </section>
    );
}
