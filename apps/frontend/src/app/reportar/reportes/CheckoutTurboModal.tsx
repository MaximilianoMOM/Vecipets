'use client';

import React, { useState } from 'react';
import { Zap, CreditCard, ShieldCheck, X, Loader2, CheckCircle2 } from 'lucide-react';

interface CheckoutTurboModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    nombreMascota: string;
}

export default function CheckoutTurboModal({ isOpen, onClose, onSuccess, nombreMascota }: CheckoutTurboModalProps) {
    const [metodoPago, setMetodoPago] = useState<'NEQUI' | 'PSE' | 'TARJETA'>('NEQUI');
    const [procesando, setProcesando] = useState(false);

    if (!isOpen) return null;

    const handlePagar = () => {
        setProcesando(true);
        setTimeout(() => {
            setProcesando(false);
            onSuccess();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Encabezado Modal */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg">Activar Alerta Turbo</h3>
                        <p className="text-xs text-slate-500">Impulsa el reporte de {nombreMascota || 'tu mascota'}</p>
                    </div>
                </div>

                {/* Resumen de cobro */}
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 mb-5">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">Servicio Alerta Turbo 24h</span>
                        <span className="font-bold text-slate-900">$15.000 COP</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-amber-200/40">
                        <span>Incluye QR, afiche y notificaciones</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro
                        </span>
                    </div>
                </div>

                {/* Métodos de Pago */}
                <div className="space-y-3 mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Selecciona el método de pago
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setMetodoPago('NEQUI')}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all ${metodoPago === 'NEQUI' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'
                                }`}
                        >
                            💜 Nequi
                        </button>
                        <button
                            type="button"
                            onClick={() => setMetodoPago('PSE')}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all ${metodoPago === 'PSE' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'
                                }`}
                        >
                            🏦 PSE
                        </button>
                        <button
                            type="button"
                            onClick={() => setMetodoPago('TARJETA')}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all ${metodoPago === 'TARJETA' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'
                                }`}
                        >
                            💳 Tarjeta
                        </button>
                    </div>
                </div>

                {/* Botón de Pagar */}
                <button
                    onClick={handlePagar}
                    disabled={procesando}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                    {procesando ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> Pagar $15.000 y Publicar Turbo
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}