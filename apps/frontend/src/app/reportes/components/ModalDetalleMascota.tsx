'use client';

import React, { useState } from 'react';
import { X, MapPin, Calendar, Tag, ShieldCheck, Send, CheckCircle2, Zap } from 'lucide-react';
import { MascotaReporte, obtenerUrlImagen } from './TarjetaReportes';
import { useAuth } from '@/lib/auth-context';

interface ModalDetalleMascotaProps {
    mascota: MascotaReporte | null;
    onClose: () => void;
    onActivarTurbo?: (reporte: MascotaReporte) => void;
}

export function ModalDetalleMascota({ mascota, onClose, onActivarTurbo }: ModalDetalleMascotaProps) {
    const { user } = useAuth();
    const [avisoEnviado, setAvisoEnviado] = useState(false);
    const [mensajeAvistamiento, setMensajeAvistamiento] = useState('');

    if (!mascota) return null;

    const estadoNormalizado = (mascota.tipo || mascota.estado || '').toUpperCase();
    const esPerdida = estadoNormalizado === 'PERDIDA';
    const imagenSrc = obtenerUrlImagen(mascota.imagen || mascota.imagenUrl);
    const barrioTexto = mascota.barrioSector || mascota.barrio || 'Medellín';
    const fechaTexto = mascota.fechaEvento || mascota.fecha || 'Reciente';
    const esPropietario = user && mascota.usuario && user.id === mascota.usuario.id;

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
                        src={imagenSrc}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md ${esPerdida ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}>
                            {esPerdida ? 'Mascota Extraviada' : 'Mascota Encontrada'}
                        </span>
                        {mascota.esTurbo && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                                <Zap className="w-3.5 h-3.5 fill-amber-950" /> ALERTA TURBO ACTIVA
                            </span>
                        )}
                    </div>
                </div>

                {/* Cuerpo con scroll interno */}
                <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{mascota.nombre}</h2>
                            <p className="text-sm font-semibold text-emerald-600">
                                {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ''}
                            </p>
                        </div>
                        {esPropietario && !mascota.esTurbo && onActivarTurbo && (
                            <button
                                onClick={() => onActivarTurbo(mascota)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1"
                            >
                                <Zap className="w-3.5 h-3.5 fill-white" /> Activar Turbo
                            </button>
                        )}
                    </div>

                    {/* Recompensa */}
                    {mascota.recompensa && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900">Se ofrece gratificación / recompensa</span>
                            <span className="text-sm font-black text-amber-700">{mascota.recompensa}</span>
                        </div>
                    )}

                    {/* Ubicación y Fecha */}
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span><strong>Ubicación:</strong> {barrioTexto}</span>
                        </div>
                        {mascota.direccion && (
                            <div className="flex items-center gap-2 text-slate-500 text-xs pl-6">
                                <span>{mascota.direccion}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span><strong>Fecha del suceso:</strong> {fechaTexto}</span>
                        </div>
                    </div>

                    {/* Descripción ampliada */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Descripción de la situación</h4>
                        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {mascota.descripcion}
                        </p>
                    </div>

                    {/* Formulario seguro de reporte de avistamiento */}
                    {!esPropietario && (
                        <div className="pt-3 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                ¿Viste a {mascota.nombre}? Envía un reporte seguro al tutor
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
                                        <Send className="w-3.5 h-3.5" /> Enviar aviso de avistamiento
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}