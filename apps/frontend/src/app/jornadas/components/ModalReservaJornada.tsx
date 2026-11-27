
'use client';

import { abrirCheckoutWompi } from '@/lib/wompi-checkout';

import { useState } from 'react';
import { ModalReservaConfirmada, type ReservaCiudadana } from './DatosReserva';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import {
  X,
  CreditCard,
  Calendar,
  MapPin,
  ShieldCheck,
  Loader2,
  PawPrint,
  User,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

// ==========================================
// INTERFACES
// ==========================================

interface Jornada {
  id: number;
  titulo: string;
  veterinaria: string;
  direccion: string;
  fechaTexto: string;
  horaTexto: string;
  precioProcedimientoCentavos: number;
  precioApartadoCentavos: number;
  cuposDisponibles: number;
}

interface RespuestaReserva {
  mensaje: string;
  reutilizado: boolean;
  reserva: ReservaCiudadana;
  checkoutUrl: string | null;
}

interface Props {
  jornada: Jornada;
  tieneReservaPendiente: boolean;
  onClose: () => void;

}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function ModalReservaJornada({
  jornada,
  tieneReservaPendiente,
  onClose,
}: Props) {
  const { user } = useAuth();
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);
  const [confirmada, setConfirmada] = useState<ReservaCiudadana | null>(null);

  const [nombrePropietario, setNombrePropietario] =
    useState('');

  const [nombreMascota, setNombreMascota] =
    useState('');

  const [procesando, setProcesando] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);
  const [reservaEnConsulta, setReservaEnConsulta] = useState<number | null>(null);

  const precioProcedimiento =
    jornada.precioProcedimientoCentavos / 100;

  const precioApartado =
    jornada.precioApartadoCentavos / 100;

  const saldoPendiente = Math.max(
    0,
    precioProcedimiento - precioApartado,
  );

  const formatearMoneda = (valor: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);

  // ==========================================
  // CREAR RESERVA Y REDIRIGIR A WOMPI
  // ==========================================

  const manejarPago = async (
    evento: FormEvent<HTMLFormElement>,
  ) => {
    evento.preventDefault();

    if (procesando) return;

    setError(null);

    if (!user) {
      setError('Debes iniciar sesión para reservar.');
      return;
    }

    if (!nombrePropietario.trim()) {
      setError('Ingresa el nombre del propietario.');
      return;
    }

    if (!nombreMascota.trim()) {
      setError('Ingresa el nombre de la mascota.');
      return;
    }

    if (jornada.cuposDisponibles <= 0 && !tieneReservaPendiente) {
      setError('No hay cupos disponibles.');
      return;
    }

    if (!aceptaCondiciones) {
      setError('Debes aceptar las condiciones del apartado.');
      return;
    }
    setProcesando(true);
    setReservaEnConsulta(null);

    try {
      const respuesta =
        await apiClient.post<RespuestaReserva>(
          '/jornadas/reservar',
          {
            jornadaId: jornada.id,
            aceptaCondiciones,
            nombrePropietario:
              nombrePropietario.trim(),
            nombreMascota:
              nombreMascota.trim(),
          },
        );

      const { reserva, checkoutUrl } = respuesta.data;

      if (reserva?.estado === 'CONFIRMADA' && reserva.pagoEstado === 'APROBADO') {
        setConfirmada(reserva);
        return;
      }
      if (!checkoutUrl || !reserva?.id) {
        throw new Error(
          'No se recibió la información del pago.',
        );
      }

      // Guardar referencia para consultar al regresar.
      sessionStorage.setItem(
        'vecipets_reserva_pendiente',
        JSON.stringify({
          id: reserva.id,
          codigo: reserva.codigo,
          jornadaId: jornada.id,
        }),
      );

      // Redirección real a la pasarela de pago.
      await abrirCheckoutWompi(checkoutUrl, '/jornadas/reserva-resultado', true);

    } catch (err: unknown) {


      let mensajeError = 'No se pudo iniciar el pago.';

      if (isAxiosError(err)) {
        const respuestaData = err.response?.data as {
          message?: string | string[];
          error?: string;
          reservaId?: number;
        };

        setReservaEnConsulta(respuestaData?.reservaId ?? null);
        const msg = respuestaData?.message || 'No pudimos iniciar el apartado. Intenta nuevamente o consulta tu reserva.';
        mensajeError = Array.isArray(msg) ? msg.join('. ') : String(msg);
      } else if (err instanceof Error) {
        mensajeError = err.message;
      }

      setError(mensajeError);
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  if (confirmada) return <ModalReservaConfirmada reserva={confirmada} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-reserva"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >

        {/* ENCABEZADO */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">

          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            aria-label="Cerrar reserva"
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/20 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          <PawPrint className="mb-3 h-8 w-8" />

          <h2
            id="titulo-reserva"
            className="text-2xl font-black"
          >
            Reserva tu cupo
          </h2>

          <p className="mt-1 text-sm text-blue-100">
            {jornada.titulo}
          </p>

        </div>

        <form
          onSubmit={manejarPago}
          className="space-y-5 p-6"
        >

          {/* INFORMACIÓN DE LA JORNADA */}

          <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">

            <p className="font-bold text-slate-900">
              {jornada.veterinaria}
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              {jornada.direccion}
            </p>

            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              {jornada.fechaTexto} · {jornada.horaTexto}
            </p>

            <p className="font-semibold text-emerald-600">
              {jornada.cuposDisponibles} cupos disponibles
            </p>

          </div>

          {/* NOMBRE DEL PROPIETARIO */}

          <div>
            <label
              htmlFor="nombre-propietario"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Nombre completo del propietario *
            </label>

            <div className="relative">

              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

              <input
                id="nombre-propietario"
                type="text"
                value={nombrePropietario}
                onChange={(e) =>
                  setNombrePropietario(e.target.value)
                }
                placeholder="Escribe tu nombre completo"
                required
                maxLength={100}
                disabled={procesando}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>
          </div>

          {/* NOMBRE DE LA MASCOTA */}

          <div>
            <label
              htmlFor="nombre-mascota"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Nombre de la mascota *
            </label>

            <div className="relative">

              <PawPrint className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

              <input
                id="nombre-mascota"
                type="text"
                value={nombreMascota}
                onChange={(e) =>
                  setNombreMascota(e.target.value)
                }
                placeholder="Escribe el nombre de tu mascota"
                required
                maxLength={100}
                disabled={procesando}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>
          </div>

          {/* RESUMEN DEL PAGO */}

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <h3 className="font-bold text-slate-900">
              Resumen de tu reserva
            </h3>

            <div className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Precio del procedimiento</span>
              <strong>
                {formatearMoneda(precioProcedimiento)}
              </strong>
            </div>

            <div className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Valor del apartado</span>
              <strong>
                {formatearMoneda(precioApartado)}
              </strong>
            </div>

            <div className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Saldo en la veterinaria</span>
              <strong>
                {formatearMoneda(saldoPendiente)}
              </strong>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-3">

              <span className="font-bold text-slate-900">
                Total a pagar ahora
              </span>

              <span className="text-xl font-black text-blue-600">
                {formatearMoneda(precioApartado)}
              </span>

            </div>

          </div>

          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
            <p>Importante: el valor pagado corresponde al apartado de tu cupo para esta jornada. Si decides no asistir o cancelar voluntariamente tu reserva, el valor del apartado no será reembolsable, salvo cuando corresponda una devolución conforme a la legislación aplicable.</p>
            <p>Esta condición no aplica a cobros duplicados, errores del sistema ni cancelaciones por parte del organizador.</p>
            <label className="flex items-start gap-2 font-semibold">
              <input type="checkbox" className="mt-1" checked={aceptaCondiciones} required
                onChange={(event) => setAceptaCondiciones(event.target.checked)} disabled={procesando} />
              He leído y acepto las condiciones del apartado de mi cupo
            </label>
          </div>

          {/* MENSAJE DE ERROR */}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
              {reservaEnConsulta && (
                <a className="ml-2 underline font-semibold" href={`/jornadas/reserva-resultado?reservaId=${reservaEnConsulta}`}>
                  Consultar mi reserva
                </a>
              )}
            </div>
          )}

          {/* BOTÓN WOMPI */}

          <button
            type="submit"
            disabled={
              procesando || !aceptaCondiciones ||
              !nombrePropietario.trim() ||
              !nombreMascota.trim() ||
              (jornada.cuposDisponibles <= 0 && !tieneReservaPendiente)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-4 font-bold text-white shadow-md transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {procesando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirigiendo a Wompi...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pagar con Wompi — {formatearMoneda(precioApartado)}
              </>
            )}

          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-slate-500">

            <ShieldCheck className="h-4 w-4 text-emerald-600" />

            Pago seguro mediante Wompi

          </p>

        </form>

      </div>

    </div>
  );
}
