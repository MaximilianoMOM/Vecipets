'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Crosshair,
  Search,
} from 'lucide-react';
import CheckoutTurboModal from './CheckoutTurboModal';

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
  () => import('../../components/map/MapaInteractivo'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Cargando mapa de la comunidad...
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
  const match = texto.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
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
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    barrioSector: '',
    imagenUrl: null as string | null,
    esTurbo: false,
  });

  const [ubicacion, setUbicacion] = useState<Coordenadas>(COORDENADAS_DEFECTO);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const origenFueMapaRef = useRef(false);

  const buscarUbicacionEnMapa = async (textoRaw: string, signal?: AbortSignal) => {
    const consulta = textoRaw.trim();
    if (consulta.length < 2) {
      setBuscandoUbicacion(false);
      return;
    }

    // 1. Si el usuario pegó o escribió coordenadas "lat, lng"
    const coordsDirectas = parsearCoordenadas(consulta);
    if (coordsDirectas) {
      setUbicacion(coordsDirectas);
      setBuscandoUbicacion(false);
      return;
    }

    // 2. Si es dirección o barrio, geocodificar con Nominatim
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
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          imagenUrl: URL.createObjectURL(file),
        }));
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

    if (!formData.barrioSector.trim()) {
      setErrorValidacion(
        'Indica el barrio o dirección, o haz clic en el mapa para señalar la ubicación.'
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              Publica la información de tu mascota extraviada para alertar a la
              comunidad.
            </p>
          </div>
          <span className="self-start sm:self-center px-3 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-full border border-red-200">
            UI-002 • Dueño Autenticado
          </span>
        </div>

        {errorValidacion && (
          <div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="font-bold">Atención:</strong> {errorValidacion}
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
                1. Datos de la Mascota
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
                  placeholder="Ej. Bruno"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raza o Señas Particulares
              </label>
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
                Descripción
              </label>
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Nivel de Visibilidad
              </label>
              <div className="space-y-3">
                <div
                  onClick={() => setFormData((p) => ({ ...p, esTurbo: false }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    !formData.esTurbo
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        Estándar (Gratis)
                      </span>
                      <span className="text-xs text-slate-500">
                        Orden cronológico normal en el feed.
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
                    <div className="p-2 bg-amber-500 text-white rounded-lg">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 text-sm block">
                        Alerta Turbo
                      </span>
                      <span className="text-xs text-slate-600">
                        Prioridad máxima + QR imprimible. ($15.000 COP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Fotografía *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                {cargandoImagen ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <span className="text-xs font-medium">Subiendo foto...</span>
                  </div>
                ) : formData.imagenUrl ? (
                  <div className="relative">
                    <img
                      src={formData.imagenUrl}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, imagenUrl: null }))
                      }
                      className="mt-2 text-xs font-bold text-red-600 hover:underline"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer py-6 flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700">
                      Subir foto de la mascota
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
                  Última Ubicación *
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
                      placeholder="Dirección, barrio o coords (ej. 6.25, -75.56)"
                      value={formData.barrioSector}
                      onChange={handleChange}
                      onPaste={handlePasteDireccion}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => buscarUbicacionEnMapa(formData.barrioSector)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
                    title="Ubicar en el mapa"
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
                  <Zap className="w-4 h-4" /> Continuar a Pago e Impulsar
                </>
              ) : (
                'Publicar Reporte Estándar'
              )}
            </button>
          </div>
        </form>

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