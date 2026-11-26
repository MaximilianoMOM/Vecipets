'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  MapPin,
  PawPrint,
  User,
  Ticket,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import AccountLayout, {
  accountCard,
  accountPrimary,
  accountSecondary,
} from '../../components/common/AccountLayout';

interface ReservaDetalle {
  id: number;
  codigo: string;
  nombrePropietario: string;
  nombreMascota: string;
  estado: string;
  precioProcedimientoCentavos: number;
  precioApartadoCentavos: number;
  saldoPendienteCentavos: number;
  jornadaTitulo?: string;
  veterinaria?: string;
  direccion?: string;
  fechaTexto?: string;
  horaTexto?: string;
}

interface ResultadoVerificacion {
  aprobado: boolean;
  requiereRevision?: boolean;
  estado: string;
  mensaje: string;
  referencia?: string;
  montoCentavos?: number;
  reserva?: ReservaDetalle | null;
}

const formatearMoneda = (centavos: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(centavos / 100);

function ContenidoResultado() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const reservaIdParam = searchParams.get('reservaId');

  const { user, loading: authLoading } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [resultado, setResultado] = useState<ResultadoVerificacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verificarPago = async () => {
    setCargando(true);
    setError(null);

    try {
      if (transactionId) {
        // Verificar por ID de transacción retornado por Wompi
        const respuesta = await apiClient.post<ResultadoVerificacion>(
          '/pagos/verificar-transaccion',
          { transactionId },
        );
        setResultado(respuesta.data);
      } else {
        // Intentar recuperar de sessionStorage si no vino transactionId en la URL
        const dataGuardada = sessionStorage.getItem('vecipets_reserva_pendiente');
        const reservaId = reservaIdParam ?? (dataGuardada ? JSON.parse(dataGuardada).id : null);
        if (reservaId) {
          const resEstado = await apiClient.get<ReservaDetalle & {
            pagoEstado: string | null;
            requiereRevision?: boolean;
            mensaje: string;
            referencia?: string;
            montoCentavos?: number;
            precioProcedimientoHistoricoCentavos: number;
            precioApartadoHistoricoCentavos: number;
          }>(
            `/jornadas/reservas/${reservaId}/estado`,
          );
          setResultado({
            aprobado: resEstado.data.pagoEstado === 'APROBADO',
            requiereRevision: resEstado.data.requiereRevision,
            estado: resEstado.data.pagoEstado || resEstado.data.estado,
            mensaje: resEstado.data.mensaje || 'Información de la reserva obtenida.',
            referencia: resEstado.data.referencia,
            montoCentavos: resEstado.data.montoCentavos,
            reserva: {
              ...resEstado.data,
              precioProcedimientoCentavos: resEstado.data.precioProcedimientoHistoricoCentavos,
              precioApartadoCentavos: resEstado.data.precioApartadoHistoricoCentavos,
            },
          });
        } else {
          setError('No se recibió el identificador de la transacción.');
        }
      }
    } catch (err: any) {
      console.error('Error verificando pago:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo verificar el estado del pago. Por favor intenta nuevamente.',
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      void verificarPago();
    }
  }, [transactionId, reservaIdParam, authLoading]);

  if (cargando || authLoading) {
    return (
      <div role="status" className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">Verificando tu reserva...</h2>
        <p className="text-sm text-slate-500">
          Estamos consultando el estado de la transacción con Wompi.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${accountCard} max-w-xl mx-auto text-center space-y-4`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Estado de la reserva</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={verificarPago}
            className={`${accountSecondary} flex items-center gap-2`}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar verificación
          </button>
          <Link href="/jornadas" className={accountPrimary}>
            Volver a jornadas
          </Link>
        </div>
      </div>
    );
  }

  const reserva = resultado?.reserva;
  const pagoAprobado = resultado?.estado === 'APROBADO';
  const reservaConfirmada = pagoAprobado && reserva?.estado === 'CONFIRMADA';
  const requiereRevision = pagoAprobado && !reservaConfirmada;
  const pagoFinalizado = ['RECHAZADO', 'ERROR', 'ANULADO', 'EXPIRADO'].includes(resultado?.estado ?? '');
  const reservaExpirada = reserva?.estado === 'EXPIRADA';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {reservaConfirmada ? (
        <section className="rounded-3xl bg-white border border-emerald-100 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Pago y reserva confirmados
            </span>
            <h1 className="text-3xl font-black text-slate-900">
              ¡Tu cupo ha sido reservado exitosamente!
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Hemos registrado tu apartado a través de Wompi. Recuerda presentar este comprobante el día de la jornada.
            </p>
          </div>

          {/* TARJETA DEL COMPROBANTE */}
          {reserva && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Código de reserva
                  </span>
                  <span className="text-lg font-mono font-black text-indigo-700">
                    {reserva.codigo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Apartado pagado
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatearMoneda(reserva.precioApartadoCentavos)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-slate-700">
                {reserva.jornadaTitulo && (
                  <p className="font-extrabold text-slate-900 text-base">
                    {reserva.jornadaTitulo}
                  </p>
                )}
                {reserva.veterinaria && (
                  <p className="text-xs font-bold text-indigo-600 uppercase">
                    {reserva.veterinaria}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <span><strong>Propietario:</strong> {reserva.nombrePropietario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-slate-400 shrink-0" />
                    <span><strong>Mascota:</strong> {reserva.nombreMascota}</span>
                  </div>
                  {reserva.fechaTexto && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{reserva.fechaTexto} {reserva.horaTexto ? `• ${reserva.horaTexto}` : ''}</span>
                    </div>
                  )}
                  {reserva.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{reserva.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 rounded-xl bg-white border border-slate-200 p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Saldo pendiente en la veterinaria:</span>
                    <span className="text-sm font-black text-slate-900">
                      {formatearMoneda(reserva.saldoPendienteCentavos)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 text-right max-w-[200px]">
                    Se paga el día de la jornada directamente a la entidad organizadora.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/jornadas" className={`${accountPrimary} flex items-center gap-2`}>
              <Ticket className="h-4 w-4" />
              Ver jornadas
            </Link>
            <Link href="/jornadas" className={`${accountSecondary} flex items-center gap-2`}>
              Continuar explorando jornadas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : requiereRevision ? (
        <section className={`${accountCard} space-y-4 text-center`}>
          <Clock className="mx-auto h-12 w-12 text-amber-600" />
          <h1 className="text-2xl font-black text-slate-900">Pago recibido, reserva en revisión</h1>
          <p className="text-sm text-slate-600">
            Recibimos tu pago, pero no pudimos confirmar tu cupo. El caso está pendiente de revisión administrativa.
          </p>
          {resultado?.referencia && (
            <p className="text-sm text-slate-600">Referencia del pago <strong>{resultado.referencia}</strong></p>
          )}
          <Link href="/jornadas" className={accountPrimary}>Ver jornadas</Link>
        </section>
      ) : pagoFinalizado || reservaExpirada ? (
        <section className="rounded-3xl bg-white border border-rose-100 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-inner">
            <XCircle className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3.5 py-1 text-xs font-bold text-rose-800 uppercase tracking-wide">
              Pago no completado
            </span>
            <h1 className="text-3xl font-black text-slate-900">
              {reservaExpirada ? 'La reserva expiró' : 'El pago no se completó'}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {reservaExpirada
                ? 'El cupo retenido fue liberado. Si ya enviaste el pago, vuelve a consultar su estado.'
                : resultado?.mensaje || 'Consulta el estado de la transacción antes de intentar otro pago.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button type="button" onClick={verificarPago} className={accountSecondary}>
              Consultar estado
            </button>
            <Link href="/jornadas" className={accountPrimary}>
              Volver a intentar en jornadas
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl bg-white border border-amber-100 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-inner">
            <Clock className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wide">
              Pago en proceso
            </span>
            <h1 className="text-3xl font-black text-slate-900">Transacción en verificación</h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Wompi está procesando tu pago. En cuanto sea aprobado, tu cupo quedará confirmado automáticamente.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={verificarPago}
              className={`${accountPrimary} flex items-center gap-2`}
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar estado
            </button>
            <Link href="/jornadas" className={accountSecondary}>
              Ir al listado de jornadas
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ReservaResultadoPage() {
  return (
    <AccountLayout
      title={<>Resultado de tu <span className="text-indigo-600">reserva</span></>}
      description="Consulta el estado de tu pago en Wompi y tu comprobante de reserva."
    >
      <Suspense
        fallback={
          <div role="status" className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">Cargando resultado...</p>
          </div>
        }
      >
        <ContenidoResultado />
      </Suspense>
    </AccountLayout>
  );
}
