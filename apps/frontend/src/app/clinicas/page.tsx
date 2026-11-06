'use client';

import React, { useState } from 'react';
import HeaderAliados from './components/HeaderAliados';
import BuscadorFiltros from './components/BuscadorFiltros';
import TarjetaAliado, { Aliado } from './components/TarjetaAliado';
import ModalDetalleAliado from './components/ModalDetalleAliado';

const ALIADOS_MOCK: Aliado[] = [
    {
        id: '1',
        nombre: 'Refugio Huellitas de Amor',
        tipo: 'REFUGIO',
        direccion: 'Av. Las Palmas #45-12, Bogotá',
        horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
        servicios: ['Adopciones', 'Rescate', 'Hogar de paso'],
        telefono: '+57 312 456 7890',
        imagenUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: '2',
        nombre: 'Clinica Veterinaria San Francisco 24h',
        tipo: 'VETERINARIA',
        direccion: 'Calle 100 #19-60, Bogotá',
        horario: 'Urgencias 24 Horas',
        servicios: ['Urgencias 24h', 'Cirugía', 'Ecografía', 'Hospitalización'],
        telefono: '+57 300 987 6543',
        imagenUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: '3',
        nombre: 'Centro Veterinario Comunitario San Rafael',
        tipo: 'CLINICA',
        direccion: 'Cra 15 #72-30, Medellín',
        horario: 'Lunes a Viernes: 7:00 AM - 7:00 PM',
        servicios: ['Esterilización', 'Vacunación', 'Microchip de identificación'],
        telefono: '+57 315 222 3344',
        imagenUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop',
    },
];

export default function DirectoriodeAliadosPage() {
    const [aliados, setAliados] = useState<Aliado[]>(ALIADOS_MOCK);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('TODOS');
    const [aliadoSeleccionado, setAliadoSeleccionado] = useState<Aliado | null>(null);

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

                {aliadosFiltrados.length > 0 ? (
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