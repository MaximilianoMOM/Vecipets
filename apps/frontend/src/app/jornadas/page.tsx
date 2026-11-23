'use client';

import React, { useState } from 'react';
import { Syringe, Ticket, Filter, HeartHandshake, User } from 'lucide-react';
import TarjetaCampana from './components/TarjetaCampana';
import ModalAuthRequerida from './components/ModalAuthRequerida';
import ListaMisReservas from './components/ListaMisReservas';
import ModalReservaFlujo from './components/ModalReservaFlujo';

const CAMPAÑAS_INICIALES = [
    {
        id: 1,
        titulo: 'Jornada Masiva de Esterilización Canina y Felina',
        veterinaria: 'Clínica Veterinaria San Francisco',
        comuna: 'Laureles / San Javier',
        direccion: 'Calle 44 #70-12, Medellín',
        fecha: 'Sábado, 25 de Octubre',
        hora: '8:00 AM - 2:00 PM',
        precioComunitaria: '$45.000 COP',
        comisionReserva: '$5.000 COP',
        cuposDisponibles: 8,
        destacado: true,
        imagenUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 2,
        titulo: 'Brigada de Vacunación Antirrábica y Desparasitación',
        veterinaria: 'Fundación Huellitas de Amor',
        comuna: 'Aranjuez',
        direccion: 'Carrera 49 #92-10, Medellín',
        fecha: 'Domingo, 26 de Octubre',
        hora: '9:00 AM - 1:00 PM',
        precioComunitaria: '¡Gratuita / Aporte voluntario!',
        comisionReserva: '$2.000 COP',
        cuposDisponibles: 15,
        destacado: false,
        imagenUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800',
    },
];

export default function PaginaJornadas() {
    const [estaAutenticado, setEstaAutenticado] = useState<boolean>(false);
    const [mostrarModalAuth, setMostrarModalAuth] = useState<boolean>(false);
    const [campañaSeleccionada, setCampañaSeleccionada] = useState<any | null>(null);
    const [pestañaActiva, setPestañaActiva] = useState<'campañas' | 'mis-reservas'>('campañas');
    const [misReservas, setMisReservas] = useState<any[]>([]);

    const intentarApartarCupo = (campaña: any) => {
        if (!estaAutenticado) {
            setMostrarModalAuth(true);
            return;
        }
        setCampañaSeleccionada(campaña);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* BARRA SIMULADORA DE SESIÓN */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>Estado de sesión (Simulador): <strong>{estaAutenticado ? 'Usuario Autenticado' : 'Visitante Anónimo'}</strong></span>
                    </div>
                    <button
                        onClick={() => setEstaAutenticado(!estaAutenticado)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-lg transition-colors"
                    >
                        {estaAutenticado ? 'Simular Cerrar Sesión' : 'Simular Iniciar Sesión'}
                    </button>
                </div>

                {/* ENCABEZADO */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 text-white shadow-xl">
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 backdrop-blur-md">
                        <HeartHandshake className="w-3.5 h-3.5" /> Alianza Veterinaria B2B
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">Jornadas de Salud y Esterilización</h1>
                    <p className="text-blue-100 text-sm">Accede a campañas a precios comunitarios en Medellín. Reserva tu cupo fácilmente en tu comuna.</p>
                </div>

                {/* PESTAÑAS */}
                <div className="flex border-b border-slate-200 justify-between items-center pb-2">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setPestañaActiva('campañas')}
                            className={`pb-2 text-sm font-bold border-b-2 flex items-center gap-2 ${pestañaActiva === 'campañas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                                }`}
                        >
                            <Syringe className="w-4 h-4" /> Campañas Activas
                        </button>

                        <button
                            onClick={() => {
                                if (!estaAutenticado) setMostrarModalAuth(true);
                                else setPestañaActiva('mis-reservas');
                            }}
                            className={`pb-2 text-sm font-bold border-b-2 flex items-center gap-2 ${pestañaActiva === 'mis-reservas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                                }`}
                        >
                            <Ticket className="w-4 h-4" /> Mis Reservas ({misReservas.length})
                        </button>
                    </div>
                </div>

                {/* VISTAS */}
                {pestañaActiva === 'campañas' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CAMPAÑAS_INICIALES.map((campaña) => (
                            <TarjetaCampana key={campaña.id} campana={campaña} onApartarCupo={intentarApartarCupo} />
                        ))}
                    </div>
                ) : (
                    <ListaMisReservas reservas={misReservas} />
                )}

                {/* MODALES */}
                {mostrarModalAuth && (
                    <ModalAuthRequerida
                        onClose={() => setMostrarModalAuth(false)}
                        onSimularLogin={() => {
                            setEstaAutenticado(true);
                            setMostrarModalAuth(false);
                        }}
                    />
                )}

                {campañaSeleccionada && (
                    <ModalReservaFlujo
                        campaña={campañaSeleccionada}
                        onClose={() => setCampañaSeleccionada(null)}
                        onConfirmarReserva={(nuevaReserva) => setMisReservas([nuevaReserva, ...misReservas])}
                    />
                )}

            </div>
        </div>
    );
}