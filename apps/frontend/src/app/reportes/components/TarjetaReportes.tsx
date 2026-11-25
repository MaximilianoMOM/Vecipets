'use client';

import React from 'react';
import { MapPin, Calendar, AlertTriangle, Eye } from 'lucide-react';

export function obtenerUrlImagen(url?: string | null): string {
    if (!url) return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface MascotaReporte {
    id: string | number;
    nombre: string;
    especie: 'Perro' | 'Gato' | 'Otro' | string;
    raza?: string | null;
    estado: 'perdida' | 'encontrada' | 'PERDIDA' | 'HALLAZGO' | string;
    tipo?: 'PERDIDA' | 'HALLAZGO';
    esTurbo?: boolean;
    barrio?: string;
    barrioSector?: string;
    ciudad?: string;
    fecha?: string;
    fechaEvento?: string;
    imagen?: string;
    imagenUrl?: string;
    descripcion: string;
    edad?: string;
    tamano?: string;
    color?: string;
    senasParticulares?: string;
    recompensa?: string;
    usuario?: { id: number; nombre: string };
    latitud?: string | null;
    longitud?: string | null;
    direccion?: string | null;
    referencia?: string | null;
}

interface TarjetaReporteProps {
    mascota: MascotaReporte;
    onVerReporte: () => void;
}

export function TarjetaReporte({ mascota, onVerReporte }: TarjetaReporteProps) {
    const estadoNormalizado = (mascota.tipo || mascota.estado || '').toUpperCase();
    const esPerdida = estadoNormalizado === 'PERDIDA';
    const imagenSrc = obtenerUrlImagen(mascota.imagen || mascota.imagenUrl);
    const barrioTexto = mascota.barrioSector || mascota.barrio || 'Medellín';
    const fechaTexto = mascota.fechaEvento || mascota.fecha || 'Reciente';

    return (
        <div
            onClick={onVerReporte}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-slate-200/80 shadow-sm hover:border-slate-300"
        >
            {/* Contenedor Imagen */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                    src={imagenSrc}
                    alt={mascota.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Insignia Estado */}
                <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${esPerdida
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                >
                    {esPerdida ? (
                        <>
                            <AlertTriangle className="w-3.5 h-3.5" /> PERDIDA
                        </>
                    ) : (
                        'ENCONTRADA'
                    )}
                </span>

                {/* Overlay hover indicando clic */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                        <Eye className="w-3.5 h-3.5" /> Ver detalles
                    </span>
                </div>
            </div>

            {/* Contenido Información Básica */}
            <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                            {mascota.nombre}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                            {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ''}
                        </p>
                    </div>
                    {mascota.recompensa && (
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            💰 Recompensa
                        </span>
                    )}
                </div>

                {/* Ubicación y Fecha */}
                <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {barrioTexto}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Visto: {fechaTexto}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                    {mascota.descripcion}
                </p>
            </div>
        </div>
    );
}
