'use client';

import React, { useState } from 'react';
import { ArrowRight, CreditCard, CheckCircle2, Mail, Download, ShieldCheck } from 'lucide-react';

interface Props {
    campaña: any;
    onClose: () => void;
    onConfirmarReserva: (reserva: any) => void;
}

export default function ModalReservaFlujo({ campaña, onClose, onConfirmarReserva }: Props) {
    const [pasoReserva, setPasoReserva] = useState<'formulario' | 'pago' | 'exito'>('formulario');
    const [nombrePropietario, setNombrePropietario] = useState('');
    const [nombreMascota, setNombreMascota] = useState('');
    const [metodoPago, setMetodoPago] = useState<'nequi' | 'pse' | 'tarjeta'>('nequi');

    const irAPagar = (e: React.FormEvent) => {
        e.preventDefault();
        setPasoReserva('pago');
    };

    const confirmarPagoYFinalizar = () => {
        const nuevaReserva = {
            codigo: `#VP-${Math.floor(10000 + Math.random() * 90000)}`,
            campaña: campaña.titulo,
            veterinaria: campaña.veterinaria,
            direccion: campaña.direccion,
            fechaHora: `${campaña.fecha} • ${campaña.hora}`,
            mascota: nombreMascota || 'Mascota',
            propietario: nombrePropietario || 'Usuario VeciPets',
            montoPendiente: campaña.precioComunitaria,
        };

        onConfirmarReserva(nuevaReserva);
        setPasoReserva('exito');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                >
                    ✕
                </button>

                {pasoReserva === 'formulario' && (
                    <>
                        <h2 className="text-xl font-black text-slate-900 mb-1">Reservar Cupo de Cita</h2>
                        <p className="text-xs text-slate-600 mb-4">{campaña.titulo}</p>

                        <form onSubmit={irAPagar} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-800 mb-1">Nombre del Propietario</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Pepito Pérez"
                                    value={nombrePropietario}
                                    onChange={(e) => setNombrePropietario(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-800 mb-1">Nombre y tipo de mascota</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Bruno (Gato)"
                                    value={nombreMascota}
                                    onChange={(e) => setNombreMascota(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 text-xs">
                                <div className="flex justify-between font-bold text-slate-900">
                                    <span>Comisión de reserva:</span>
                                    <span className="text-blue-600 font-black">{campaña.comisionReserva}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                            >
                                Continuar a la Pasarela de Pago <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                )}

                {pasoReserva === 'pago' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-900">Confirmar Pago de Reserva</h2>
                        <p className="text-xs text-slate-600">Selecciona el método para pagar la comisión de <strong className="text-slate-900">{campaña.comisionReserva}</strong></p>

                        <div className="space-y-2">
                            {[
                                { id: 'nequi', nombre: 'Nequi / Bancolombia a la Mano' },
                                { id: 'pse', nombre: 'PSE (Débito de cualquier banco)' },
                                { id: 'tarjeta', nombre: 'Tarjeta de Crédito / Débito' },
                            ].map((metodo) => (
                                <div
                                    key={metodo.id}
                                    onClick={() => setMetodoPago(metodo.id as any)}
                                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer flex items-center justify-between transition-all ${metodoPago === metodo.id ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex items-center gap-2 text-slate-900">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        {metodo.nombre}
                                    </span>
                                    {metodoPago === metodo.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={confirmarPagoYFinalizar}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            Pagar {campaña.comisionReserva} y Confirmar Cita
                        </button>

                        <button
                            onClick={() => setPasoReserva('formulario')}
                            className="w-full text-xs text-slate-500 hover:text-slate-800 text-center block"
                        >
                            Volver a los datos
                        </button>
                    </div>
                )}

                {pasoReserva === 'exito' && (
                    <div className="py-2 space-y-4">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">¡Cupo Reservado Exitosamente!</h3>
                            <p className="text-[11px] text-slate-600">Comprobante digital emitido por VeciPets</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 text-slate-900">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="font-bold text-slate-800 text-[10px] tracking-wider uppercase">CÓDIGO DE RESERVA</span>
                                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#VP-84920</span>
                            </div>
                            <p><strong className="text-slate-900">Propietario:</strong> {nombrePropietario || 'Usuario VeciPets'} ({nombreMascota || 'Mascota'})</p>
                            <p><strong className="text-slate-900">Lugar:</strong> {campaña.veterinaria}</p>
                            <p><strong className="text-slate-900">Dirección:</strong> {campaña.direccion}</p>
                            <p><strong className="text-slate-900">Fecha/Hora:</strong> {campaña.fecha} • {campaña.hora}</p>
                        </div>

                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2 text-[11px] text-blue-950 font-medium">
                            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>Copia disponible en tu perfil y enviada al chat interno.</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => alert('Descargando comprobante PDF...')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs text-white flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <Download className="w-3.5 h-3.5" /> Descargar PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Reserva garantizada por VeciPets
                </div>
            </div>
        </div>
    );
}