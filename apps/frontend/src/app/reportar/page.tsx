'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MapaSelectorDynamic } from '@/components/mapa/MapDynamicWrapper';
<<<<<<< HEAD
import BuscadorDireccion from '@/components/mapa/BuscadorDireccion';
import { reportesAPI } from '@/lib/api-client';
=======
import {
  reportesAPI,
  mascotasAPI,
  ubicacionesAPI,
  authAPI,
} from '@/lib/api-client';
>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb

export default function ReportarPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);

  // ============================================================
  // VERIFICACIÓN DE SESIÓN
  // ============================================================

  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('vecipets_access_token');

        if (!token) {
          router.replace('/login');
          return;
        }

        await authAPI.getPerfil();

        setVerificandoSesion(false);
      } catch (error) {
        console.error(
          '❌ No hay una sesión válida:',
          error,
        );

        localStorage.removeItem('token');
        localStorage.removeItem('vecipets_access_token');
        localStorage.removeItem('vecipets_user');

        router.replace('/login');
      }
    };

    verificarSesion();
  }, [router]);

  // ============================================================
  // CAMPOS DEL FORMULARIO
  // ============================================================

  const [titulo, setTitulo] = useState('');
  const [nombreMascota, setNombreMascota] = useState('');

  const [especie, setEspecie] =
    useState<'PERRO' | 'GATO' | 'OTRO'>('PERRO');

  const [tipo, setTipo] =
    useState<'PERDIDA' | 'HALLAZGO'>('PERDIDA');

  const [descripcion, setDescripcion] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [recompensa, setRecompensa] = useState('');

  // ============================================================
  // DATOS DE LA MASCOTA
  // ============================================================

  const [raza, setRaza] = useState('');
  const [edadAprox, setEdadAprox] = useState('');
  const [color, setColor] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');

  // ============================================================
  // FOTO Y VISTA PREVIA
  // ============================================================

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] =
    useState<string | null>(null);

  // ============================================================
  // UBICACIÓN
  // ============================================================

<<<<<<< HEAD
  // Coordenadas y dirección seleccionada (Medellín por defecto)
  const [latitud, setLatitud] = useState(6.2442);
  const [longitud, setLongitud] = useState(-75.5812);
  const [ubicacionText, setUbicacionText] = useState('Medellín, Antioquia, Colombia');
=======
  const [latitud, setLatitud] = useState(4.6097);
  const [longitud, setLongitud] = useState(-74.0817);
>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb

  const [ubicacionText, setUbicacionText] =
    useState('Bogotá, Colombia');

  // ============================================================
  // SELECCIONAR IMAGEN
  // ============================================================

  const manejarSeleccionImagen = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

<<<<<<< HEAD
  const manejarUbicacionChange = (lat: number, lng: number, direccion?: string) => {
    if (lat && lng) {
      setLatitud(lat);
      setLongitud(lng);
    }
=======
  // ============================================================
  // CAMBIO DE UBICACIÓN
  // ============================================================

  const manejarUbicacionChange = (
    lat: number,
    lng: number,
    direccion?: string,
  ) => {
    setLatitud(lat);
    setLongitud(lng);

>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb
    if (direccion) {
      setUbicacionText(direccion);
    }
  };

  // ============================================================
  // VALIDAR FORMULARIO
  // ============================================================

  const validarFormulario = () => {
    if (!titulo.trim()) {
      mostrarToast(
        'El título del reporte es obligatorio.',
        'advertencia',
      );
      return false;
    }

    if (!nombreMascota.trim()) {
      mostrarToast(
        'El nombre de la mascota es obligatorio.',
        'advertencia',
      );
      return false;
    }

    if (!raza.trim()) {
      mostrarToast(
        'La raza de la mascota es obligatoria.',
        'advertencia',
      );
      return false;
    }

    if (!edadAprox.trim()) {
      mostrarToast(
        'La edad aproximada es obligatoria.',
        'advertencia',
      );
      return false;
    }

    const edad = Number(edadAprox);

    if (!Number.isInteger(edad) || edad < 0) {
      mostrarToast(
        'La edad debe ser un número entero válido.',
        'advertencia',
      );
      return false;
    }

    if (!color.trim()) {
      mostrarToast(
        'El color de la mascota es obligatorio.',
        'advertencia',
      );
      return false;
    }

    if (!caracteristicas.trim()) {
      mostrarToast(
        'Las características de la mascota son obligatorias.',
        'advertencia',
      );
      return false;
    }

    if (!descripcion.trim()) {
      mostrarToast(
        'La descripción es obligatoria.',
        'advertencia',
      );
      return false;
    }

    if (!contactoTelefono.trim()) {
      mostrarToast(
        'El teléfono de contacto es obligatorio.',
        'advertencia',
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // CREAR REPORTE
  // ============================================================

  const manejarSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setPaso(1);
      return;
    }

    setCargando(true);

    try {
      // ======================================================
      // 1. VERIFICAR SESIÓN
      // ======================================================

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('vecipets_access_token');

      if (!token) {
        mostrarToast(
          'Tu sesión ha expirado. Inicia sesión nuevamente.',
          'advertencia',
        );

        router.replace('/login');
        return;
      }

      await authAPI.getPerfil();

      // ======================================================
      // 2. CREAR MASCOTA
      // ======================================================

      console.log('🐾 Creando mascota...');

      const mascota =
        await mascotasAPI.crearMascota({
          nombre: nombreMascota.trim(),

          especie: especie.trim(),

          raza: raza.trim(),

          edadAprox: Number(edadAprox),

          color: color.trim(),

          caracteristicas:
            caracteristicas.trim(),

          /*
           * El backend actual requiere fotoUrl.
           *
           * Por ahora usamos una imagen temporal.
           * La foto seleccionada por el usuario queda
           * como vista previa hasta integrar almacenamiento.
           */
          fotoUrl:
            'https://tse3.mm.bing.net/th/id/OIP.85RiBhs1U273Lokdg-oktQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
        });

      console.log(
        '✅ Mascota creada:',
        mascota,
      );

      if (!mascota?.id) {
        throw new Error(
          'No se recibió el ID de la mascota.',
        );
      }

      // ======================================================
      // 3. CREAR UBICACIÓN
      // ======================================================

      console.log('📍 Creando ubicación...');

      const ubicacion =
        await ubicacionesAPI.crearUbicacion({
          direccion:
            ubicacionText.trim() ||
            'Ubicación seleccionada en el mapa',

          comuna: 'No especificada',

          barrio: 'No especificado',

          latitud,

          longitud,
        });

      console.log(
        '✅ Ubicación creada:',
        ubicacion,
      );

      if (!ubicacion?.id) {
        throw new Error(
          'No se recibió el ID de la ubicación.',
        );
      }

      // ======================================================
      // 4. CREAR REPORTE
      // ======================================================

      console.log('🚨 Creando reporte...');

      const fechaAcontecimiento =
        new Date().toISOString();

      const reporte =
        await reportesAPI.crearReporte({
          mascotaId: mascota.id,

          ubicacionId: ubicacion.id,

          tipo,

          titulo: titulo.trim(),

          descripcion:
            descripcion.trim(),

          fechaAcontecimiento,
        });

      console.log(
        '✅ Reporte creado:',
        reporte,
      );

      // ======================================================
      // 5. ÉXITO
      // ======================================================

      mostrarToast(
        '¡Reporte publicado exitosamente en la comunidad!',
        'exito',
      );

      router.push('/reportes');
    } catch (err: any) {
      console.error(
        '❌ Error creando reporte:',
        err,
      );

      const mensaje =
        err?.message ||
        'Error al enviar el reporte.';

      // ======================================================
      // SESIÓN INVÁLIDA
      // ======================================================

      if (
        err?.status === 401 ||
        mensaje
          .toLowerCase()
          .includes('unauthorized') ||
        mensaje
          .toLowerCase()
          .includes('no autorizado')
      ) {
        localStorage.removeItem('token');

        localStorage.removeItem(
          'vecipets_access_token',
        );

        localStorage.removeItem(
          'vecipets_user',
        );

        mostrarToast(
          'Tu sesión ha expirado. Inicia sesión nuevamente.',
          'advertencia',
        );

        router.replace('/login');

        return;
      }

      mostrarToast(
        mensaje,
        'error',
      );
    } finally {
      setCargando(false);
    }
  };

  // ============================================================
  // VERIFICANDO SESIÓN
  // ============================================================

  if (verificandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="text-4xl mb-3">
            🔐
          </div>

          <p className="text-sm font-bold text-slate-700">
            Verificando sesión...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Por favor espera un momento.
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CABECERA */}

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

          <div
            className={`flex items-center gap-2 ${
              paso >= 1
                ? 'text-[#5E7BC4]'
                : 'text-slate-400'
            }`}
          >

            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                paso >= 1
                  ? 'bg-[#EEF2FC] text-[#5E7BC4]'
                  : 'bg-slate-100'
              }`}
            >
              1
            </span>

            <span>
              Información Básica
            </span>

          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div
            className={`flex items-center gap-2 ${
              paso >= 2
                ? 'text-[#5E7BC4]'
                : 'text-slate-400'
            }`}
          >

            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                paso >= 2
                  ? 'bg-[#EEF2FC] text-[#5E7BC4]'
                  : 'bg-slate-100'
              }`}
            >
              2
            </span>

            <span>
              Foto y Mapa
            </span>

          </div>

        </div>

        {/* FORMULARIO */}

        <form
          onSubmit={manejarSubmit}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6"
        >

          {/* ==================================================
              PASO 1
          ================================================== */}

          {paso === 1 && (

            <div className="space-y-5 animate-fade-in">

              {/* TIPO Y ESPECIE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tipo de Alerta *
                  </label>

                  <select
                    value={tipo}
                    onChange={(e) =>
                      setTipo(
                        e.target.value as
                          | 'PERDIDA'
                          | 'HALLAZGO',
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5E7BC4]"
                  >

                    <option value="PERDIDA">
                      🚨 Mascota Perdida
                    </option>

                    <option value="HALLAZGO">
                      🔍 Mascota Encontrada
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Especie *
                  </label>

                  <select
                    value={especie}
                    onChange={(e) =>
                      setEspecie(
                        e.target.value as
                          | 'PERRO'
                          | 'GATO'
                          | 'OTRO',
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5E7BC4]"
                  >

                    <option value="PERRO">
                      🐶 Perro
                    </option>

                    <option value="GATO">
                      🐱 Gato
                    </option>

                    <option value="OTRO">
                      🐾 Otro animal
                    </option>

                  </select>

                </div>

              </div>

              {/* TÍTULO */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Título del Reporte *
                </label>

                <input
                  type="text"
                  value={titulo}
                  onChange={(e) =>
                    setTitulo(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Beagle perdido cerca a Parque Central"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />

              </div>

              {/* NOMBRE Y TELÉFONO */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nombre de la Mascota *
                  </label>

                  <input
                    type="text"
                    value={nombreMascota}
                    onChange={(e) =>
                      setNombreMascota(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Bruno"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                    required
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Teléfono de Contacto *
                  </label>

                  <input
                    type="tel"
                    value={contactoTelefono}
                    onChange={(e) =>
                      setContactoTelefono(
                        e.target.value,
                      )
                    }
                    placeholder="+57 300 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                    required
                  />

                </div>

              </div>

              {/* RAZA Y EDAD */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Raza *
                  </label>

                  <input
                    type="text"
                    value={raza}
                    onChange={(e) =>
                      setRaza(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Golden Retriever"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                    required
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Edad aproximada *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={edadAprox}
                    onChange={(e) =>
                      setEdadAprox(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. 3"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                    required
                  />

                </div>

              </div>

              {/* COLOR */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Color *
                </label>

                <input
                  type="text"
                  value={color}
                  onChange={(e) =>
                    setColor(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Dorado"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />

              </div>

              {/* CARACTERÍSTICAS */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Características *
                </label>

                <textarea
                  rows={3}
                  value={caracteristicas}
                  onChange={(e) =>
                    setCaracteristicas(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Collar rojo, tamaño mediano, tranquila y amigable."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />

              </div>

              {/* DESCRIPCIÓN */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Descripción Detallada *
                </label>

                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value,
                    )
                  }
                  placeholder="Describe color de pelaje, tamaño, accesorios, comportamiento y circunstancias."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                  required
                />

              </div>

              {/* RECOMPENSA */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recompensa Ofrecida (Opcional en $)
                </label>

                <input
                  type="number"
                  min="0"
                  value={recompensa}
                  onChange={(e) =>
                    setRecompensa(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. 100000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />

              </div>

              {/* SIGUIENTE */}

              <button
                type="button"
                onClick={() => {

                  if (validarFormulario()) {
                    setPaso(2);
                  }

                }}
                className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >

                <span>
                  Siguiente: Cargar Foto y Ubicación
                </span>

                <span>
                  →
                </span>

              </button>

            </div>
          )}

          {/* ==================================================
              PASO 2
          ================================================== */}

          {paso === 2 && (

            <div className="space-y-6 animate-fade-in">

              {/* FOTO */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fotografía de la Mascota
                </label>

                {fotoPreview ? (

                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">

                    <img
                      src={fotoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {

                        if (fotoPreview) {
                          URL.revokeObjectURL(
                            fotoPreview,
                          );
                        }

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

                    <span className="text-4xl mb-2">
                      📸
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      Seleccionar imagen desde tu dispositivo
                    </span>

                    <span className="text-[11px] text-slate-400 mt-1">
                      Formato JPG, PNG o WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        manejarSeleccionImagen
                      }
                      className="hidden"
                    />

                  </label>

                )}

                <p className="text-[11px] text-slate-400 mt-2">
                  La fotografía seleccionada se muestra como
                  vista previa. La integración del almacenamiento
                  permanente de imágenes se realizará cuando
                  el backend tenga configurado dicho servicio.
                </p>

              </div>

<<<<<<< HEAD
              {/* SELECTOR DE UBICACIÓN Y BÚSQUEDA POR DIRECCIÓN */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    📍 Dirección y Ubicación en el Mapa (Medellín) *
                  </label>
                  <span className="text-[11px] font-extrabold text-[#5E7BC4] bg-[#EEF2FC] px-2.5 py-0.5 rounded-full">
                    Medellín, CO
                  </span>
                </div>
                
                <BuscadorDireccion
                  direccionInicial={ubicacionText}
                  onSeleccionarUbicacion={(lat, lng, direccion) => {
                    manejarUbicacionChange(lat, lng, direccion);
                  }}
                />

                <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <MapaSelectorDynamic
                    latitud={latitud}
                    longitud={longitud}
                    onUbicacionChange={manejarUbicacionChange}
=======
              {/* UBICACIÓN */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ubicación Exacta en el Mapa (Clic o Búsqueda)
                </label>

                <div className="mb-2">

                  <input
                    type="text"
                    value={ubicacionText}
                    onChange={(e) =>
                      setUbicacionText(
                        e.target.value,
                      )
                    }
                    placeholder="Barrio, calle o referencia de ciudad..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb
                  />

                </div>
<<<<<<< HEAD
=======

                <MapaSelectorDynamic
                  latitud={latitud}
                  longitud={longitud}
                  onUbicacionChange={
                    manejarUbicacionChange
                  }
                />

>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb
              </div>

              {/* BOTONES */}

              <div className="flex gap-4 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  disabled={cargando}
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
                    <span>
                      Publicando reporte...
                    </span>
                  ) : (
                    <span>
                      🚀 Publicar Reporte Ahora
                    </span>
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