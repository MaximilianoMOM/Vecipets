import React from 'react';

export interface Aliado {
    id: string;
    nombre: string;
    tipo: 'REFUGIO' | 'VETERINARIA' | 'CLINICA';
    direccion: string;
    horario: string;
    servicios: string[];
    telefono: string;
    imagenUrl: string;
}

interface TarjetaAliadoProps {
    aliado: Aliado;
    onClick: () => void;
}

const BADGE_COLORS = {
    REFUGIO: 'bg-purple-600 text-white',
    VETERINARIA: 'bg-emerald-500 text-white',
    CLINICA: 'bg-teal-500 text-white',
};

export default function TarjetaAliado({ aliado, onClick }: TarjetaAliadoProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer group"
        >
            <div>
                {/* Banner e Imagen de la Sede (Altura fija h-48 para mantener simetría) */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                        src={aliado.imagenUrl}
                        alt={aliado.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Tag flotante con el tipo de aliado */}
                    <span
                        className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-sm ${BADGE_COLORS[aliado.tipo]
                            }`}
                    >
                        {aliado.tipo}
                    </span>
                </div>

                {/* Información Principal */}
                <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-1">
                        {aliado.nombre}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500">
                        {/* Ubicación */}
                        <div className="flex items-start gap-1.5">
                            <span className="text-rose-500 shrink-0">📍</span>
                            <span className="line-clamp-1">{aliado.direccion}</span>
                        </div>

                        {/* Horario */}
                        <div className="flex items-center gap-1.5">
                            <span className="shrink-0">🕒</span>
                            <span className="line-clamp-1">{aliado.horario}</span>
                        </div>
                    </div>

                    {/* Tags de Servicios / Especialidades */}
                    <div className="flex flex-wrap gap-1.5 pt-2 h-14 overflow-hidden">
                        {aliado.servicios.map((servicio, idx) => (
                            <span
                                key={idx}
                                className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-md h-fit"
                            >
                                {servicio}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botón de Información / Acción */}
            <div className="p-6 pt-0">
                <div className="w-full bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white text-slate-600 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                    Ver más información y reseñas
                </div>
            </div>

        </div>
    );
}