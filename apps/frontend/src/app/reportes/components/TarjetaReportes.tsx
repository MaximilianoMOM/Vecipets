'use client';

import React from 'react';
import { MapPin, Calendar, Zap, AlertTriangle, Eye } from 'lucide-react';

export interface MascotaReporte {
    id: string;
    nombre: string;
    especie: 'Perro' | 'Gato' | 'Otro';
    raza: string;
    estado: 'perdida' | 'encontrada';
    esTurbo?: boolean;
    barrio: string;
    ciudad: string;
    fecha: string;
    imagen: string;
    descripcion: string;
    edad?: string;
    tamano?: string;
    color?: string;
    senasParticulares?: string;
    recompensa?: string;
}

interface TarjetaReporteProps {
    mascota: MascotaReporte;
    onClick: () => void;
}

export function TarjetaReporte({ mascota, onClick }: TarjetaReporteProps) {
    const esPerdida = mascota.estado === 'perdida';

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${mascota.esTurbo
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-100/50'
                    : 'border-slate-200/80 shadow-sm hover:border-slate-300'
                }`}
        >
            {/* Contenedor Imagen */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                    src={mascota.imagen}
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

                {/* Insignia Alerta Turbo */}
                {mascota.esTurbo && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                        <Zap className="w-3.5 h-3.5 fill-amber-950" /> TURBO
                    </span>
                )}

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
                            {mascota.especie} • {mascota.raza}
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
                            {mascota.barrio}, {mascota.ciudad}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Visto: {mascota.fecha}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                    {mascota.descripcion}
                </p>
            </div>
        </div>
    );
}