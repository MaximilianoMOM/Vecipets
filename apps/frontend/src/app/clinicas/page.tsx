'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import HeaderAliados from './components/HeaderAliados';
import BuscadorFiltros from './components/BuscadorFiltros';
import TarjetaAliado, { Aliado } from './components/TarjetaAliado';
import ModalDetalleAliado from './components/ModalDetalleAliado';

export default function DirectoriodeAliadosPage() {
    const [aliados, setAliados] = useState<Aliado[]>([]);
    const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('TODOS');
    const [aliadoSeleccionado, setAliadoSeleccionado] = useState<Aliado | null>(null);

    useEffect(() => {
        const abort = new AbortController();
        apiClient.get<Aliado[]>('/sedes', { signal: abort.signal })
            .then(({ data }) => {
                if (abort.signal.aborted) return;
                setAliados(data);
                setEstado('listo');
            })
            .catch(() => { if (!abort.signal.aborted) setEstado('error'); });
        return () => abort.abort();
    }, []);

    const aliadosFiltrados = aliados.filter((item) => {
        const coincideCategoria =
            categoriaActiva === 'TODOS' || item.tipo === categoriaActiva;
        const coincideBusqueda =
            item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.direccion.toLowerCase().includes(busqueda.toLowerCase());

        return coincideCategoria && coincideBusqueda;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <HeaderAliados />

                <BuscadorFiltros
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    categoriaActiva={categoriaActiva}
                    setCategoriaActiva={setCategoriaActiva}
                />

                {estado === 'cargando' ? (
                    <p role="status" className="text-slate-600">Cargando el directorio…</p>
                ) : estado === 'error' ? (
                    <p role="alert" className="text-rose-700">No se pudo cargar el directorio. Intenta recargar la página.</p>
                ) : aliadosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {aliadosFiltrados.map((aliado) => (
                            <TarjetaAliado
                                key={aliado.id}
                                aliado={aliado}
                                onClick={() => setAliadoSeleccionado(aliado)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                        <p className="text-slate-400 font-medium">
                            No se encontraron refugios o clínicas con los criterios de búsqueda.
                        </p>
                    </div>
                )}

                <ModalDetalleAliado
                    aliado={aliadoSeleccionado}
                    alCerrar={() => setAliadoSeleccionado(null)}
                />

            </div>
        </div>
    );
}
