'use client';

import React from 'react';
import { Ticket, Download } from 'lucide-react';

interface Props {
    reservas: any[];
}

export default function ListaMisReservas({ reservas }: Props) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" /> Mis Comprobantes de Reserva
            </h2>

            {reservas.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">No tienes cupos reservados en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reservas.map((reserva, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-900">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="font-bold text-slate-800 text-[10px]">CÓDIGO DE RESERVA</span>
                                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{reserva.codigo}</span>
                            </div>
                            <p><strong className="text-slate-900">Propietario / Mascota:</strong> {reserva.propietario} ({reserva.mascota})</p>
                            <p><strong className="text-slate-900">Lugar:</strong> {reserva.veterinaria}</p>
                            <p><strong className="text-slate-900">Fecha/Hora:</strong> {reserva.fechaHora}</p>
                            <button
                                onClick={() => alert(`Descargando comprobante ${reserva.codigo}...`)}
                                className="w-full mt-2 bg-white border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                            >
                                <Download className="w-3.5 h-3.5 text-blue-600" /> Descargar PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}