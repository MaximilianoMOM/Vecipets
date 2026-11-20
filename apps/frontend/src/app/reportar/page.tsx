'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Camera,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Bot,
  X,
  Search,
  Crosshair,
} from 'lucide-react';

export interface SeleccionMapa {
  lat: number;
  lng: number;
  direccion?: string;
}

export interface MapaInteractivoProps {
  lat?: number;
  lng?: number;
  etiqueta?: string;
  onSeleccionarUbicacion?: (seleccion: SeleccionMapa) => void;
}

const MapaInteractivo = dynamic<MapaInteractivoProps>(
  () => import('../components/map/MapaInteractivo'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Cargando mapa interactivo...
        </p>
      </div>
    ),
  }
);

interface Coordenadas {
  lat: number;
  lng: number;
}

const COORDENADAS_DEFECTO: Coordenadas = {
  lat: 6.2442,
  lng: -75.5812,
};

function parsearCoordenadas(texto: string): Coordenadas | null {
  const match = texto
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return { lat, lng };
}

export default function FormularioReporteContenido() {
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

  const [ubicacion, setUbicacion] = useState<Coordenadas>(COORDENADAS_DEFECTO);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [fotoValidadaPorIA, setFotoValidadaPorIA] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'NEQUI' | 'PSE' | 'TARJETA'>('NEQUI');
  const [procesandoPago, setProcesandoPago] = useState(false);

  const origenFueMapaRef = useRef(false);

  const buscarUbicacionEnMapa = async (textoRaw: string, signal?: AbortSignal) => {
    const consulta = textoRaw.trim();
    if (consulta.length < 2) {
      setBuscandoUbicacion(false);
      return;
    }

    const coordsDirectas = parsearCoordenadas(consulta);
    if (coordsDirectas) {
      setUbicacion(coordsDirectas);
      setBuscandoUbicacion(false);
      return;
    }

    setBuscandoUbicacion(true);
    try {
      const yaIncluyeCiudad =
        consulta.toLowerCase().includes('medellín') ||
        consulta.toLowerCase().includes('medellin') ||
        consulta.toLowerCase().includes('colombia');

      const queryCompleta = yaIncluyeCiudad
        ? consulta
        : `${consulta}, Medellín, Colombia`;

      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        queryCompleta
      )}`;

      const res = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const resultados = await res.json();
        if (Array.isArray(resultados) && resultados.length > 0) {
          const latNum = parseFloat(resultados[0].lat);
          const lngNum = parseFloat(resultados[0].lon);
          if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
            setUbicacion({ lat: latNum, lng: lngNum });
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error buscando ubicación en el mapa:', err);
      }
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  useEffect(() => {
    if (origenFueMapaRef.current) {
      origenFueMapaRef.current = false;
      return;
    }

    const consulta = formData.barrioSector.trim();
    if (consulta.length < 3) {
      setBuscandoUbicacion(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      buscarUbicacionEnMapa(consulta, controller.signal);
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.barrioSector]);

  const handleSeleccionDesdeMapa = async ({ lat, lng, direccion }: SeleccionMapa) => {
    setUbicacion({ lat, lng });
    if (errorValidacion) setErrorValidacion(null);

    if (direccion && direccion.trim()) {
      origenFueMapaRef.current = true;
      setFormData((prev) => ({ ...prev, barrioSector: direccion.trim() }));
      return;
    }

    setBuscandoUbicacion(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const addr = data?.address || {};
        const legible =
          addr.road ||
          addr.neighbourhood ||
          addr.suburb ||
          addr.city ||
          data?.display_name?.split(',').slice(0, 2).join(', ') ||
          `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        origenFueMapaRef.current = true;
        setFormData((prev) => ({ ...prev, barrioSector: legible }));
      }
    } catch {
      origenFueMapaRef.current = true;
      setFormData((prev) => ({
        ...prev,
        barrioSector: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      }));
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorValidacion) setErrorValidacion(null);
  };

  const handlePasteDireccion = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const textoPegado = e.clipboardData.getData('text');
    if (textoPegado && textoPegado.trim().length >= 2) {
      setTimeout(() => {
        buscarUbicacionEnMapa(textoPegado);
      }, 50);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCargandoImagen(true);
      setErrorValidacion(null);
      setFotoValidadaPorIA(false);

      setTimeout(() => {
        const nombreArchivo = file.name.toLowerCase();
        const esPaisajeFalso =
          nombreArchivo.includes('paisaje') || nombreArchivo.includes('montana');

        if (esPaisajeFalso) {
          setErrorValidacion(
            '🤖 Filtro IA: La imagen no corresponde a una mascota. Sube una foto de un perro o gato.'
          );
          setFotoValidadaPorIA(false);
          setFormData((prev) => ({ ...prev, imagenUrl: null }));
        } else {
          setFormData((prev) => ({
            ...prev,
            imagenUrl: URL.createObjectURL(file),
          }));
          setFotoValidadaPorIA(true);
        }
        setCargandoImagen(false);
      }, 1200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imagenUrl || !fotoValidadaPorIA) {
      setErrorValidacion(
        'Debes subir una fotografía de mascota válida aprobada por el filtro de IA.'
      );
      return;
    }

    if (!formData.barrioSector.trim()) {
      setErrorValidacion(
        'Debes indicar el barrio o sector del incidente o hacer clic en el mapa.'
      );
      return;
    }

    if (formData.esTurbo) {
      setIsModalOpen(true);
      return;
    }

    ejecutarEnvioBackend();
  };

  const ejecutarEnvioBackend = () => {
    setEnviando(true);
    setProcesandoPago(false);
    setTimeout(() => {
      setEnviando(false);
      setIsModalOpen(false);
      alert(
        `¡Reporte de mascota perdida publicado con éxito! (${ubicacion.lat.toFixed(
          5
        )}, ${ubicacion.lng.toFixed(5)}) ${
          formData.esTurbo ? '(Alerta Turbo Activada 🚀)' : ''
        }`
      );
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              🚨 Reportar Mascota Perdida
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Completa la información y valida tu reporte con nuestro filtro
              inteligente de seguridad.
            </p>
          </div>

          <span className="self-start sm:self-center px-3 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-full border border-red-200">
            UI-002 • Formulario con Filtro IA
          </span>
        </div>

        {errorValidacion && (
          <div
            className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-sm"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="font-bold">Aviso:</strong> {errorValidacion}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Información de la Mascota
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre *
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especie *
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raza
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edad aproximada
                </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Extravío *
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción y Señas Particulares
              </label>
              <textarea
                name="descripcion"
                rows={3}
                placeholder="Detalles sobre cómo se perdió..."
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Nivel de Visibilidad
              </label>

              <div className="grid grid-cols-1 gap-3">
                <div
                  onClick={() => setFormData((p) => ({ ...p, esTurbo: false }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    !formData.esTurbo
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        Estándar (Gratis)
                      </span>
                      <span className="text-xs text-slate-500">
                        Publicación normal en el feed y mapa.
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setFormData((p) => ({ ...p, esTurbo: true }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    formData.esTurbo
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 text-sm block">
                        Alerta Turbo ($15.000 COP)
                      </span>
                      <span className="text-xs text-slate-600">
                        Máxima prioridad, notificaciones y afiche con QR.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fotografía con Filtro IA *
                </label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bot className="w-3 h-3" /> IA Anti-Fraude
                </span>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                {cargandoImagen ? (
                  <div className="py-8 flex flex-col items-center justify-center text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-bold">
                      Analizando imagen con IA...
                    </span>
                  </div>
                ) : formData.imagenUrl && fotoValidadaPorIA ? (
                  <div className="relative">
                    <img
                      src={formData.imagenUrl}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mascota Verificada por IA
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, imagenUrl: null }));
                        setFotoValidadaPorIA(false);
                      }}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline"
                    >
                      Cambiar fotografía
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer py-6 flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700">
                      Subir foto de la mascota
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Prueba nombrando el archivo ej: &quot;paisaje.jpg&quot; para
                      simular rechazo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Última Ubicación Vista *
                </label>
                {buscandoUbicacion && (
                  <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Ubicando...
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      name="barrioSector"
                      type="text"
                      required
                      placeholder="Ej. Laureles, Medellín o 6.24, -75.58"
                      value={formData.barrioSector}
                      onChange={handleChange}
                      onPaste={handlePasteDireccion}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => buscarUbicacionEnMapa(formData.barrioSector)}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                    title="Buscar en el mapa"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Haz clic en el mapa para marcar el punto o escribe/pega la dirección.
                  </span>
                </p>

                <div className="w-full h-60 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                  <MapaInteractivo
                    lat={ubicacion.lat}
                    lng={ubicacion.lng}
                    etiqueta={formData.barrioSector || 'Ubicación del reporte'}
                    onSeleccionarUbicacion={handleSeleccionDesdeMapa}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className={`w-full py-4 px-6 rounded-xl font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm ${
                formData.esTurbo
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {enviando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : formData.esTurbo ? (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Continuar a Pago e
                  Impulsar con Turbo
                </>
              ) : (
                'Publicar Reporte Estándar'
              )}
            </button>
          </div>
        </form>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                  <Zap className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Activar Alerta Turbo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Impulsa el reporte de {formData.nombre || 'tu mascota'}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">
                    Servicio Alerta Turbo 24h
                  </span>
                  <span className="font-bold text-slate-900">$15.000 COP</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Selecciona el método de pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('NEQUI')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${
                      metodoPago === 'NEQUI'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    💜 Nequi
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('PSE')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${
                      metodoPago === 'PSE'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🏦 PSE
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 ${
                      metodoPago === 'TARJETA'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={ejecutarEnvioBackend}
                disabled={procesandoPago}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Pagar $15.000 y Publicar Turbo
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}