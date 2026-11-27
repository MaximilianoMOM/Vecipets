'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
import AccountLayout, { accountCard, accountSecondary } from '../../../../../components/common/AccountLayout';

type ReservaOrganizador = {
  id: number;
  codigo: string;
  nombrePropietario: string;
  nombreMascota: string;
  estado: string;
};

export default function ReservasDeJornadaPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const organizador = user?.rol === 'VETERINARIA' || user?.rol === 'REFUGIO';
  const { datos, error } = useListaPerfil<ReservaOrganizador>(`/jornadas/${encodeURIComponent(id)}/reservas`, organizador ? user.id : undefined);

  return (
    <AccountLayout title="Reservas de la jornada" description="Revisa los cupos solicitados para esta jornada.">
      <Link href="/perfil/jornadas/organizador" className={accountSecondary}>Volver a mis jornadas</Link>
      {loading ? <p role="status">Cargando tu cuenta…</p> : !organizador ? (
        <p className={accountCard}>Inicia sesión como organizador para ver las reservas.</p>
      ) : error ? <p role="alert">No se pudieron consultar las reservas de esta jornada.</p> :
        !datos ? <p role="status">Cargando reservas…</p> :
          datos.length === 0 ? <p className={accountCard}>Esta jornada aún no tiene reservas.</p> : (
            <ul className={`${accountCard} divide-y divide-slate-200`}>
              {datos.map((reserva) => (
                <li key={reserva.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-bold">{reserva.nombreMascota}</p>
                    <p className="text-sm text-slate-600">{reserva.nombrePropietario} · {reserva.codigo}</p>
                  </div>
                  <p className="text-sm font-bold text-indigo-700">{reserva.estado}</p>
                </li>
              ))}
            </ul>
          )}
    </AccountLayout>
  );
}
