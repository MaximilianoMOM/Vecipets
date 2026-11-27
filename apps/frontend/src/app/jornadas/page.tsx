'use client';

import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Syringe,
  Ticket,
  HeartHandshake,
  User,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

import AccountLayout, {
  accountCard,
} from '../components/common/AccountLayout';

import TarjetaCampana from './components/TarjetaCampana';

import ModalReservaJornada from './components/ModalReservaJornada';
import { ModalReservaConfirmada, type ReservaCiudadana } from './components/DatosReserva';
import Link from 'next/link';

// ==========================================
// INTERFACES
// ==========================================

interface Jornada {
  id: number;
  titulo: string;
  veterinaria: string;
  comuna: string;
  direccion: string;

  fechaInicio: string;
  fechaFin: string;

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
// FORMATEAR MONEDA
// ==========================================

const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function formatearMoneda(centavos: number) {
  return moneda.format(centavos / 100);
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PaginaJornadas() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [jornadas, setJornadas] =
    useState<Jornada[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [mostrarModalAuth, setMostrarModalAuth] =
    useState(false);

  const [mensajeAcceso, setMensajeAcceso] =
    useState<string | null>(null);

  const [
    jornadaSeleccionada,
    setJornadaSeleccionada,
  ] = useState<Jornada | null>(null);

  const estaAutenticado =
    !!user && !authLoading;

  // ==========================================
  // CONSULTAR JORNADAS
  // ==========================================

  const cargarJornadas = useCallback(
    async (signal?: AbortSignal) => {
      setCargando(true);
      setError(null);

      try {
        const respuesta =
          await apiClient.get<Jornada[]>(
            '/jornadas',
            { signal },
          );

        if (signal?.aborted) return;

        setJornadas(
          Array.isArray(respuesta.data)
            ? respuesta.data
            : [],
        );
      } catch (err) {
        if (signal?.aborted) return;

        console.error(
          'Error cargando jornadas:',
          err,
        );

        setError(
          'No se pudieron cargar las jornadas. Verifica la conexión con el servidor.',
        );
      } finally {
        if (!signal?.aborted) {
          setCargando(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const abort = new AbortController();

    void cargarJornadas(abort.signal);

    return () => abort.abort();
  }, [cargarJornadas]);

  // ==========================================
  // RESERVAR CUPO
  // ==========================================

  const [reservasPendientes, setReservasPendientes] = useState<{
    usuarioId: number;
    reservas: ReservaCiudadana[];
  } | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState<ReservaCiudadana | null>(null);
  const ciudadanoId = user?.rol === 'CIUDADANO' ? user.id : undefined;

  useEffect(() => {
    if (ciudadanoId === undefined) return;
    const abort = new AbortController();

    apiClient
      .get<NonNullable<typeof reservasPendientes>['reservas']>(
        '/jornadas/mis-reservas',
        { signal: abort.signal },
      )
      .then(({ data }) => {
        if (!abort.signal.aborted) {
          setReservasPendientes({ usuarioId: ciudadanoId, reservas: data });
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) setReservasPendientes(null);
      });

    return () => abort.abort();
  }, [ciudadanoId]);

  const tieneReservaPendiente = (jornadaId: number) =>
    reservasPendientes?.usuarioId === ciudadanoId &&
    reservasPendientes?.reservas.some(
      (reserva) =>
        reserva.jornadaId === jornadaId &&
        reserva.estado === 'PENDIENTE' &&
        Date.parse(reserva.expiraEn) > Date.now(),
    ) === true;

  const obtenerReservaConfirmada = (jornadaId: number) =>
    reservasPendientes?.usuarioId === ciudadanoId
      ? reservasPendientes?.reservas.find((reserva) => reserva.jornadaId === jornadaId &&
          reserva.estado === 'CONFIRMADA' && reserva.pagoEstado === 'APROBADO')
      : undefined;

  const intentarReservarCupo = (
    jornada: Jornada,
  ) => {
    if (authLoading) return;

    if (!estaAutenticado) {
      setMostrarModalAuth(true);
      return;
    }

    if (user?.rol !== 'CIUDADANO') {
      setMensajeAcceso(
        'Solo las cuentas de ciudadanos pueden reservar cupos para sus mascotas.',
      );

      return;
    }

    const confirmada = obtenerReservaConfirmada(jornada.id);
    if (confirmada) {
      setReservaConfirmada(confirmada);
      return;
    }

    if (
      !jornada.activa ||
      (jornada.cuposDisponibles <= 0 && !tieneReservaPendiente(jornada.id))
    ) {
      setMensajeAcceso(
        'Esta jornada ya no tiene cupos disponibles.',
      );

      return;
    }

    setJornadaSeleccionada(jornada);
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <AccountLayout
      title={
        <>
          Jornadas{' '}
          <span className="text-indigo-600">
            veterinarias
          </span>
        </>
      }
      description="Encuentra próximas jornadas de vacunación, esterilización y otros servicios para tu mascota."
    >
      <div className="space-y-8">

        {ciudadanoId !== undefined && <Link href="/jornadas/mis-reservas" className="font-semibold text-indigo-700 underline">Mis reservas</Link>}
        {/* ESTADO DE SESIÓN */}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-50 p-3">

              <User className="h-5 w-5 text-indigo-600" />

            </div>

            <div>

              <p className="text-sm font-bold text-slate-900">

                {authLoading
                  ? 'Verificando sesión...'
                  : estaAutenticado
                    ? 'Sesión iniciada'
                    : 'Estás navegando como visitante'}

              </p>

              <p className="text-xs text-slate-500">

                {estaAutenticado
                  ? 'Consulta las jornadas disponibles.'
                  : 'Inicia sesión para reservar un cupo.'}

              </p>

            </div>

          </div>

          {!authLoading && !estaAutenticado && (

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Iniciar sesión
            </button>

          )}

          {user?.rol === 'VETERINARIA' && (

            <button
              type="button"
              onClick={() =>
                router.push('/perfil/jornadas')
              }
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Gestionar mis jornadas
            </button>

          )}

        </div>

        {/* ENCABEZADO */}

        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 to-blue-600 p-6 text-white shadow-lg md:p-10">

          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase">

            <HeartHandshake className="h-4 w-4" />

            Alianza veterinaria

          </span>

          <h2 className="mb-3 text-3xl font-black md:text-4xl">

            Cuidamos cada huella

          </h2>

          <p className="max-w-2xl text-sm leading-relaxed text-indigo-100 md:text-base">

            Accede a jornadas de salud, vacunación
            y esterilización a precios comunitarios.
            Reserva el cupo de tu mascota de forma
            fácil y segura.

          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">

            <ShieldCheck className="h-5 w-5" />

            Pagos seguros a través de Wompi

          </div>

        </section>

        {/* INFORMACIÓN DE APARTADOS */}

        <section className={accountCard}>

          <h2 className="mb-4 text-lg font-bold text-slate-900">

            ¿Cómo funcionan los apartados?

          </h2>

          <div className="grid gap-3 md:grid-cols-3">

            <div className="rounded-2xl bg-emerald-50 p-4">

              <p className="text-sm font-semibold text-emerald-700">
                Jornadas gratuitas
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-800">
                $2.000
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                Valor del apartado
              </p>

            </div>

            <div className="rounded-2xl bg-blue-50 p-4">

              <p className="text-sm font-semibold text-blue-700">
                Menores a $50.000
              </p>

              <p className="mt-2 text-2xl font-black text-blue-800">
                $5.000
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Apartado por cupo
              </p>

            </div>

            <div className="rounded-2xl bg-indigo-50 p-4">

              <p className="text-sm font-semibold text-indigo-700">
                Desde $50.000
              </p>

              <p className="mt-2 text-2xl font-black text-indigo-800">
                $10.000
              </p>

              <p className="mt-1 text-xs text-indigo-700">
                Apartado por cupo
              </p>

            </div>

          </div>

          <p className="mt-4 text-sm text-slate-500">

            En jornadas con costo, el apartado se
            descuenta del precio del procedimiento.
            En jornadas gratuitas, únicamente pagas
            el valor del apartado.

          </p>

        </section>

        {/* TÍTULO DEL LISTADO */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">

          <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-700">

            <Syringe className="h-5 w-5" />

            Jornadas disponibles

          </h2>

          <span className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">

            <Ticket className="h-4 w-4" />

            {jornadas.length} jornadas

          </span>

        </div>

        {/* CARGANDO */}

        {cargando && (

          <div
            role="status"
            className="flex flex-col items-center justify-center gap-3 py-16"
          >

            <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />

            <p className="text-sm text-slate-500">

              Cargando jornadas...

            </p>

          </div>

        )}

        {/* ERROR */}

        {!cargando && error && (

          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          >

            <p className="text-sm text-red-700">

              {error}

            </p>

            <button
              type="button"
              onClick={() => void cargarJornadas()}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
            >

              Volver a intentar

            </button>

          </div>

        )}

        {/* SIN JORNADAS */}

        {!cargando &&
          !error &&
          jornadas.length === 0 && (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <Syringe className="mx-auto mb-4 h-10 w-10 text-slate-400" />

              <h3 className="font-bold text-slate-800">

                No hay jornadas disponibles

              </h3>

              <p className="mt-2 text-sm text-slate-500">

                Próximamente encontrarás nuevas
                jornadas para tu mascota.

              </p>

            </div>

          )}

        {/* TARJETAS DE JORNADAS */}

        {!cargando &&
          !error &&
          jornadas.length > 0 && (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {jornadas.map((jornada) => (

                <TarjetaCampana
                  key={jornada.id}

                  campana={{
                    id: jornada.id,

                    titulo: jornada.titulo,

                    veterinaria:
                      jornada.veterinaria,

                    comuna: jornada.comuna,

                    direccion:
                      jornada.direccion,

                    fecha: jornada.fechaTexto,

                    hora: jornada.horaTexto,

                    precioComunitaria:
                      jornada.precioProcedimientoCentavos === 0
                        ? 'Gratuito'
                        : formatearMoneda(
                            jornada.precioProcedimientoCentavos,
                          ),

                    comisionReserva:
                      formatearMoneda(
                        jornada.precioApartadoCentavos,
                      ),

                    cuposDisponibles:
                      jornada.cuposDisponibles,

                    destacado:
                      jornada.destacado,

                    imagenUrl:
                      jornada.imagenUrl ||
                      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800',
                  }}

                  tieneCupos={
                    jornada.activa &&
                    (jornada.cuposDisponibles > 0 || tieneReservaPendiente(jornada.id) || !!obtenerReservaConfirmada(jornada.id))
                  }

                  tieneReservaConfirmada={!!obtenerReservaConfirmada(jornada.id)}
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

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-auth"
            className="relative w-full max-w-sm space-y-4 rounded-3xl bg-white p-7 text-center shadow-2xl"
          >

            <button
              type="button"
              aria-label="Cerrar"
              onClick={() =>
                setMostrarModalAuth(false)
              }
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >

              <X className="h-5 w-5" />

            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

              <User className="h-7 w-7 text-indigo-600" />

            </div>

            <h2
              id="titulo-modal-auth"
              className="text-xl font-black text-slate-900"
            >

              Inicia sesión para reservar

            </h2>

            <p className="text-sm text-slate-500">

              Necesitas una cuenta de ciudadano
              para reservar el cupo de tu mascota.

            </p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700"
            >

              Iniciar sesión

            </button>

            <button
              type="button"
              onClick={() =>
                router.push('/registro')
              }
              className="w-full rounded-xl bg-indigo-50 py-3 font-bold text-indigo-700"
            >

              Registrarse

            </button>

            <button
              type="button"
              onClick={() =>
                setMostrarModalAuth(false)
              }
              className="text-sm text-slate-500"
            >

              Cancelar

            </button>

          </div>

        </div>

      )}

      {/* MODAL DE RESTRICCIÓN DE ACCESO */}

      {mensajeAcceso && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-acceso"
            className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-7 text-center shadow-2xl"
          >

            <h2
              id="titulo-modal-acceso"
              className="text-xl font-bold text-slate-900"
            >

              Reserva no disponible

            </h2>

            <p className="text-sm text-slate-600">

              {mensajeAcceso}

            </p>

            <button
              type="button"
              onClick={() => setMensajeAcceso(null)}
              className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
            >

              Entendido

            </button>

          </div>

        </div>

      )}

      {reservaConfirmada && ciudadanoId !== undefined &&
        <ModalReservaConfirmada reserva={reservaConfirmada} onClose={() => setReservaConfirmada(null)} />}
      {/* MODAL DE RESERVA Y WOMPI */}

      {jornadaSeleccionada && (

        <ModalReservaJornada
          jornada={jornadaSeleccionada}
          tieneReservaPendiente={tieneReservaPendiente(jornadaSeleccionada.id)}

          onClose={() => {
            setJornadaSeleccionada(null);
            void cargarJornadas();
          }}
        />

      )}

    </AccountLayout>
  );
}