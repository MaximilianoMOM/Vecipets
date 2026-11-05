'use client';

import React, { useState } from 'react';
import { Camera, MapPin, AlertCircle, ArrowLeft, Loader2, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import CheckoutTurboModal from '../reportes/CheckoutTurboModal';

export default function FormularioReporteContenido() {
    const [formData, setFormData] = useState({
        nombre: '',
        especie: 'Perro' as 'Perro' | 'Gato' | 'Otro',
        raza: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        barrioSector: '',
        imagenUrl: null as string | null,
        esTurbo: false,
    });

    const [cargandoImagen, setCargandoImagen] = useState(false);
    const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorValidacion) setErrorValidacion(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCargandoImagen(true);
            setTimeout(() => {
                setFormData((prev) => ({ ...prev, imagenUrl: URL.createObjectURL(file) }));
                setCargandoImagen(false);
            }, 1200);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imagenUrl) {
            setErrorValidacion('La fotografía de la mascota es obligatoria.');
            return;
        }

        if (!formData.barrioSector) {
            setErrorValidacion('Debes indicar el barrio o sector del incidente.');
            return;
        }

        // Si seleccionó Turbo, abrimos la pasarela de pago intermedia
        if (formData.esTurbo) {
            setIsModalOpen(true);
            return;
        }

        // Envío estándar directo
        ejecutarEnvioBackend();
    };

    const ejecutarEnvioBackend = () => {
        setEnviando(true);
        setTimeout(() => {
            setEnviando(false);
            setIsModalOpen(false);
            alert(`¡Reporte de mascota perdida publicado con éxito! ${formData.esTurbo ? '(Alerta Turbo Activada 🚀)' : ''}`);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <button type="button" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            🚨 Reportar Mascota Perdida
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Publica la información de tu mascota extraviada para alertar a la comunidad.
                        </p>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-full border border-red-200">
                        UI-002 • Dueño Autenticado
                    </span>
                </div>

                {errorValidacion && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3" role="alert">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                            <strong className="font-bold">Atención:</strong> {errorValidacion}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Datos de la Mascota</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                                <input
                                    name="nombre"
                                    type="text"
                                    required
                                    placeholder="Ej. Bruno"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Especie *</label>
                                <select
                                    name="especie"
                                    value={formData.especie}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                                >
                                    <option value="Perro">🐶 Perro</option>
                                    <option value="Gato">🐱 Gato</option>
                                    <option value="Otro">🐾 Otro</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Raza o Señas Particulares</label>
                            <input
                                name="raza"
                                type="text"
                                placeholder="Ej. Criollo, collar rojo"
                                value={formData.raza}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Extravío *</label>
                            <input
                                name="fecha"
                                type="date"
                                required
                                value={formData.fecha}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                            <textarea
                                name="descripcion"
                                rows={3}
                                placeholder="Detalles de cómo se extravió..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Nivel de Visibilidad</label>
                            <div className="space-y-3">
                                <div
                                    onClick={() => setFormData((p) => ({ ...p, esTurbo: false }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${!formData.esTurbo ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <span className="font-bold text-slate-900 text-sm block">Estándar (Gratis)</span>
                                            <span className="text-xs text-slate-500">Orden cronológico normal en el feed.</span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData((p) => ({ ...p, esTurbo: true }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.esTurbo ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-amber-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500 text-white rounded-lg">
                                            <Zap className="w-4 h-4 fill-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-amber-900 text-sm block">Alerta Turbo</span>
                                            <span className="text-xs text-slate-600">Prioridad máxima + QR imprimible. ($15.000 COP)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fotografía *</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                                {cargandoImagen ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                        <span className="text-xs font-medium">Subiendo foto...</span>
                                    </div>
                                ) : formData.imagenUrl ? (
                                    <div className="relative">
                                        <img src={formData.imagenUrl} alt="Preview" className="w-full h-44 object-cover rounded-lg" />
                                        <button type="button" onClick={() => setFormData((p) => ({ ...p, imagenUrl: null }))} className="mt-2 text-xs font-bold text-red-600 hover:underline">
                                            Cambiar foto
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer py-6 flex flex-col items-center justify-center">
                                        <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-bold text-slate-700">Subir foto de la mascota</span>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Última Ubicación *</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        name="barrioSector"
                                        type="text"
                                        required
                                        placeholder="Ej. Laureles, Medellín"
                                        value={formData.barrioSector}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                                    />
                                </div>
                                <div className="w-full h-40 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-4">
                                    <MapPin className="w-6 h-6 text-red-500 mb-1 animate-bounce" />
                                    <span className="text-[11px] text-slate-400">[ Espacio reservado para Mapa Leaflet / Geolocalización ]</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className={`w-full py-4 px-6 rounded-xl font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm ${formData.esTurbo ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.esTurbo ? <><Zap className="w-4 h-4" /> Continuar a Pago e Impulsar</> : 'Publicar Reporte Estándar'}
                        </button>
                    </div>
                </form>

                {/* Modal de Pago Intermedio si es Turbo */}
                <CheckoutTurboModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={ejecutarEnvioBackend}
                    nombreMascota={formData.nombre}
                />

            </div>
        </div>
    );
}