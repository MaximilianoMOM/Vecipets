'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Lock, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface BotonReportarProps {
    className?: string;
    children?: React.ReactNode;
}

export default function BotonReportarProtegido({
    className,
    children,
}: BotonReportarProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);
    }, []);

    if (user && user.rol !== 'CIUDADANO') return null;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        if (!user) {
            setMostrarModalAuth(true);
            return;
        }

        router.push('/reportar');
    };

    const modalContenido = mostrarModalAuth ? (
        <div
            onClick={() => setMostrarModalAuth(false)}
            className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100"
            >
                <button
                    type="button"
                    onClick={() => setMostrarModalAuth(false)}
                    aria-label="Cerrar ventana"
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Lock className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">
                    ¡Inicia sesión para reportar!
                </h3>

                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Para garantizar la seguridad de la comunidad y proteger los reportes de mascotas, debes iniciar sesión o registrarte primero.
                </p>

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            setMostrarModalAuth(false);
                            router.push('/login');
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-md"
                    >
                        Iniciar sesión
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMostrarModalAuth(false);
                            router.push('/registro');
                        }}
                        className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-2xl text-sm transition flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Registrarse
                    </button>

                    <button
                        type="button"
                        onClick={() => setMostrarModalAuth(false)}
                        className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-xs transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className={
                    className ||
                    'bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5'
                }
            >
                {children || <span>+ Reportar Mascota</span>}
            </button>

            {montado && modalContenido ? createPortal(modalContenido, document.body) : null}
        </>
    );
}
