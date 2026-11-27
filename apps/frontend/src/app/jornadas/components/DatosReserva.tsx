import Link from 'next/link';
import { accountPrimary, accountSecondary } from '../../components/common/AccountLayout';

export interface ReservaCiudadana {
  id: number;
  jornadaId: number;
  codigo: string;
  estado: string;
  pagoEstado: string | null;
  expiraEn: string;
  jornadaTitulo?: string;
  veterinaria?: string;
  fechaTexto?: string;
  horaTexto?: string;
  direccion?: string;
  procedimiento?: string | null;
  instrucciones?: string | null;
  requisitos?: string | null;
  contacto?: string | null;
  precioProcedimientoHistoricoCentavos: number;
  precioApartadoHistoricoCentavos: number;
  saldoPendienteCentavos: number;
}

const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});

export function DatosReserva({ reserva }: { reserva: ReservaCiudadana }) {
  const { precioApartadoHistoricoCentavos: apartado, precioProcedimientoHistoricoCentavos: precio } = reserva;
  const filas = [
    ['Jornada', reserva.jornadaTitulo], ['Veterinaria', reserva.veterinaria],
    ['Código de reserva', reserva.codigo], ['Estado del pago', reserva.pagoEstado],
    ['Estado de la reserva', reserva.estado],
    ['Fecha y hora', [reserva.fechaTexto, reserva.horaTexto].filter(Boolean).join(' · ')],
    ['Dirección', reserva.direccion], ['Procedimiento', reserva.procedimiento],
    ['Valor del procedimiento', moneda.format(precio / 100)],
    [reserva.pagoEstado === 'APROBADO' ? 'Apartado pagado' : 'Valor del apartado', moneda.format(apartado / 100)],
    ['Saldo pendiente en la jornada', moneda.format(reserva.saldoPendienteCentavos / 100)],
    ['Instrucciones y recomendaciones', reserva.instrucciones],
    ['Requisitos para asistir', reserva.requisitos],
    ['Contacto autorizado', reserva.contacto],
  ];
  return (
    <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
      {filas.map(([titulo, valor]) => (
        <div key={titulo}>
          <dt className="font-semibold text-slate-700">{titulo}</dt>
          <dd className="whitespace-pre-wrap break-words text-slate-600">{valor || 'Información no publicada'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ModalReservaConfirmada({ reserva, onClose }: { reserva: ReservaCiudadana; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="reserva-confirmada"
        onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
        className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <h2 id="reserva-confirmada" className="text-xl font-black text-emerald-800">¡Ya tienes tu cupo apartado!</h2>
        <p className="text-sm text-slate-700">Tu pago fue aprobado correctamente y tu reserva está confirmada.</p>
        <DatosReserva reserva={reserva} />
        <div className="flex flex-wrap gap-3">
          <Link className={accountPrimary} href={'/jornadas/mis-reservas#reserva-' + reserva.id}>Ver mi reserva</Link>
          <button autoFocus type="button" className={accountSecondary} onClick={onClose}>Cerrar</button>
        </div>
      </section>
    </div>
  );
}