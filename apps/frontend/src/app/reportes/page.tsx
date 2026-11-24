'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiltrosReportes } from './components/FiltrosReportes';
import { TarjetaReporte, MascotaReporte } from './components/TarjetaReportes';

import { Sparkles, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function ReportesPage() {
    const [reportes, setReportes] = useState<MascotaReporte[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [busqueda, setBusqueda] = useState('');
    const [filtroEspecie, setFiltroEspecie] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMunicipio, setFiltroMunicipio] = useState('todos');

    const router = useRouter();

    const cargarReportes = useCallback(async () => {
        setCargando(true);
        setError(null);

        try {
            const params: Record<string, string | number> = {
                limite: 60,
                pagina: 1,
            };

            if (busqueda.trim()) {
                params.busqueda = busqueda.trim();
            }

            if (filtroEspecie && filtroEspecie !== 'todas') {
                params.especie = filtroEspecie;
            }

            if (filtroEstado && filtroEstado !== 'todos') {
                params.tipo = filtroEstado === 'perdida' ? 'PERDIDA' : 'HALLAZGO';
            }

            if (filtroMunicipio && filtroMunicipio !== 'todos') {
                params.barrioSector = filtroMunicipio;
            }

            const respuesta = await apiClient.get('/reportes', { params });
            const datos = respuesta.data?.datos ?? [];

            setReportes(datos);
        } catch (err: any) {
            console.error('Error cargando reportes:', err);
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los reportes en este momento.'
            );
        } finally {
            setCargando(false);
        }
    }, [busqueda, filtroEspecie, filtroEstado, filtroMunicipio, router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void cargarReportes();
        }, 300);

        return () => clearTimeout(timer);
    }, [cargarReportes]);

    const handleResetFiltros = () => {
        setBusqueda('');
        setFiltroEspecie('todas');
        setFiltroEstado('todos');
        setFiltroMunicipio('todos');
    };

    const handleVerReporte = (id: string | number) => {
        router.push(`/reportes/${id}`);
    };

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Encabezado y botón para publicar reporte */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                            Feed en Vivo • Mascotas Perdidas y Encontradas
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                            Reportes en la Comunidad
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Explora las alertas activas con ubicación confirmada en Medellín y el Valle de Aburrá.
                        </p>
                    </div>

                    <Link
                        href="/reportar"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all shrink-0"
                    >
                        <PlusCircle className="w-4 h-4" /> Reportar Mascota
                    </Link>
                </div>

                {/* Módulo de Filtros */}
                <FiltrosReportes
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    filtroEspecie={filtroEspecie}
                    setFiltroEspecie={setFiltroEspecie}
                    filtroEstado={filtroEstado}
                    setFiltroEstado={setFiltroEstado}
                    filtroMunicipio={filtroMunicipio}
                    setFiltroMunicipio={setFiltroMunicipio}
                    totalResultados={reportes.length}
                    onReset={handleResetFiltros}
                />

                {/* Estado de Carga */}
                {cargando && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                        <p className="text-xs font-semibold text-slate-500">Cargando reportes comunitarios...</p>
                    </div>
                )}

                {/* Error */}
                {!cargando && error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                {/* Listado / Grid de Tarjetas */}
                {!cargando && !error && reportes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {reportes.map((mascota) => (
                            <TarjetaReporte
                                key={mascota.id}
                                mascota={mascota}
                                onVerReporte={() => handleVerReporte(mascota.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Lista vacía */}
                {!cargando && !error && reportes.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-sm">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-700">No se encontraron mascotas con esos criterios</h3>
                        <p className="text-xs text-slate-400">Prueba cambiando las palabras clave o limpiando los filtros de búsqueda.</p>
                        <button
                            onClick={handleResetFiltros}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                            Restablecer todos los filtros
                        </button>
                    </div>
                )}



            </div>
        </main>
    );
}
