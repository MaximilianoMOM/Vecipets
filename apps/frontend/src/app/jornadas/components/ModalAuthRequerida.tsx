'use client';

import React from 'react';
import { Lock, LogIn } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSimularLogin: () => void;
}

export default function ModalAuthRequerida({ onClose, onSimularLogin }: Props) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                >
                    ✕
                </button>

                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1">Inicia sesión en VeciPets</h3>
                <p className="text-xs text-slate-600 mb-6">
                    Para apartar un cupo en la app y generar tu comprobante digital debes tener una cuenta activa.
                </p>

                <div className="space-y-2">
                    <button
                        onClick={onSimularLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-4 h-4" /> Iniciar Sesión / Registrarme
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl text-xs"
                    >
                        Seguir Explorando
                    </button>
                </div>
            </div>
        </div>
    );
}