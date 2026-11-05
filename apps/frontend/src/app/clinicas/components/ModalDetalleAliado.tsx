'use client';

import React from 'react';
import { Aliado } from './TarjetaAliado';

interface ModalDetalleAliadoProps {
    aliado: Aliado | null;
    alCerrar: () => void;
}

interface AliadoDetalle extends Aliado {
    descripcion: string;
    calificacion: number;
    totalResenas: number;
    resenas: {
        id: string;
        usuario: string;
        comentario: string;
        estrellas: number;
        fecha: string;
    }[];
}

export default function ModalDetalleAliado({ aliado, alCerrar }: ModalDetalleAliadoProps) {
    if (!aliado) return null;

    const aliadoExtendido: AliadoDetalle = {
        ...aliado,
        descripcion: 'Centro especializado en el cuidado, rescate y bienestar animal. Contamos con profesionales altamente calificados y espacios aptos para brindar la mejor atención médica y albergue temporal.',
        calificacion: 4.8,
        totalResenas: 24,
        resenas: [
            {
                id: '1',
                usuario: 'Camila Andrés',
                comentario: 'Excelente atención con mi perrito en urgencias. Muy recomendado y el personal es súper amable.',
                estrellas: 5,
                fecha: 'Hace 2 días',
            },
            {
                id: '2',
                usuario: 'Felipe Gomez',
                comentario: 'Muy buen refugio, se nota el amor y la dedicación con la que cuidan a los peluditos.',
                estrellas: 5,
                fecha: 'Hace 1 semana',
            },
        ],
    };

    return (
        /* Contenedor del fondo oscuro: al hacer clic aquí se cierra el modal */
        <div
            onClick={alCerrar}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
            {/* Tarjeta del modal: e.stopPropagation() evita que se cierre si hacen clic adentro */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-8 animate-in zoom-in-95 duration-200"
            >

                {/* Botón Cerrar */}
                <button
                    onClick={alCerrar}
                    className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-slate-600 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer"
                >
                    ✕
                </button>

                {/* Imagen Superior */}
                <div className="relative h-64 w-full bg-slate-100">
                    <img
                        src={aliadoExtendido.imagenUrl}
                        alt={aliadoExtendido.nombre}
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-4 left-6 bg-slate-900/70 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                        {aliadoExtendido.tipo}
                    </span>
                </div>

                {/* Contenido Detallado */}
                <div className="p-6 sm:p-8 space-y-6">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                {aliadoExtendido.nombre}
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                📍 {aliadoExtendido.direccion}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl self-start sm:self-auto">
                            <span className="text-amber-500 font-bold">⭐ {aliadoExtendido.calificacion}</span>
                            <span className="text-xs text-slate-400">({aliadoExtendido.totalResenas} reseñas)</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sobre el centro</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {aliadoExtendido.descripcion}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Horarios</span>
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                🕒 {aliadoExtendido.horario}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono de Contacto</span>
                            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                                📞 {aliadoExtendido.telefono}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Servicios y Especialidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {aliadoExtendido.servicios.map((serv, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-xl border border-indigo-100">
                                    ✓ {serv}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Reseñas de la comunidad</h3>
                        <div className="space-y-3">
                            {aliadoExtendido.resenas.map((res) => (
                                <div key={res.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">{res.usuario}</span>
                                        <span className="text-[10px] text-slate-400">{res.fecha}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{res.comentario}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={alCerrar}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-2xl text-xs transition-colors cursor-pointer"
                        >
                            Cerrar Detalle
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}