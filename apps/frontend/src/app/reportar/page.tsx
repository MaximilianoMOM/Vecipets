'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import {
  Camera,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Zap,
  CheckCircle2,
  X,
  Search,
  Crosshair,
} from 'lucide-react';

import apiClient from '@/lib/api-client';
import { abrirCheckoutWompi } from '@/lib/wompi-checkout';
import { locate } from '@/lib/geocoding';
import { useAuth } from '@/lib/auth-context';
import { leerCoordenadas } from '@/lib/reportes-mapa';

import {
  buscarDireccion,
  comprobarPunto,
  dentroDelArea,
  municipioValleDeAburra,
  municipiosValleDeAburra,
  type Coordenadas,
  type ResultadoUbicacion,
} from '@/lib/ubicacion-reporte';

import type {
  MapaInteractivoProps,
  SeleccionMapa,
} from '../components/map/MapaInteractivo';

// ======================================================
// MAPA INTERACTIVO
// ======================================================

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

const COORDENADAS_DEFECTO: Coordenadas = {
  lat: 6.2442,
  lng: -75.5812,
};

function obtenerUrlImagen(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return `${apiUrl.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ======================================================
// FORMULARIO PRINCIPAL
// ======================================================

function FormularioReportarContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ======================================================
  // ESTADOS DEL FORMULARIO
  // ======================================================

  const [formData, setFormData] = useState({
    tipo: 'PERDIDA' as 'PERDIDA' | 'HALLAZGO',
    nombre: '',
    especie: 'Perro' as 'Perro' | 'Gato' | 'Otro',
    raza: '',
    color: '',
    tamano: '',
    sexo: '',
    edad: '',
    descripcion: '',
    fecha: '',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    barrioSector: '',
    direccion: '',
    referencia: '',
    recompensa: '',
    esTurbo: false,
  });

  const [archivoSeleccionado, setArchivoSeleccionado] =
    useState<File | null>(null);

  const [previewImagen, setPreviewImagen] =
    useState<string | null>(null);

  const [ubicacion, setUbicacion] = useState<
    (Coordenadas & { municipioVerificado?: string; edicionManual?: boolean }) | null
  >(null);

  const puntoPendiente =
    ubicacion && !ubicacion.municipioVerificado && dentroDelArea(ubicacion)
      ? ubicacion
      : null;

  const [resultadosUbicacion, setResultadosUbicacion] =
    useState<ResultadoUbicacion[]>([]);

  const [mensajeUbicacion, setMensajeUbicacion] = useState('');

  const [buscandoUbicacion, setBuscandoUbicacion] =
    useState(false);

  const [errorValidacion, setErrorValidacion] =
    useState<string | null>(null);

  const [mensajeExito, setMensajeExito] =
    useState<string | null>(null);

  const [enviando, setEnviando] = useState(false);

  // ======================================================
  // ESTADOS DE WOMPI Y BORRADORES
  // ======================================================

  const [borradorId, setBorradorId] =
    useState<number | null>(null);

  const [pagoAprobado, setPagoAprobado] = useState(false);

  const [mensajePago, setMensajePago] =
    useState<string | null>(null);

  const [verificandoPago, setVerificandoPago] =
    useState(false);

  const consultaUbicacion =
    useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      consultaUbicacion.current?.abort();
    };
  }, []);

  useEffect(() => {
    setFormData((prev) =>
      prev.fecha
        ? prev
        : {
            ...prev,
            fecha: new Date().toISOString().split('T')[0],
          }
    );
  }, []);

  // ======================================================
  // RECUPERAR BORRADOR Y VERIFICAR PAGO WOMPI
  // ======================================================

  useEffect(() => {
    let cancelado = false;

    const recuperarBorradorYPago = async () => {
      const urlBorradorId = searchParams.get('borradorId');

      const urlTransaccionId = searchParams.get('id');

      const savedBorradorId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('vecipets_borrador_id')
          : null;

      let targetBorradorId =
        urlBorradorId || savedBorradorId;

      if (!urlTransaccionId && !targetBorradorId) {
        return;
      }

      setVerificandoPago(true);

      try {
        // Verificar la transacción retornada por Wompi.

        if (urlTransaccionId) {
          try {
            const res = await apiClient.post(
              '/pagos/verificar-transaccion',
              {
                transactionId: urlTransaccionId,
                reporteId: targetBorradorId
                  ? Number(targetBorradorId)
                  : undefined,
              }
            );

            if (cancelado) return;

            if (res.data?.aprobado) {
              setPagoAprobado(true);

              setMensajePago(
                'Pago aprobado. Tu Alerta Turbo está confirmada.'
              );

              if (res.data?.reporteId) {
                targetBorradorId = String(
                  res.data.reporteId
                );

                setBorradorId(
                  Number(res.data.reporteId)
                );

                sessionStorage.setItem(
                  'vecipets_borrador_id',
                  targetBorradorId
                );
              }
            } else {
              setErrorValidacion(
                res.data?.mensaje ||
                  'La transacción no fue aprobada por Wompi. Tu información sigue guardada.'
              );
            }
          } catch (err) {
            if (!cancelado) {
              console.error(
                'Error al verificar transacción de Wompi:',
                err
              );

              setErrorValidacion(
                'No fue posible confirmar automáticamente la transacción con Wompi.'
              );
            }
          }
        }

        if (cancelado) return;

        // Recuperar información completa del borrador.

        const idParaCargar = targetBorradorId;

        if (
          idParaCargar &&
          Number.isInteger(Number(idParaCargar)) &&
          Number(idParaCargar) > 0
        ) {
          try {
            const resReporte = await apiClient.get(
              `/reportes/${idParaCargar}`
            );

            const rep =
              resReporte.data?.reporte ??
              resReporte.data;

            if (!rep || cancelado) return;

            const municipio = municipioValleDeAburra(
              rep.ciudad || ''
            );

            setBorradorId(Number(rep.id));

            setFormData({
              tipo: rep.tipo || 'PERDIDA',
              nombre: rep.nombre || '',
              especie: rep.especie || 'Perro',
              raza: rep.raza || '',
              color: rep.color || '',
              tamano: rep.tamano || '',
              sexo: rep.sexo || '',
              edad: rep.edad || '',
              descripcion: rep.descripcion || '',
              fecha: rep.fechaEvento
                ? String(rep.fechaEvento).split('T')[0]
                : '',
              departamento: 'Antioquia',
              ciudad: municipio ?? 'Medellín',
              barrioSector: rep.barrioSector || '',
              direccion: rep.direccion || '',
              referencia: rep.referencia || '',
              recompensa: rep.recompensa
                ? String(rep.recompensa)
                : '',
              esTurbo: true,
            });

            const punto = leerCoordenadas(
              rep.latitud,
              rep.longitud
            );

            invalidarUbicacion();
            if (punto && dentroDelArea(punto)) {
              setUbicacion(punto);
              setMensajeUbicacion(
                'Verifica el municipio del punto guardado antes de enviar el reporte.'
              );
            }

            if (rep.imagenUrl) {
              setPreviewImagen(
                obtenerUrlImagen(rep.imagenUrl)
              );
            }

            // Consultar si el borrador tiene un pago aprobado.

            if (!urlTransaccionId) {
              try {
                const resPago = await apiClient.post(
                  '/pagos/verificar-transaccion',
                  {
                    reporteId: rep.id,
                  }
                );

                if (
                  !cancelado &&
                  resPago.data?.aprobado
                ) {
                  setPagoAprobado(true);

                  setMensajePago(
                    'Pago aprobado. Tu Alerta Turbo está confirmada.'
                  );
                }
              } catch {
                // El borrador puede no tener un pago aprobado.
              }
            }
          } catch (err) {
            if (!cancelado) {
              console.warn(
                'No se pudo cargar el borrador previo:',
                err
              );

              setErrorValidacion(
                'No fue posible recuperar el borrador. Intenta nuevamente antes de realizar otro pago.'
              );
            }
          }
        }
      } finally {
        if (!cancelado) {
          setVerificandoPago(false);
        }
      }
    };

    void recuperarBorradorYPago();

    return () => {
      cancelado = true;
    };
  }, [searchParams]);

  // ======================================================
  // INVALIDAR UBICACIÓN ANTERIOR
  // ======================================================

  function invalidarUbicacion() {
    consultaUbicacion.current?.abort();

    consultaUbicacion.current = null;

    setBuscandoUbicacion(false);
    setUbicacion(null);
    setResultadosUbicacion([]);
    setMensajeUbicacion('');
  }

  // ======================================================
  // CONSULTAR UBICACIÓN
  // ======================================================

  async function consultarUbicacion(
    busqueda: (signal: AbortSignal) => Promise<void>
  ) {
    invalidarUbicacion();

    const peticion = new AbortController();

    consultaUbicacion.current = peticion;

    setBuscandoUbicacion(true);
    setErrorValidacion(null);

    const limiteDeEspera = window.setTimeout(() => {
      if (consultaUbicacion.current === peticion) {
        setMensajeUbicacion(
          'La búsqueda tardó demasiado. Intenta de nuevo.'
        );

        peticion.abort();

        consultaUbicacion.current = null;

        setBuscandoUbicacion(false);
      }
    }, 15000);

    try {
      await busqueda(peticion.signal);
    } catch (error) {
      if (!peticion.signal.aborted) {
        setMensajeUbicacion(
          error instanceof Error
            ? error.message
            : 'No pudimos comprobar la ubicación. Intenta de nuevo.'
        );
      }
    } finally {
      window.clearTimeout(limiteDeEspera);

      if (consultaUbicacion.current === peticion) {
        consultaUbicacion.current = null;

        setBuscandoUbicacion(false);
      }
    }
  }

  // ======================================================
  // BUSCAR DIRECCIÓN EN EL MAPA
  // ======================================================

  function reintentarVerificacion() {
    if (puntoPendiente) {
      void consultarUbicacion((signal) =>
        verificarPunto(puntoPendiente, signal, true)
      );
    }
  }

  function buscarUbicacionEnMapa() {
    const {
      barrioSector,
      direccion,
      ciudad,
    } = formData;

    if (
      !barrioSector.trim() &&
      !direccion.trim()
    ) {
      setMensajeUbicacion(
        'Escribe el barrio o la dirección para buscar.'
      );

      return;
    }

    void consultarUbicacion(async (signal) => {
      const resultados = await buscarDireccion(
        barrioSector,
        direccion,
        ciudad,
        signal
      );

      if (signal.aborted) return;

      setResultadosUbicacion(resultados);

      setMensajeUbicacion(
        resultados.length
          ? 'Selecciona una coincidencia y comprueba el punto en el mapa.'
          : 'No se encontró esa dirección en el municipio elegido. Revisa los datos o marca el punto en el mapa.'
      );
    });
  }

  // ======================================================
  // CONFIRMAR PUNTO GEOGRÁFICO
  // ======================================================

  function confirmarPunto(
    resultado: ResultadoUbicacion,
    desdeMapa: boolean,
    conservarTexto = false
  ) {
    if (
      !dentroDelArea(resultado) ||
      !municipioValleDeAburra(resultado.municipio)
    ) {
      setUbicacion(null);

      setMensajeUbicacion(
        'La ubicación debe estar dentro del Valle de Aburrá.'
      );

      return;
    }

    setUbicacion({
      lat: resultado.lat,
      lng: resultado.lng,
      municipioVerificado: resultado.municipio,
      edicionManual: conservarTexto || !resultado.barrio || !resultado.direccion,
    });

    setResultadosUbicacion([]);
    setErrorValidacion(null);

    setMensajeUbicacion(
      `Punto seleccionado en ${resultado.municipio}. Puedes ajustarlo en el mapa.`
    );

    setFormData((prev) => ({
      ...prev,

      ciudad: resultado.municipio,

      barrioSector: (
        desdeMapa && !conservarTexto && prev.barrioSector === formData.barrioSector
          ? resultado.barrio || prev.barrioSector
          : prev.barrioSector || resultado.barrio
      ).slice(0, 150),

      direccion: (
        desdeMapa && !conservarTexto && prev.direccion === formData.direccion
          ? resultado.direccion || prev.direccion
          : prev.direccion || resultado.direccion
      ).slice(0, 200),
    }));
  }

  // ======================================================
  // SELECCIONAR O MOVER MARCADOR
  // ======================================================

  async function verificarPunto(
    punto: Coordenadas,
    signal: AbortSignal,
    conservarTexto = false
  ) {
    if (signal.aborted) return;

    // El marcador conserva sus coordenadas mientras se verifica el municipio.
    setUbicacion({ lat: punto.lat, lng: punto.lng });

    if (!dentroDelArea(punto)) {
      setMensajeUbicacion(
        'La ubicación debe estar dentro del Valle de Aburrá. Selecciona otro punto.'
      );
      return;
    }

    try {
      const resultado = await comprobarPunto(punto, signal);
      if (signal.aborted) return;

      if (resultado) {
        confirmarPunto(resultado, true, conservarTexto);
        return;
      }
    } catch {
      if (signal.aborted) return;
    }

    setMensajeUbicacion(
      'No se pudo verificar que el punto esté en un municipio del Valle de Aburrá. Puedes escribir el barrio y la dirección, y reintentar la verificación antes de publicar.'
    );
  }

  function handleSeleccionDesdeMapa(seleccion: SeleccionMapa) {
    void consultarUbicacion((signal) => verificarPunto(seleccion, signal));
  }

  // ======================================================
  // OBTENER MI UBICACIÓN ACTUAL
  // ======================================================

  function obtenerMiUbicacion() {
    void consultarUbicacion(async (signal) => {
      const punto = await locate();
      await verificarPunto(punto, signal);
    });
  }

  // ======================================================
  // CAMBIOS EN EL FORMULARIO
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const cambiaDireccion = name === 'barrioSector' || name === 'direccion';
    const permiteEdicionManual = ubicacion &&
      (!ubicacion.municipioVerificado || ubicacion.edicionManual);

    if (
      name === 'ciudad' ||
      name === 'departamento' ||
      (cambiaDireccion && !permiteEdicionManual)
    ) {
      invalidarUbicacion();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorValidacion) {
      setErrorValidacion(null);
    }
  };

  // ======================================================
  // CARGAR FOTOGRAFÍA
  // ======================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formatosPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!formatosPermitidos.includes(file.type)) {
      setErrorValidacion(
        'Solo se permiten imágenes JPG, PNG o WEBP.'
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorValidacion(
        'La imagen no puede pesar más de 5 MB.'
      );

      return;
    }

    setArchivoSeleccionado(file);
    setPreviewImagen(URL.createObjectURL(file));
    setErrorValidacion(null);
  };

  useEffect(() => {
    return () => {
      if (previewImagen?.startsWith('blob:')) {
        URL.revokeObjectURL(previewImagen);
      }
    };
  }, [previewImagen]);

  // ======================================================
  // ENVIAR FORMULARIO
  // ======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      enviando ||
      verificandoPago ||
      buscandoUbicacion ||
      mensajeExito
    ) {
      return;
    }

    setErrorValidacion(null);
    setMensajeExito(null);

    if (!user) {
      setErrorValidacion(
        'Debes iniciar sesión con tu cuenta de ciudadano para publicar un reporte.'
      );

      return;
    }

    if (user.rol !== 'CIUDADANO') {
      setErrorValidacion(
        'Solo los usuarios con rol CIUDADANO pueden crear reportes.'
      );

      return;
    }

    if (!archivoSeleccionado && !previewImagen) {
      setErrorValidacion(
        'La fotografía de la mascota es obligatoria.'
      );

      return;
    }

    if (!formData.barrioSector.trim()) {
      setErrorValidacion(
        'Debes indicar el barrio o sector del suceso o señalarlo en el mapa.'
      );

      return;
    }

    if (
      !ubicacion ||
      buscandoUbicacion ||
      !dentroDelArea(ubicacion) ||
      !ubicacion.municipioVerificado ||
      ubicacion.municipioVerificado !== municipioValleDeAburra(formData.ciudad)
    ) {
      setErrorValidacion(
        'Confirma un punto en el mapa dentro del Valle de Aburrá antes de enviar el reporte.'
      );

      return;
    }

    setEnviando(true);

    try {
      // ==================================================
      // CASO 1: ALERTA TURBO PENDIENTE DE PAGO
      // ==================================================

      if (formData.esTurbo && !pagoAprobado) {
        const data = new FormData();

        if (archivoSeleccionado) {
          data.append('imagen', archivoSeleccionado);
        }

        data.append('tipo', formData.tipo);

        data.append(
          'nombre',
          formData.nombre.trim()
        );

        data.append('especie', formData.especie);

        if (formData.raza.trim()) {
          data.append('raza', formData.raza.trim());
        }

        if (formData.color.trim()) {
          data.append('color', formData.color.trim());
        }

        if (formData.tamano.trim()) {
          data.append('tamano', formData.tamano.trim());
        }

        if (formData.sexo.trim()) {
          data.append('sexo', formData.sexo.trim());
        }

        if (formData.edad.trim()) {
          data.append('edad', formData.edad.trim());
        }

        data.append(
          'descripcion',
          formData.descripcion.trim()
        );

        data.append(
          'fechaEvento',
          formData.fecha
        );

        data.append(
          'barrioSector',
          formData.barrioSector.trim()
        );

        if (formData.departamento.trim()) {
          data.append(
            'departamento',
            formData.departamento.trim()
          );
        }

        if (formData.ciudad.trim()) {
          data.append(
            'ciudad',
            formData.ciudad.trim()
          );
        }

        if (formData.direccion.trim()) {
          data.append(
            'direccion',
            formData.direccion.trim()
          );
        }

        if (formData.referencia.trim()) {
          data.append(
            'referencia',
            formData.referencia.trim()
          );
        }

        if (formData.recompensa.trim()) {
          data.append(
            'recompensa',
            formData.recompensa.trim()
          );
        }

        data.append(
          'latitud',
          ubicacion.lat.toString()
        );

        data.append(
          'longitud',
          ubicacion.lng.toString()
        );

        data.append('esTurbo', 'true');

        if (borradorId) {
          data.append(
            'borradorId',
            String(borradorId)
          );
        }

        const resBorrador = await apiClient.post(
          '/reportes/borrador',
          data
        );

        const nuevoBorradorId =
          resBorrador.data?.borradorId ||
          resBorrador.data?.reporte?.id;

        const checkoutUrlRecibida =
          resBorrador.data?.checkoutUrl;

        if (nuevoBorradorId) {
          setBorradorId(
            Number(nuevoBorradorId)
          );

          sessionStorage.setItem(
            'vecipets_borrador_id',
            String(nuevoBorradorId)
          );
        }

        if (
          checkoutUrlRecibida &&
          typeof checkoutUrlRecibida === 'string'
        ) {
          await abrirCheckoutWompi(
            checkoutUrlRecibida,
            '/reportar'
          );

          return;
        }

        throw new Error(
          'No se recibió la URL de pago de Wompi.'
        );
      }

      // ==================================================
      // CASO 2: PUBLICAR BORRADOR
      // ==================================================

      if (borradorId) {
        const resPublicacion = await apiClient.post(
          `/reportes/${borradorId}/publicar`,
          {
            tipo: formData.tipo,

            nombre: formData.nombre.trim(),

            especie: formData.especie,

            raza: formData.raza.trim() || null,

            color: formData.color.trim() || null,

            tamano: formData.tamano.trim() || null,

            sexo: formData.sexo.trim() || null,

            edad: formData.edad.trim() || null,

            descripcion: formData.descripcion.trim(),

            fechaEvento: formData.fecha,

            barrioSector:
              formData.barrioSector.trim(),

            departamento:
              formData.departamento.trim() || null,

            ciudad:
              formData.ciudad.trim() || null,

            direccion:
              formData.direccion.trim() || null,

            referencia:
              formData.referencia.trim() || null,

            latitud: String(ubicacion.lat),

            longitud: String(ubicacion.lng),

            recompensa:
              formData.recompensa.trim() || null,
          }
        );

        sessionStorage.removeItem(
          'vecipets_borrador_id'
        );

        setMensajeExito(
          resPublicacion.data?.mensaje ||
            '¡Reporte recibido con éxito! Ha quedado pendiente de aprobación por el administrador.'
        );

        setTimeout(() => {
          router.push('/mis-reportes');
        }, 2200);
      } else {
        // ================================================
        // CASO 3: PUBLICACIÓN ESTÁNDAR GRATUITA
        // ================================================

        const data = new FormData();

        if (archivoSeleccionado) {
          data.append('imagen', archivoSeleccionado);
        }

        data.append('tipo', formData.tipo);

        data.append(
          'nombre',
          formData.nombre.trim()
        );

        data.append('especie', formData.especie);

        if (formData.raza.trim()) {
          data.append('raza', formData.raza.trim());
        }

        if (formData.color.trim()) {
          data.append('color', formData.color.trim());
        }

        if (formData.tamano.trim()) {
          data.append('tamano', formData.tamano.trim());
        }

        if (formData.sexo.trim()) {
          data.append('sexo', formData.sexo.trim());
        }

        if (formData.edad.trim()) {
          data.append('edad', formData.edad.trim());
        }

        data.append(
          'descripcion',
          formData.descripcion.trim()
        );

        data.append(
          'fechaEvento',
          formData.fecha
        );

        data.append(
          'barrioSector',
          formData.barrioSector.trim()
        );

        if (formData.departamento.trim()) {
          data.append(
            'departamento',
            formData.departamento.trim()
          );
        }

        if (formData.ciudad.trim()) {
          data.append(
            'ciudad',
            formData.ciudad.trim()
          );
        }

        if (formData.direccion.trim()) {
          data.append(
            'direccion',
            formData.direccion.trim()
          );
        }

        if (formData.referencia.trim()) {
          data.append(
            'referencia',
            formData.referencia.trim()
          );
        }

        if (formData.recompensa.trim()) {
          data.append(
            'recompensa',
            formData.recompensa.trim()
          );
        }

        data.append(
          'latitud',
          ubicacion.lat.toString()
        );

        data.append(
          'longitud',
          ubicacion.lng.toString()
        );

        data.append('esTurbo', 'false');

        const res = await apiClient.post(
          '/reportes',
          data
        );

        sessionStorage.removeItem(
          'vecipets_borrador_id'
        );

        setMensajeExito(
          res.data?.mensaje ||
            '¡Reporte recibido con éxito! Queda pendiente de aprobación por el administrador.'
        );

        setTimeout(() => {
          router.push('/mis-reportes');
        }, 2200);
      }
    } catch (err: any) {
      console.error(
        'Error al procesar reporte:',
        err
      );

      // Verificar si Wompi ya confirmó un pago anterior.

      if (
        err.response?.status === 409 &&
        formData.esTurbo &&
        borradorId
      ) {
        const pago = await apiClient
          .post('/pagos/verificar-transaccion', {
            reporteId: borradorId,
          })
          .catch(() => null);

        if (pago?.data?.aprobado) {
          setPagoAprobado(true);

          setMensajePago(
            'Wompi confirmó el pago. Ya puedes publicar tu reporte con Alerta Turbo.'
          );

          return;
        }
      }

      const backendMessage =
        err.response?.data?.message;

      setErrorValidacion(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
              err.message ||
              'No fue posible procesar la solicitud.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // ======================================================
  // INTERFAZ DEL FORMULARIO
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ENCABEZADO */}

        <div className="flex items-center gap-3">
          <Link
            href="/reportes"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <span className="text-[11px] font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Servicio Comunitario 🐾
            </span>

            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {borradorId
                ? 'Completar y Publicar Reporte'
                : 'Reportar Mascota'}
            </h1>

            <p className="text-xs text-slate-500">
              Ingresa los datos para registrar o activar
              la Alerta Turbo.
            </p>
          </div>
        </div>

        {/* VERIFICANDO PAGO */}

        {verificandoPago && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-semibold animate-pulse">
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />

            <span>
              Confirmando la transacción con Wompi...
              Por favor espera un momento.
            </span>
          </div>
        )}

        {/* PAGO APROBADO */}

        {pagoAprobado && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-start gap-3 text-emerald-950 shadow-sm animate-fade-in">

            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />

            <div>
              <p className="font-extrabold text-sm text-emerald-900">
                {mensajePago ||
                  'Pago aprobado. Tu Alerta Turbo está confirmada.'}
              </p>

              <p className="text-xs text-emerald-700 mt-0.5">
                Tu transacción en Wompi por $15.000 COP
                fue confirmada. Revisa los datos de la
                mascota y presiona «Publicar reporte»
                para enviarlo a revisión administrativa.
              </p>
            </div>
          </div>
        )}

        {/* MENSAJE DE ERROR */}

        {errorValidacion && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-medium"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

            <span>{errorValidacion}</span>
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}

        {mensajeExito && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />

            <span>{mensajeExito}</span>
          </div>
        )}

        {/* FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* FOTOGRAFÍA */}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

                  <Camera className="w-4 h-4 text-emerald-600" />

                  Fotografía de la Mascota
                </h2>

                <p className="text-xs text-slate-400">
                  {previewImagen
                    ? 'Fotografía cargada y preservada correctamente.'
                    : 'Adjunta una foto clara (JPG, PNG o WEBP, máx. 5 MB).'}
                </p>
              </div>
            </div>

            {previewImagen ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-900">

                <img
                  src={previewImagen}
                  alt="Vista previa de la mascota"
                  className="w-full h-full object-cover"
                />

                {!pagoAprobado && (
                  <button
                    type="button"
                    disabled={enviando || verificandoPago}
                    onClick={() => {
                      setArchivoSeleccionado(null);
                      setPreviewImagen(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition"
                    title="Cambiar fotografía"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-emerald-50/20">

                <Camera className="w-8 h-8 text-slate-400 mb-2" />

                <span className="text-xs font-bold text-slate-700">
                  Seleccionar o tomar fotografía
                </span>

                <span className="text-[11px] text-slate-400 mt-1">
                  Formatos admitidos: JPEG, PNG, WEBP
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={enviando || verificandoPago}
                  className="hidden"
                />

              </label>
            )}

          </div>

          {/* DATOS DE LA MASCOTA */}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">

            <h2 className="text-sm font-bold text-slate-900">
              1. Datos Básicos
            </h2>

            {/* TIPO DE REPORTE */}

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    tipo: 'PERDIDA',
                  }))
                }
                className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition ${
                  formData.tipo === 'PERDIDA'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                🚨 Mascota Perdida
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    tipo: 'HALLAZGO',
                  }))
                }
                className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition ${
                  formData.tipo === 'HALLAZGO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                🐾 Mascota Encontrada
              </button>

            </div>

            {/* NOMBRE Y ESPECIE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la mascota
                </label>

                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej. Rocky, Pelusa"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especie
                </label>

                <select
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Perro">
                    Perro
                  </option>

                  <option value="Gato">
                    Gato
                  </option>

                  <option value="Otro">
                    Otro
                  </option>
                </select>
              </div>

            </div>

            {/* RAZA, COLOR Y TAMAÑO */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raza (Opcional)
                </label>

                <input
                  name="raza"
                  type="text"
                  placeholder="Ej. Criollo, Labrador"
                  value={formData.raza}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color (Opcional)
                </label>

                <input
                  name="color"
                  type="text"
                  placeholder="Ej. Café con blanco"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tamaño (Opcional)
                </label>

                <select
                  name="tamano"
                  value={formData.tamano}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                >
                  <option value="">
                    Seleccionar...
                  </option>

                  <option value="Pequeno">
                    Pequeño
                  </option>

                  <option value="Mediano">
                    Mediano
                  </option>

                  <option value="Grande">
                    Grande
                  </option>
                </select>
              </div>

            </div>

            {/* SEXO, EDAD Y FECHA */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sexo (Opcional)
                </label>

                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                >
                  <option value="">
                    Seleccionar...
                  </option>

                  <option value="Macho">
                    Macho
                  </option>

                  <option value="Hembra">
                    Hembra
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edad aproximada
                </label>

                <input
                  name="edad"
                  type="text"
                  placeholder="Ej. 2 años, Cachorro"
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha del suceso
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

            {/* DESCRIPCIÓN */}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción detallada
              </label>

              <textarea
                name="descripcion"
                rows={3}
                required
                placeholder="Indica collar, señas particulares, cicatrices o condiciones médicas..."
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
              />
            </div>

            {/* ALERTA TURBO */}

            <div className="pt-3 border-t border-slate-100">

              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Impulso Comunitario (Alerta Turbo)
              </span>

              {pagoAprobado ? (

                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 flex items-center justify-between shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>

                    <div>
                      <span className="font-extrabold text-emerald-950 text-xs block">
                        Alerta Turbo Pagada y Confirmada
                        ($15.000 COP)
                      </span>

                      <span className="text-[11px] text-emerald-800">
                        Duración de 7 días continuos a
                        partir de la aprobación del reporte.
                      </span>
                    </div>

                  </div>

                  <span className="px-3 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider">
                    PAGADO ✓
                  </span>

                </div>

              ) : (

                <div className="grid grid-cols-1 gap-2.5">

                  {/* PUBLICACIÓN GRATUITA */}

                  <button
                    type="button"
                    disabled={enviando || verificandoPago}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        esTurbo: false,
                      }))
                    }
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-left ${
                      !formData.esTurbo
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
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
                          Revisión regular y publicación
                          en mapa y feed comunitario.
                        </span>
                      </div>

                    </div>

                  </button>

                  {/* PUBLICACIÓN TURBO */}

                  <button
                    type="button"
                    disabled={enviando || verificandoPago}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        esTurbo: true,
                      }))
                    }
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-left ${
                      formData.esTurbo
                        ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-300'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >

                    <div className="flex items-center gap-2.5">

                      <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>

                      <div>
                        <span className="font-bold text-amber-950 text-xs block">
                          Activar Alerta Turbo ⚡
                          ($15.000 COP)
                        </span>

                        <span className="text-[11px] text-slate-700">
                          Máxima visibilidad durante 7 días
                          continuos en la parte superior
                          del mapa y feed.
                        </span>
                      </div>

                    </div>

                  </button>

                </div>

              )}

            </div>

            {/* RECOMPENSA */}

            <div className="pt-3 border-t border-slate-100">

              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Recompensa (Opcional)
              </span>

              <input
                name="recompensa"
                type="number"
                min={0}
                placeholder="Monto en COP (ej. 50000)"
                value={formData.recompensa}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />

            </div>

          </div>

          {/* UBICACIÓN Y MAPA */}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

              <MapPin className="w-4 h-4 text-emerald-600" />

              Ubicación del Suceso
            </h2>

            {/* MUNICIPIO */}

            <label className="block text-xs font-semibold text-slate-700">

              Municipio del Valle de Aburrá

              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              >
                {municipiosValleDeAburra.map(
                  (municipio) => (
                    <option
                      key={municipio}
                      value={municipio}
                    >
                      {municipio}
                    </option>
                  )
                )}
              </select>

            </label>

            {/* BARRIO */}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barrio o Sector *
              </label>

              <input
                name="barrioSector"
                type="text"
                required
                maxLength={150}
                placeholder="Ej. Laureles, Poblado, Estadio"
                value={formData.barrioSector}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>

            {/* DIRECCIÓN Y REFERENCIA */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección específica (Opcional)
                </label>

                <input
                  name="direccion"
                  type="text"
                  maxLength={200}
                  placeholder="Ej. Calle 33 # 74B - 12"
                  value={formData.direccion}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();

                      if (
                        !enviando &&
                        !verificandoPago &&
                        !buscandoUbicacion
                      ) {
                        buscarUbicacionEnMapa();
                      }
                    }
                  }}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Punto de referencia (Opcional)
                </label>

                <input
                  name="referencia"
                  type="text"
                  placeholder="Ej. Cerca al parque principal"
                  value={formData.referencia}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

            </div>

            {/* BOTONES DE UBICACIÓN */}

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={puntoPendiente ? reintentarVerificacion : buscarUbicacionEnMapa}
                disabled={
                  buscandoUbicacion ||
                  enviando ||
                  verificandoPago
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
              >

                {buscandoUbicacion ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {buscandoUbicacion
                  ? 'Comprobando ubicación…'
                  : puntoPendiente
                    ? 'Reintentar verificación'
                    : 'Buscar en mapa'}

              </button>

              <button
                type="button"
                onClick={obtenerMiUbicacion}
                disabled={
                  buscandoUbicacion ||
                  enviando ||
                  verificandoPago
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <Crosshair className="w-4 h-4" />

                Mi ubicación
              </button>

            </div>

            {/* ESTADO DE LA UBICACIÓN */}

            {mensajeUbicacion && (
              <p
                role="status"
                className="text-xs font-medium text-primary-800"
              >
                {mensajeUbicacion}
              </p>
            )}

            {ubicacion?.municipioVerificado && !buscandoUbicacion && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">

                <CheckCircle2 className="w-4 h-4 shrink-0" />

                Ubicación confirmada correctamente.

              </div>
            )}

            {/* RESULTADOS DE BÚSQUEDA */}

            {resultadosUbicacion.length > 0 && (
              <ul
                className="space-y-2"
                aria-label="Coincidencias de dirección"
              >

                {resultadosUbicacion.map(
                  (resultado) => (
                    <li
                      key={`${resultado.lat},${resultado.lng}`}
                    >

                      <button
                        type="button"
                        disabled={
                          enviando ||
                          verificandoPago ||
                          buscandoUbicacion
                        }
                        onClick={() =>
                          confirmarPunto(
                            resultado,
                            false
                          )
                        }
                        className="w-full rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-left text-sm text-primary-950 hover:border-primary-300"
                      >

                        <span className="block font-semibold">
                          {resultado.etiqueta}
                        </span>

                        {!resultado.numeroRegistrado && (
                          <span className="block text-xs text-primary-hover">
                            Ubicación aproximada.
                            Ajusta el punto si hace falta.
                          </span>
                        )}

                      </button>

                    </li>
                  )
                )}

              </ul>
            )}

            {/* INSTRUCCIONES DEL MAPA */}

            <p className="text-[11px] text-slate-500 flex items-center gap-1">

              <Crosshair className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

              <span>
                Haz clic en el mapa para ajustar las
                coordenadas exactas.
              </span>

            </p>

            {/* MAPA INTERACTIVO */}

            <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">

              <MapaInteractivo
                lat={
                  ubicacion?.lat ??
                  COORDENADAS_DEFECTO.lat
                }
                lng={
                  ubicacion?.lng ??
                  COORDENADAS_DEFECTO.lng
                }
                etiqueta={
                  formData.barrioSector ||
                  'Ubicación registrada'
                }
                mostrarMarcador={ubicacion !== null}
                onSeleccionarUbicacion={
                  enviando || verificandoPago
                    ? undefined
                    : handleSeleccionDesdeMapa
                }
              />

            </div>

          </div>

          {/* BOTÓN PRINCIPAL */}

          <button
            type="submit"
            disabled={
              enviando ||
              verificandoPago ||
              buscandoUbicacion ||
              Boolean(mensajeExito)
            }
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${
              formData.esTurbo && !pagoAprobado
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >

            {enviando ? (

              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Procesando información...
              </>

            ) : verificandoPago ? (

              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Verificando pago...
              </>

            ) : mensajeExito ? (

              <>
                <CheckCircle2 className="w-4 h-4" />

                Reporte enviado correctamente
              </>

            ) : formData.esTurbo && !pagoAprobado ? (

              <>
                <Zap className="w-4 h-4 fill-white" />

                Guardar borrador y Pagar Alerta Turbo
                ($15.000 COP)
              </>

            ) : (

              'Publicar reporte'

            )}

          </button>

        </form>

      </div>
    </main>
  );
}

// ======================================================
// EXPORTACIÓN PRINCIPAL
// ======================================================

export default function ReportarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

          <div className="flex flex-col items-center gap-2">

            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />

            <p className="text-xs text-slate-500 font-semibold">
              Cargando formulario...
            </p>

          </div>

        </div>
      }
    >
      <FormularioReportarContenido />
    </Suspense>
  );
}