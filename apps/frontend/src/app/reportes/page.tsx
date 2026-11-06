'use client';

import React, { useState, useMemo } from 'react';
import { FiltrosReportes } from './components/FiltrosReportes';
import { TarjetaReporte, MascotaReporte } from './components/TarjetaReportes';
import { ModalDetalleMascota } from './components/ModalDetalleMascota';
import { Sparkles, PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Datos de prueba para el Valle de Aburrá
const REPORTES_MOCK: MascotaReporte[] = [
    {
        id: '1',
        nombre: 'Rocky',
        especie: 'Perro',
        raza: 'Golden Retriever',
        estado: 'perdida',
        esTurbo: true,
        barrio: 'Laureles',
        ciudad: 'Medellín',
        fecha: '04 de Noviembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
        descripcion: 'Se asustó con pólvora cerca a la avenida Nutibara. Lleva collar azul sin placa.',
        edad: '3 años',
        tamano: 'Grande',
        color: 'Dorado',
        recompensa: '$300.000 COP'
    },
    {
        id: '2',
        nombre: 'Michi',
        especie: 'Gato',
        raza: 'Siamés',
        estado: 'encontrada',
        esTurbo: false,
        barrio: 'Niquía',
        ciudad: 'Bello',
        fecha: '03 de Noviembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
        descripcion: 'Encontrado en la estación del Metro Niquía. Es muy manso y resguardado en veterinaria local.',
        edad: '1 año',
        tamano: 'Pequeño',
        color: 'Beige y Marrón'
    },
    {
        id: '3',
        nombre: 'Bruno',
        especie: 'Perro',
        raza: 'Bulldog Francés',
        estado: 'perdida',
        esTurbo: false,
        barrio: 'Zúñiga',
        ciudad: 'Envigado',
        fecha: '02 de Noviembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
        descripcion: 'Requiere medicamento diario para la piel. Mancha negra en su ojo derecho.',
        edad: '4 años',
        tamano: 'Mediano',
        color: 'Blanco y Negro',
        recompensa: '$150.000 COP'
    },
    {
        id: '4',
        nombre: 'Luna',
        especie: 'Gato',
        raza: 'Mestizo',
        estado: 'perdida',
        esTurbo: true,
        barrio: 'Ditaires',
        ciudad: 'Itagüí',
        fecha: '04 de Noviembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600',
        descripcion: 'Gata de ojos verdes claros, muy esquiva con extraños. Se salió por la ventana.',
        edad: '2 años',
        tamano: 'Pequeño',
        color: 'Negro sólido'
    }
];

export default function ReportesPage() {
    const [busqueda, setBusqueda] = useState('');
    const [filtroEspecie, setFiltroEspecie] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMunicipio, setFiltroMunicipio] = useState('todos');

    // Estado para controlar qué mascota está abierta en el Modal de Detalles
    const [mascotaSeleccionada, setMascotaSeleccionada] = useState<MascotaReporte | null>(null);

    // Filtrado reactivo en tiempo real
    const reportesFiltrados = useMemo(() => {
        return REPORTES_MOCK.filter((m) => {
            const coincideBusqueda =
                m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.raza.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.barrio.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.descripcion.toLowerCase().includes(busqueda.toLowerCase());

            const coincideEspecie = filtroEspecie === 'todas' || m.especie === filtroEspecie;
            const coincideEstado = filtroEstado === 'todos' || m.estado === filtroEstado;
            const coincideMunicipio = filtroMunicipio === 'todos' || m.ciudad === filtroMunicipio;

            return coincideBusqueda && coincideEspecie && coincideEstado && coincideMunicipio;
        });
    }, [busqueda, filtroEspecie, filtroEstado, filtroMunicipio]);

    const handleResetFiltros = () => {
        setBusqueda('');
        setFiltroEspecie('todas');
        setFiltroEstado('todos');
        setFiltroMunicipio('todos');
    };

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Encabezado y botón para publicar reporte */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                            Feed de Mascota Perdidas y Encontradas
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                            Reportes en la Comunidad
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Explora las alertas activas en Medellín y el Valle de Aburrá.
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
                    totalResultados={reportesFiltrados.length}
                    onReset={handleResetFiltros}
                />

                {/* Listado / Grid de Tarjetas */}
                {reportesFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {reportesFiltrados.map((mascota) => (
                            <TarjetaReporte
                                key={mascota.id}
                                mascota={mascota}
                                onClick={() => setMascotaSeleccionada(mascota)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
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

                {/* Modal Interactivo de Información Ampliada */}
                <ModalDetalleMascota
                    mascota={mascotaSeleccionada}
                    onClose={() => setMascotaSeleccionada(null)}
                />

            </div>
        </main>
    );
}