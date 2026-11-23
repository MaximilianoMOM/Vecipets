'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

interface BotonReportarProps {
    className?: string;
    children?: React.ReactNode;
}

export default function BotonReportarProtegido({ className, children }: BotonReportarProps) {
    const router = useRouter();

    // Cambia a `true` para probar la navegación directa a /reportar o conéctalo con tu sesión real
    const [estaLogueado] = useState<boolean>(false);
    const [mostrarModalAuth, setMostrarModalAuth] = useState<boolean>(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!estaLogueado) {
            setMostrarModalAuth(true);
            return;
        }

        router.push('/reportar');
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className={
                    className ||
                    'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2'
                }
            >
                {children || <span>+ Reportar</span>}
            </button>

            {mostrarModalAuth && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-slate-100">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-2">
                            ¡Inicia sesión para reportar!
                        </h3>

                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Para garantizar la seguridad de la comunidad y proteger los reportes de mascotas, debes iniciar sesión o registrarte primero.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setMostrarModalAuth(false)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarModalAuth(false);
                                    router.push('/login');
                                }}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}