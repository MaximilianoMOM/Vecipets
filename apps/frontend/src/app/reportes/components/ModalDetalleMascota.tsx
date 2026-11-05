'use client';

import React, { useState } from 'react';
import { X, MapPin, Calendar, Tag, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { MascotaReporte } from './TarjetaReportes';

interface ModalDetalleMascotaProps {
    mascota: MascotaReporte | null;
    onClose: () => void;
}

export function ModalDetalleMascota({ mascota, onClose }: ModalDetalleMascotaProps) {
    const [avisoEnviado, setAvisoEnviado] = useState(false);
    const [mensajeAvistamiento, setMensajeAvistamiento] = useState('');

    if (!mascota) return null;

    const handleEnviarAvistamiento = (e: React.FormEvent) => {
        e.preventDefault();
        setAvisoEnviado(true);
        setTimeout(() => {
            setAvisoEnviado(false);
            setMensajeAvistamiento('');
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">

                {/* Cabecera modal con foto y botón de cerrar */}
                <div className="relative h-60 w-full bg-slate-900 shrink-0">
                    <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-slate-900/60 text-white hover:bg-slate-900 p-2 rounded-full transition-colors backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md ${mascota.estado === 'perdida' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}>
                            {mascota.estado === 'perdida' ? 'Mascota Extraviada' : 'Mascota Encontrada'}
                        </span>
                    </div>
                </div>

                {/* Cuerpo con scroll interno */}
                <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{mascota.nombre}</h2>
                        <p className="text-sm font-semibold text-emerald-600">{mascota.especie} • {mascota.raza}</p>
                    </div>

                    {/* Recompensa */}
                    {mascota.recompensa && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900">Se ofrece gratificación / recompensa</span>
                            <span className="text-sm font-black text-amber-700">{mascota.recompensa}</span>
                        </div>
                    )}

                    {/* Características detalladas */}
                    <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Edad</span>
                            <span className="text-xs font-bold text-slate-700">{mascota.edad || 'No especificada'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Tamaño</span>
                            <span className="text-xs font-bold text-slate-700">{mascota.tamano || 'Mediano'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Color</span>
                            <span className="text-xs font-bold text-slate-700">{mascota.color || 'Varios'}</span>
                        </div>
                    </div>

                    {/* Ubicación y Fecha */}
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span><strong>Última vez visto:</strong> {mascota.barrio}, {mascota.ciudad}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span><strong>Fecha del suceso:</strong> {mascota.fecha}</span>
                        </div>
                    </div>

                    {/* Descripción ampliada */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Descripción de la situación</h4>
                        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {mascota.descripcion}
                        </p>
                    </div>

                    {/* Mapa simulado de ubicación */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Zona de avistamiento</h4>
                        <div className="h-32 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-xs font-medium relative overflow-hidden border border-slate-200">
                            <div className="text-center">
                                <MapPin className="w-6 h-6 text-rose-500 mx-auto animate-bounce mb-1" />
                                <span>[ Vista previa del Mapa Interactivo ]</span>
                                <span className="block text-[10px] text-slate-400">{mascota.barrio}</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario seguro de reporte de avistamiento (Sin exponers teléfonos directos) */}
                    <div className="pt-3 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            ¿Viste a {mascota.nombre}? Envía un reporte seguro al propietario
                        </h4>

                        {avisoEnviado ? (
                            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ¡Reporte de avistamiento enviado de forma privada al tutor!
                            </div>
                        ) : (
                            <form onSubmit={handleEnviarAvistamiento} className="space-y-2">
                                <textarea
                                    required
                                    rows={2}
                                    placeholder={`Escribe detalles (ej: "Lo vi cerca del parque de la 70 hace 10 minutos")...`}
                                    value={mensajeAvistamiento}
                                    onChange={(e) => setMensajeAvistamiento(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                ></textarea>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" /> Enviar ubicación/aviso de forma privada
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}