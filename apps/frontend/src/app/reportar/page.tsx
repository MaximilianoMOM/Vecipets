'use client';

import React, { useState } from 'react';
import {
    Camera,
    MapPin,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Zap,
    ShieldAlert,
    CheckCircle2,
    ShieldCheck,
    X,
    Bot
} from 'lucide-react';

export default function ReportarPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        especie: 'Perro' as 'Perro' | 'Gato' | 'Otro',
        raza: '',
        edad: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        barrioSector: '',
        imagenUrl: null as string | null,
        esTurbo: false,
    });

    const [analizandoFoto, setAnalizandoFoto] = useState(false);
    const [fotoValidadaPorIA, setFotoValidadaPorIA] = useState(false);
    const [errorValidacionFoto, setErrorValidacionFoto] = useState<string | null>(null);
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [isModalTurboOpen, setIsModalTurboOpen] = useState(false);
    const [metodoPago, setMetodoPago] = useState<'NEQUI' | 'PSE' | 'TARJETA'>('NEQUI');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorGeneral) setErrorGeneral(null);
    };

    // ==========================================
    // 🤖 1. INTEGRACIÓN CON IA DE IMÁGENES (KATE)
    // ==========================================
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAnalizandoFoto(true);
            setErrorValidacionFoto(null);
            setFotoValidadaPorIA(false);

            try {
                // (KATE): Aquí debes conectar la llamada real (fetch/axios) hacia el endpoint 
                // de NestJS creado por Kate para validar que la foto corresponda a un animal.
                // Ejemplo:
                // const dataForm = new FormData();
                // dataForm.append('imagen', file);
                // const res = await fetch('http://localhost:4000/api/reportes/validar-imagen', {
                //   method: 'POST',
                //   body: dataForm,
                //   credentials: 'include'
                // });
                // const resultado = await res.json();

                // Simulación temporal actual:
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const nombreArchivo = file.name.toLowerCase();
                const esPaisajeFalso = nombreArchivo.includes('paisaje') || nombreArchivo.includes('montana');

                if (esPaisajeFalso) {
                    setErrorValidacionFoto('🤖 La IA detectó que esta imagen no es una mascota. Sube una foto de un perro o gato.');
                    setFotoValidadaPorIA(false);
                    setFormData((prev) => ({ ...prev, imagenUrl: null }));
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        imagenUrl: URL.createObjectURL(file),
                    }));
                    setFotoValidadaPorIA(true);
                    setErrorValidacionFoto(null);
                }
            } catch (err) {
                setErrorValidacionFoto('Error al conectar con el sistema de validación de IA.');
            } finally {
                setAnalizandoFoto(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imagenUrl || !fotoValidadaPorIA) {
            setErrorGeneral('⚠️ Debes adjuntar una fotografía de mascota válida aprobada por la IA.');
            return;
        }

        if (!formData.barrioSector) {
            setErrorGeneral('⚠️ Debes indicar el barrio o sector donde se perdió la mascota.');
            return;
        }

        if (formData.esTurbo) {
            setIsModalTurboOpen(true);
            return;
        }

        ejecutarEnvioBackend();
    };

    const ejecutarEnvioBackend = () => {
        setEnviando(true);
        setTimeout(() => {
            setEnviando(false);
            setIsModalTurboOpen(false);
            alert(`¡Reporte de mascota perdida publicado con éxito! ${formData.esTurbo ? '(Alerta Turbo Activada 🚀)' : ''}`);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Encabezado */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            🚨 Reportar Mascota Perdida
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Completa la información y valida tu reporte con nuestro filtro inteligente de seguridad.
                        </p>
                    </div>

                    <span className="self-start sm:self-center px-3 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-full border border-red-200">
                        UI-002 • Formulario Integrado
                    </span>
                </div>

                {errorGeneral && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-sm" role="alert">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800 font-semibold">{errorGeneral}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Columna Izquierda: Datos */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                1. Información de la Mascota
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                                <input
                                    name="nombre"
                                    type="text"
                                    required
                                    placeholder="Ej. Rocky"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Raza</label>
                                <input
                                    name="raza"
                                    type="text"
                                    placeholder="Ej. Golden Retriever"
                                    value={formData.raza}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Edad aproximada</label>
                                <input
                                    name="edad"
                                    type="text"
                                    placeholder="Ej. 2 años"
                                    value={formData.edad}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                                />
                            </div>
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
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción y Señas Particulares</label>
                            <textarea
                                name="descripcion"
                                rows={3}
                                placeholder="Detalles sobre cómo se perdió..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                            />
                        </div>

                        {/* Opciones de Alerta Turbo */}
                        <div className="pt-3 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                2. Nivel de Visibilidad
                            </label>

                            <div className="grid grid-cols-1 gap-3">
                                <div
                                    onClick={() => setFormData((p) => ({ ...p, esTurbo: false }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${!formData.esTurbo ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div>
                                            <span className="font-bold text-slate-900 text-sm block">Estándar (Gratis)</span>
                                            <span className="text-xs text-slate-500">Publicación normal en el feed y mapa.</span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData((p) => ({ ...p, esTurbo: true }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.esTurbo ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-amber-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
                                            <Zap className="w-4 h-4 fill-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-amber-900 text-sm block">Alerta Turbo ($15.000 COP)</span>
                                            <span className="text-xs text-slate-600">Máxima prioridad, notificaciones y afiche con QR.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Columna Derecha: Foto con Filtro IA y Mapa */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Foto con Filtro Inteligente */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 relative">

                            {errorValidacionFoto && (
                                <div className="absolute -top-3 left-4 right-4 bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-start gap-2 z-20">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <div className="flex-1">{errorValidacionFoto}</div>
                                    <button type="button" onClick={() => setErrorValidacionFoto(null)} className="text-white/80 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2 mt-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Fotografía de la Mascota *
                                </label>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> IA Anti-Fraude
                                </span>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                                {analizandoFoto ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-indigo-600">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-xs font-bold">Analizando imagen con IA...</span>
                                    </div>
                                ) : formData.imagenUrl && fotoValidadaPorIA ? (
                                    <div className="relative">
                                        <img src={formData.imagenUrl} alt="Preview" className="w-full h-44 object-cover rounded-lg shadow-sm" />
                                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Mascota Verificada por IA
                                        </div>
                                        <button type="button" onClick={() => { setFormData(p => ({ ...p, imagenUrl: null })); setFotoValidadaPorIA(false); }} className="mt-2 text-xs font-bold text-red-600 hover:underline">
                                            Cambiar fotografía
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

                        {/* ========================================== */}
                        {/* 🗺️ 2. MAPA INTERACTIVO (MAX)              */}
                        {/* ========================================== */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Última Ubicación Vista *
                            </label>

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

                                {/*  (MAX): Aquí debes incrustar el componente del Mapa Interactivo (Leaflet / Mapbox) */}
                                <div className="w-full h-40 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-4">
                                    <MapPin className="w-6 h-6 text-red-500 mb-1 animate-bounce" />
                                    <span className="text-[11px] text-slate-400">[ Aquí va el componente del Mapa Interactivo de Max ]</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Publicación */}
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`w-full py-4 px-6 rounded-xl font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm ${formData.esTurbo ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.esTurbo ? <><Zap className="w-4 h-4 fill-white" /> Continuar a Pago e Impulsar con Turbo</> : 'Publicar Reporte Estándar'}
                        </button>

                    </div>
                </form>

                {/* Modal de Pago Intermedio (Alerta Turbo) */}
                {isModalTurboOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
                            <button onClick={() => setIsModalTurboOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                                    <Zap className="w-6 h-6 fill-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">Activar Alerta Turbo</h3>
                                    <p className="text-xs text-slate-500">Impulsa el reporte de {formData.nombre || 'tu mascota'}</p>
                                </div>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 mb-5">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 font-medium">Servicio Alerta Turbo 24h</span>
                                    <span className="font-bold text-slate-900">$15.000 COP</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Selecciona el método de pago</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setMetodoPago('NEQUI')} className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${metodoPago === 'NEQUI' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}>💜 Nequi</button>
                                    <button type="button" onClick={() => setMetodoPago('PSE')} className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${metodoPago === 'PSE' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}>🏦 PSE</button>
                                    <button type="button" onClick={() => setMetodoPago('TARJETA')} className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${metodoPago === 'TARJETA' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}>💳 Tarjeta</button>
                                </div>
                            </div>

                            <button onClick={ejecutarEnvioBackend} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4" /> Pagar $15.000 y Publicar Turbo
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}