'use client';

import React from 'react';
import { MapPin, Calendar, Syringe, Sparkles } from 'lucide-react';

interface Campaña {
    id: number;
    titulo: string;
    veterinaria: string;
    comuna: string;
    direccion: string;
    fecha: string;
    hora: string;
    precioComunitaria: string;
    comisionReserva: string;
    cuposDisponibles: number;
    destacado: boolean;
    imagenUrl: string;
}

interface Props {
    campaña: Campaña;
    onApartarCupo: (campaña: Campaña) => void;
}

export default function TarjetaCampaña({ campaña, onApartarCupo }: Props) {
    return (
        <div
            className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${campaña.destacado ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80'
                }`}
        >
            <div>
                <div className="relative h-48 w-full bg-slate-100">
                    <img src={campaña.imagenUrl} alt={campaña.titulo} className="w-full h-full object-cover" />
                    {campaña.destacado && (
                        <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wide flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Clínica Aliada Destacada
                        </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {campaña.cuposDisponibles} cupos restantes
                    </span>
                </div>

                <div className="p-5 space-y-3">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                        {campaña.veterinaria}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{campaña.titulo}</h3>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span><strong>Ubicación:</strong> {campaña.direccion} ({campaña.comuna})</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span><strong>Fecha y hora:</strong> {campaña.fecha} • {campaña.hora}</span>
                        </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between mt-3 border border-slate-100">
                        <div>
                            <p className="text-[11px] text-slate-500">Costo del servicio:</p>
                            <p className="text-sm font-extrabold text-slate-900">{campaña.precioComunitaria}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-slate-500">Comisión de reserva:</p>
                            <p className="text-xs font-bold text-blue-600">{campaña.comisionReserva}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 pt-0">
                <button
                    onClick={() => onApartarCupo(campaña)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    <Syringe className="w-4 h-4" /> Apartar Cupo en la App
                </button>
            </div>
        </div>
    );
}