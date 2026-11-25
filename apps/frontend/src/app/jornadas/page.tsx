
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Syringe,
  Ticket,
  HeartHandshake,
  User,
  Loader2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

import TarjetaCampana from './components/TarjetaCampana';
import ModalReservaJornada from './components/ModalReservaJornada';

// ==========================================
// INTERFACES
// ==========================================

interface Jornada {
  id: number;
  titulo: string;
  veterinaria: string;
  comuna: string;
  direccion: string;
  fechaTexto: string;
  horaTexto: string;
  precioProcedimientoCentavos: number;
  precioApartadoCentavos: number;
  cuposTotales: number;
  cuposDisponibles: number;
  imagenUrl: string | null;
  destacado: boolean;
  activa: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PaginaJornadas() {
  const { user, loading: authLoading } = useAuth();

  const router = useRouter();

  const [jornadas, setJornadas] =
    useState<Jornada[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [mostrarModalAuth, setMostrarModalAuth] =
    useState(false);

  const [jornadaSeleccionada, setJornadaSeleccionada] =
    useState<Jornada | null>(null);

  const estaAutenticado = !!user && !authLoading;

  // ==========================================
  // CONSULTAR JORNADAS
  // ==========================================

  const cargarJornadas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const respuesta =
        await apiClient.get<Jornada[]>('/jornadas');

      setJornadas(
        Array.isArray(respuesta.data)
          ? respuesta.data
          : [],
      );

    } catch (err) {
      console.error('Error cargando jornadas:', err);

      setError(
        'No se pudieron consultar las jornadas. Verifica tu sesión y la conexión con el servidor.',
      );

    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void cargarJornadas();
    }
  }, [authLoading, user, cargarJornadas]);

  // ==========================================
  // RESERVAR CUPO
  // ==========================================

  const intentarReservarCupo = (jornada: Jornada) => {
    if (authLoading) return;

    if (!estaAutenticado) {
      setMostrarModalAuth(true);
      return;
    }

    if (!jornada.activa || jornada.cuposDisponibles <= 0) {
      return;
    }

    setJornadaSeleccionada(jornada);
  };

  const formatearMoneda = (centavos: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(centavos / 100);

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-6xl space-y-8">

        {/* ESTADO DE SESIÓN */}

        <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-xs text-white shadow-sm">

          <div className="flex items-center gap-2">

            <User className="h-4 w-4 text-blue-400" />

            <span>
              {authLoading
                ? 'Verificando sesión...'
                : estaAutenticado
                  ? 'Usuario autenticado'
                  : 'Visitante'}
            </span>

          </div>

          {!authLoading && !estaAutenticado && (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="rounded-lg bg-blue-600 px-3 py-2 font-bold hover:bg-blue-700"
            >
              Iniciar sesión
            </button>
          )}

        </div>

        {/* ENCABEZADO */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl md:p-10">

          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase">

            <HeartHandshake className="h-4 w-4" />

            Alianza Veterinaria

          </span>

          <h1 className="mb-3 text-3xl font-black md:text-4xl">
            Jornadas de Salud y Esterilización
          </h1>

          <p className="text-sm text-blue-100">
            Accede a jornadas a precios comunitarios en
            Medellín y reserva tu cupo fácilmente.
          </p>

        </div>

        {/* TÍTULO */}

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">

          <h2 className="flex items-center gap-2 font-bold text-blue-600">

            <Syringe className="h-5 w-5" />

            Campañas activas

          </h2>

          <span className="flex items-center gap-2 text-sm text-slate-500">

            <Ticket className="h-4 w-4" />

            {jornadas.length} jornadas

          </span>

        </div>

        {/* LISTADO */}

        {cargando ? (

          <div className="flex justify-center py-12">

            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          </div>

        ) : error ? (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void cargarJornadas()}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
            >
              Volver a intentar
            </button>

          </div>

        ) : jornadas.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">

            No hay jornadas activas disponibles.

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {jornadas.map((jornada) => (

              <TarjetaCampana
                key={jornada.id}
                campana={{
                  id: jornada.id,
                  titulo: jornada.titulo,
                  veterinaria: jornada.veterinaria,
                  comuna: jornada.comuna,
                  direccion: jornada.direccion,
                  fecha: jornada.fechaTexto,
                  hora: jornada.horaTexto,
                  precioComunitaria: formatearMoneda(
                    jornada.precioProcedimientoCentavos,
                  ),
                  comisionReserva: formatearMoneda(
                    jornada.precioApartadoCentavos,
                  ),
                  cuposDisponibles: jornada.cuposDisponibles,
                  destacado: jornada.destacado,
                  imagenUrl:
                    jornada.imagenUrl ||
                    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800',
                }}
                tieneCupos={
                  jornada.activa &&
                  jornada.cuposDisponibles > 0
                }
                onApartarCupo={() =>
                  intentarReservarCupo(jornada)
                }
              />

            ))}

          </div>

        )}

      </div>

      {/* MODAL DE AUTENTICACIÓN */}

      {mostrarModalAuth && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-2xl">

            <h2 className="text-xl font-bold text-slate-900">
              Inicia sesión para reservar
            </h2>

            <p className="text-sm text-slate-500">
              Necesitas una cuenta para reservar el cupo
              de tu mascota.
            </p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => router.push('/registro')}
              className="w-full rounded-xl bg-blue-50 py-3 font-bold text-blue-700"
            >
              Registrarse
            </button>

            <button
              type="button"
              onClick={() => setMostrarModalAuth(false)}
              className="text-sm text-slate-500"
            >
              Cancelar
            </button>

          </div>

        </div>

      )}

      {/* MODAL DE RESERVA */}

      {jornadaSeleccionada && (

        <ModalReservaJornada
          jornada={jornadaSeleccionada}
          onClose={() => {
            setJornadaSeleccionada(null);
            void cargarJornadas();
          }}
        />

      )}

    </div>
  );
}
