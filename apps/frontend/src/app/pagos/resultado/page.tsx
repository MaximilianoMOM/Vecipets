'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, MapPin, Zap } from 'lucide-react';

function ContenidoResultadoPago() {
    const searchParams = useSearchParams();
    const transaccionId = searchParams.get('id');

    return (
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-xl border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase rounded-full inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-800" /> Pasarela Wompi
                </span>
                <h1 className="text-2xl font-black text-slate-900">
                    ¡Pago Procesado con Éxito!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                    Tu transacción ha sido procesada mediante la pasarela segura de Wompi. El webhook oficial confirma el estado y tu Alerta Turbo de 7 días ya se encuentra activa en VeciPets.
                </p>
            </div>

            {transaccionId && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 font-medium space-y-1">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        IDENTIFICADOR DE TRANSACCIÓN WOMPI
                    </span>
                    <span className="font-mono font-bold text-slate-900 break-all">
                        {transaccionId}
                    </span>
                </div>
            )}

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transacción protegida e idempotentemente registrada.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                    href="/reportes"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                    Ver en el Feed <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                    href="/mapa"
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                    <MapPin className="w-4 h-4" /> Ver en el Mapa
                </Link>
            </div>

            <div className="pt-2 border-t border-slate-100">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    Regresar a la página principal
                </Link>
            </div>
        </div>
    );
}

export default function ResultadoPagoPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="text-xs text-slate-500 font-semibold">
                    Cargando comprobante de pago...
                </div>
            }>
                <ContenidoResultadoPago />
            </Suspense>
        </main>
    );
}
