
'use client';

import React, { useState } from 'react';

import {
    Zap,
    ShieldCheck,
    X,
    Loader2,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';

import apiClient from '@/lib/api-client';

// ==========================================
// INTERFAZ DE PROPIEDADES
// ==========================================

interface CheckoutTurboModalProps {
    isOpen: boolean;
    onClose: () => void;
    reporteId?: number;
    nombreMascota: string;
    onSuccess?: () => void;
}

// ==========================================
// COMPONENTE CHECKOUT TURBO
// ==========================================

export default function CheckoutTurboModal({
    isOpen,
    onClose,
    reporteId,
    nombreMascota,
}: CheckoutTurboModalProps) {

    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // ==========================================
    // INICIAR PAGO CON WOMPI
    // ==========================================

    const handlePagarConWompi = async () => {

        if (!reporteId) {
            setError(
                'No se identificó el número de reporte para activar la Alerta Turbo.',
            );
            return;
        }

        setProcesando(true);
        setError(null);

        try {
            const respuesta = await apiClient.post(
                '/pagos/alerta-turbo',
                {
                    reporteId,
                },
            );

            console.log(
                'RESPUESTA DEL PAGO TURBO:',
                respuesta.data,
            );

            const checkoutUrl = respuesta.data?.checkoutUrl;

            // Validar enlace de Wompi
            if (
                checkoutUrl &&
                typeof checkoutUrl === 'string' &&
                checkoutUrl.startsWith('https://checkout.wompi.co/')
            ) {
                window.location.href = checkoutUrl;
                return;
            }

            console.error(
                'No se recibió una URL válida de Wompi:',
                respuesta.data,
            );

            setError(
                'El servidor respondió, pero no entregó un enlace válido de pago. Intenta nuevamente.',
            );

        } catch (err: unknown) {

            // ==========================================
            // DIAGNÓSTICO DEL ERROR
            // ==========================================

            const errorAxios = err as {
                message?: string;
                code?: string;
                response?: {
                    status?: number;
                    data?: unknown;
                    headers?: unknown;
                };
                request?: unknown;
            };

            const diagnostico = {
                tipo: err instanceof Error ? err.name : typeof err,
                mensaje: errorAxios.message ?? 'Sin mensaje',
                codigo: errorAxios.code ?? 'Sin código',
                estadoHTTP:
                    errorAxios.response?.status ?? 'Sin respuesta HTTP',
                respuestaBackend:
                    errorAxios.response?.data ?? 'Sin datos del backend',
                existeRequest: Boolean(errorAxios.request),
            };

            console.error(
                'DIAGNÓSTICO COMPLETO WOMPI:\n' +
                JSON.stringify(diagnostico, null, 2),
            );

            // ==========================================
            // MOSTRAR MENSAJE AL USUARIO
            // ==========================================

            const mensajeBackend = errorAxios.response?.data as
                | { message?: string | string[] }
                | undefined;

            const mensaje = mensajeBackend?.message;

            setError(
                Array.isArray(mensaje)
                    ? mensaje.join(', ')
                    : mensaje ||
                      `No se pudo iniciar el pago. Código: ${
                          errorAxios.code ?? 'desconocido'
                      }. Revisa la consola.`,
            );

        } finally {
            setProcesando(false);
        }
    };

    // ==========================================
    // VISTA DEL MODAL
    // ==========================================

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">

                {/* BOTÓN CERRAR */}

                <button
                    onClick={onClose}
                    disabled={procesando}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 disabled:opacity-50"
                    aria-label="Cerrar ventana"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ENCABEZADO */}

                <div className="flex items-center gap-3 mb-4">

                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>

                    <div>
                        <h3 className="font-black text-slate-900 text-lg">
                            Activar Alerta Turbo 🚀
                        </h3>

                        <p className="text-xs text-slate-500">
                            Impulsa el reporte de{' '}
                            {nombreMascota || 'tu mascota'}
                        </p>
                    </div>

                </div>

                {/* RESUMEN DEL COBRO */}

                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 mb-4">

                    <div className="flex justify-between text-sm mb-1">

                        <span className="text-slate-700 font-semibold">
                            Alerta Turbo Oficial (7 Días)
                        </span>

                        <span className="font-extrabold text-slate-900">
                            $15.000 COP
                        </span>

                    </div>

                    <p className="text-[11px] text-slate-500 mb-2">
                        Máxima prioridad en el mapa, feed destacado y
                        difusión comunitaria urgente.
                    </p>

                    <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-amber-200/40">

                        <span>
                            Duración: <strong>7 días continuos</strong>
                        </span>

                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Pago Seguro Wompi
                        </span>

                    </div>

                </div>

                {/* MENSAJE DE ERROR */}

                {error && (
                    <div
                        className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs"
                        role="alert"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                        <div>{error}</div>
                    </div>
                )}

                {/* BOTÓN DE PAGO */}

                <button
                    onClick={handlePagarConWompi}
                    disabled={procesando}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >

                    {procesando ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Conectando con Wompi...
                        </>
                    ) : (
                        <>
                            Continuar a Wompi ($15.000 COP)
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}

                </button>

                {/* INFORMACIÓN DE SEGURIDAD */}

                <p className="text-[10px] text-slate-400 text-center mt-3">
                    Serás redirigido al portal seguro de Wompi para pagar
                    con PSE, Nequi, Bancolombia o tarjeta.
                </p>

            </div>

        </div>
    );
}
