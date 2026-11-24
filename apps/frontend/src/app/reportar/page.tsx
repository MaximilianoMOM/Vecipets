'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  X,
  Search,
  Crosshair,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import CheckoutTurboModal from './reportes/CheckoutTurboModal';

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

export default function ReportarPage() {
  const router = useRouter();
  const { user, loading: cargandoUsuario } = useAuth();

  const [formData, setFormData] = useState({
    tipo: 'PERDIDA' as 'PERDIDA' | 'HALLAZGO',
    nombre: '',
    especie: 'Perro' as 'Perro' | 'Gato' | 'Otro',
    raza: '',
    descripcion: '',
    fecha: '',
    barrioSector: '',
    direccion: '',
    referencia: '',
    recompensa: '',
    esTurbo: false,
  });

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);

  const [ubicacion, setUbicacion] = useState<Coordenadas>(COORDENADAS_DEFECTO);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Modal Checkout Wompi Turbo
  const [reporteCreadoId, setReporteCreadoId] = useState<number | null>(null);
  const [modalTurboAbierto, setModalTurboAbierto] = useState(false);

  const origenFueMapaRef = useRef(false);

  useEffect(() => {
    setFormData((prev) =>
      prev.fecha ? prev : { ...prev, fecha: new Date().toISOString().split('T')[0] }
    );
  }, []);

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
        console.error('Error buscando ubicación en mapa:', err);
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
    }, 600);

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
      setFormData((prev) => ({
        ...prev,
        barrioSector: direccion.trim(),
        direccion: direccion.trim(),
      }));
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
        setFormData((prev) => ({
          ...prev,
          barrioSector: legible,
          direccion: data?.display_name || legible,
        }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorValidacion('La imagen no puede pesar más de 5 MB.');
        return;
      }
      setArchivoSeleccionado(file);
      setPreviewImagen(URL.createObjectURL(file));
      setErrorValidacion(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);
    setMensajeExito(null);

    if (!user) {
      setErrorValidacion('Debes iniciar sesión con tu cuenta de ciudadano para publicar un reporte.');
      return;
    }

    if (user.rol !== 'CIUDADANO') {
      setErrorValidacion('Solo los usuarios con rol CIUDADANO pueden crear reportes.');
      return;
    }

    if (!archivoSeleccionado) {
      setErrorValidacion('La fotografía de la mascota es obligatoria para el análisis con Google Vision.');
      return;
    }

    if (!formData.barrioSector.trim()) {
      setErrorValidacion('Debes indicar el barrio o sector del suceso o señalarlo en el mapa.');
      return;
    }

    setEnviando(true);

    try {
      const data = new FormData();
      data.append('imagen', archivoSeleccionado);
      data.append('tipo', formData.tipo);
      data.append('nombre', formData.nombre.trim());
      data.append('especie', formData.especie);
      if (formData.raza.trim()) data.append('raza', formData.raza.trim());
      data.append('descripcion', formData.descripcion.trim());
      data.append('fechaEvento', formData.fecha);
      data.append('barrioSector', formData.barrioSector.trim());
      if (formData.direccion.trim()) data.append('direccion', formData.direccion.trim());
      if (formData.referencia.trim()) data.append('referencia', formData.referencia.trim());
      if (formData.recompensa.trim()) data.append('recompensa', formData.recompensa.trim());
      data.append('latitud', ubicacion.lat.toString());
      data.append('longitud', ubicacion.lng.toString());

      const res = await apiClient.post('/reportes', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const reporteId = res.data?.reporte?.id;
      const estadoReporte = res.data?.validacion?.estadoReporte;
      const mensajeBackend = res.data?.mensaje || 'Reporte registrado con éxito.';

      setEnviando(false);

      if (formData.esTurbo && estadoReporte === 'PUBLICO' && reporteId) {
        // Reporte aprobado con opción Turbo seleccionada: abrir modal oficial de Wompi
        setReporteCreadoId(reporteId);
        setModalTurboAbierto(true);
      } else {
        setMensajeExito(mensajeBackend);
        setTimeout(() => {
          router.push('/reportes');
        }, 2200);
      }
    } catch (err: any) {
      setEnviando(false);
      console.error('Error al enviar reporte:', err);
      const mensaje =
        err.response?.data?.message ||
        'Ocurrió un error al procesar el reporte. Verifica la información e intenta nuevamente.';
      setErrorValidacion(mensaje);
    }
  };

  if (!cargandoUsuario && !user) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-sm border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Inicio de Sesión Requerido</h2>
          <p className="text-xs text-slate-600">
            Para publicar una mascota perdida o encontrada y proteger la veracidad de la comunidad, debes tener una cuenta ciudadana verificada.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
            >
              Crear Cuenta Ciudadana
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/reportes"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver a los reportes
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              🚨 Registrar Reporte de Mascota
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Publicación automática tras verificación de fotografía con Google Cloud Vision.
            </p>
          </div>

          <span className="self-start sm:self-center px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
            {user?.nombre ? `Sesión: ${user.nombre}` : 'Ciudadano Autenticado'}
          </span>
        </div>

        {errorValidacion && (
          <div
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-sm text-rose-800 text-xs font-semibold"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Atención:</strong> {errorValidacion}
            </div>
          </div>
        )}

        {mensajeExito && (
          <div
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-sm text-emerald-800 text-xs font-semibold"
            role="alert"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">¡Éxito!</strong> {mensajeExito} Redirigiendo al feed de la comunidad...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Datos del Caso y de la Mascota
              </h2>
            </div>

            {/* Selector de Tipo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipo de Reporte *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, tipo: 'PERDIDA' }))}
                  className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${
                    formData.tipo === 'PERDIDA'
                      ? 'border-rose-500 bg-rose-50 text-rose-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🔴 Mascota Perdida
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, tipo: 'HALLAZGO', esTurbo: false }))}
                  className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${
                    formData.tipo === 'HALLAZGO'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🟢 Mascota Encontrada
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Mascota *
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej. Bruno o Sin Identificar"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                  <option value="Otro">🐾 Otro animal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raza (Opcional)
                </label>
                <input
                  name="raza"
                  type="text"
                  placeholder="Ej. Golden Retriever / Mestizo"
                  value={formData.raza}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha del Evento *
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Detallada *
              </label>
              <textarea
                name="descripcion"
                rows={3}
                required
                placeholder="Indica cómo ocurrió, collar, marcas corporales, señas particulares y recomendaciones..."
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
              />
            </div>

            {/* Opción Alerta Turbo solo para mascotas perdidas */}
            {formData.tipo === 'PERDIDA' && (
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  2. Impulso Comunitario (Opcional)
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  <div
                    onClick={() => setFormData((p) => ({ ...p, esTurbo: false }))}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      !formData.esTurbo
                        ? 'border-emerald-600 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Publicación Estándar (Gratis)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Aparece inmediatamente en el feed y en el mapa.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData((p) => ({ ...p, esTurbo: true }))}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      formData.esTurbo
                        ? 'border-amber-500 bg-amber-50/60'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-950 text-xs block">
                          Activar Alerta Turbo 🚀 ($15.000 COP)
                        </span>
                        <span className="text-[11px] text-slate-600">
                          Prioridad número 1 durante 7 días continuos en mapa y feed.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campo opcional de recompensa */}
            <div className="pt-3 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Recompensa (Opcional)
              </span>
              <div className="flex items-center gap-2">
                <input
                  name="recompensa"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.recompensa}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-xs text-slate-500">COP</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Monto opcional que se ofrecerá a quien ayude a encontrar a tu
                mascota.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Fotografía de la mascota */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fotografía de la Mascota *
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Validación Vision
                </span>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                {previewImagen ? (
                  <div className="relative">
                    <img
                      src={previewImagen}
                      alt="Vista previa"
                      className="w-full h-44 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setArchivoSeleccionado(null);
                        setPreviewImagen(null);
                      }}
                      className="mt-2 text-xs font-bold text-rose-600 hover:underline"
                    >
                      Cambiar fotografía
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer py-6 flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700">
                      Seleccionar imagen (JPG, PNG, WEBP)
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Máximo 5 MB. Pasará por Google Cloud Vision antes de publicarse.
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Ubicación y Mapa */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ubicación del Suceso *
                </span>
                {buscandoUbicacion && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
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
                      placeholder="Ej. Laureles, Belén, Poblado..."
                      value={formData.barrioSector}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => buscarUbicacionEnMapa(formData.barrioSector)}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Haz clic en el mapa para marcar el punto exacto.</span>
                </p>

                <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                  <MapaInteractivo
                    lat={ubicacion.lat}
                    lng={ubicacion.lng}
                    etiqueta={formData.barrioSector || 'Ubicación'}
                    onSeleccionarUbicacion={handleSeleccionDesdeMapa}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className={`w-full py-4 px-6 rounded-xl font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${
                formData.esTurbo
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando con Google Vision...
                </>
              ) : formData.esTurbo ? (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Publicar y Continuar a Wompi
                </>
              ) : (
                'Publicar Reporte'
              )}
            </button>
          </div>
        </form>

        {/* Modal de Alerta Turbo conectado con Wompi */}
        {reporteCreadoId && (
          <CheckoutTurboModal
            isOpen={modalTurboAbierto}
            onClose={() => {
              setModalTurboAbierto(false);
              router.push('/mis-reportes');
            }}
            onSuccess={() => {
              setModalTurboAbierto(false);
              setMensajeExito(
                'Redirigiendo a Wompi para completar el pago de tu Alerta Turbo...'
              );
            }}
            reporteId={reporteCreadoId}
            nombreMascota={formData.nombre}
          />
        )}
      </div>
    </main>
  );
}
