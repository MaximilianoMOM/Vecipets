'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MapaSelectorDynamic } from '@/components/mapa/MapDynamicWrapper';
import { reportesAPI } from '@/lib/api-client';

export default function ReportarPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);

  // Campos del formulario
  const [titulo, setTitulo] = useState('');
  const [nombreMascota, setNombreMascota] = useState('');
  const [especie, setEspecie] = useState<'PERRO' | 'GATO' | 'OTRO'>('PERRO');
  const [tipo, setTipo] = useState<'PERDIDA' | 'HALLAZGO'>('PERDIDA');
  const [descripcion, setDescripcion] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [recompensa, setRecompensa] = useState('');

  // Foto y vista previa
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Coordenadas y dirección seleccionada
  const [latitud, setLatitud] = useState(4.6097);
  const [longitud, setLongitud] = useState(-74.0817);
  const [ubicacionText, setUbicacionText] = useState('Bogotá, Colombia');

  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const manejarUbicacionChange = (lat: number, lng: number, direccion?: string) => {
    setLatitud(lat);
    setLongitud(lng);
    if (direccion) {
      setUbicacionText(direccion);
    }
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !descripcion || !contactoTelefono) {
      mostrarToast('Por favor completa todos los campos requeridos.', 'advertencia');
      return;
    }

    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('nombreMascota', nombreMascota);
      formData.append('especie', especie);
      formData.append('tipo', tipo);
      formData.append('descripcion', descripcion);
      formData.append('contactoTelefono', contactoTelefono);
      formData.append('ubicacion', ubicacionText);
      formData.append('latitud', latitud.toString());
      formData.append('longitud', longitud.toString());
      if (recompensa) formData.append('recompensa', recompensa);
      if (fotoFile) formData.append('file', fotoFile);

      await reportesAPI.crearReporte(formData);
      mostrarToast('¡Reporte publicado exitosamente en la comunidad!', 'exito');
      router.push('/reportes');
    } catch (err: any) {
      mostrarToast(err.message || 'Error al enviar el reporte.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CABECERA DE LA PÁGINA */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-widest bg-white border border-slate-200 px-3.5 py-1 rounded-full shadow-xs">
            Formulario de Alerta
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Publicar un Nuevo Reporte
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Completa los siguientes datos para notificar a la comunidad en tiempo real.
          </p>
        </div>

        {/* INDICADOR DE PASOS */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-xs border border-slate-200 text-xs font-bold">
          <div className={`flex items-center gap-2 ${paso >= 1 ? 'text-[#5E7BC4]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${paso >= 1 ? 'bg-[#EEF2FC] text-[#5E7BC4]' : 'bg-slate-100'}`}>
              1
            </span>
            <span>Información Básica</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200" />
          <div className={`flex items-center gap-2 ${paso >= 2 ? 'text-[#5E7BC4]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${paso >= 2 ? 'bg-[#EEF2FC] text-[#5E7BC4]' : 'bg-slate-100'}`}>
              2
            </span>
            <span>Foto y Mapa</span>
          </div>
        </div>

        {/* CONTENEDOR DEL FORMULARIO MULTI-PASO */}
        <form onSubmit={manejarSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          
          {paso === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tipo de Alerta *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e: any) => setTipo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5E7BC4]"
                  >
                    <option value="PERDIDA">🚨 Mascota Perdida</option>
                    <option value="HALLAZGO">🔍 Mascota Encontrada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Especie *
                  </label>
                  <select
                    value={especie}
                    onChange={(e: any) => setEspecie(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5E7BC4]"
                  >
                    <option value="PERRO">🐶 Perro</option>
                    <option value="GATO">🐱 Gato</option>
                    <option value="OTRO">🐾 Otro animal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Título del Reporte *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Beagle perdido cerca a Parque Central"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nombre de la Mascota
                  </label>
                  <input
                    type="text"
                    value={nombreMascota}
                    onChange={(e) => setNombreMascota(e.target.value)}
                    placeholder="Ej. Bruno"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Descripción Detallada *
                </label>
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe color de pelaje, tamaño, accesorios (collar, plaquita), comportamiento y circunstancias."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recompensa Ofrecida (Opcional en $)
                </label>
                <input
                  type="number"
                  value={recompensa}
                  onChange={(e) => setRecompensa(e.target.value)}
                  placeholder="Ej. 100000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!titulo || !descripcion || !contactoTelefono) {
                    mostrarToast('Por favor diligencia los campos requeridos.', 'advertencia');
                    return;
                  }
                  setPaso(2);
                }}
                className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Siguiente: Cargar Foto y Ubicación</span>
                <span>→</span>
              </button>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-6 animate-fade-in">
              
              {/* SUBIDA DE ARCHIVO CON VISTA PREVIA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fotografía de la Mascota
                </label>

                {fotoPreview ? (
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                    <img src={fotoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoFile(null);
                        setFotoPreview(null);
                      }}
                      className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full font-bold text-xs shadow-md"
                    >
                      ✕ Cambiar Foto
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-[#5E7BC4] hover:bg-slate-50 transition-all p-4 text-center">
                    <span className="text-4xl mb-2">📸</span>
                    <span className="text-xs font-bold text-slate-700">Seleccionar imagen desde tu dispositivo</span>
                    <span className="text-[11px] text-slate-400 mt-1">Formato JPG, PNG o WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarSeleccionImagen}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* SELECTOR DE UBICACIÓN EN MAPA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ubicación Exacta en el Mapa (Clic o Búsqueda)
                </label>
                <div className="mb-2">
                  <input
                    type="text"
                    value={ubicacionText}
                    onChange={(e) => setUbicacionText(e.target.value)}
                    placeholder="Barrio, calle o referencia de ciudad..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  />
                </div>
                <MapaSelectorDynamic
                  latitud={latitud}
                  longitud={longitud}
                  onUbicacionChange={manejarUbicacionChange}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-2/3 bg-[#F3B26C] hover:bg-[#e29e54] text-slate-950 font-extrabold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <span>Publicando reporte...</span>
                  ) : (
                    <span>🚀 Publicar Reporte Ahora</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
}
