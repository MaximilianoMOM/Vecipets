'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
import AccountLayout, { accountCard, accountSecondary } from '../../components/common/AccountLayout';

type ReservaPropia = {
  id: number;
  codigo: string;
  jornadaTitulo?: string;
  nombreMascota: string;
  estado: string;
  fechaTexto?: string;
  horaTexto?: string;
  direccion?: string;
};

export default function MisReservasPage() {
  const { user, loading } = useAuth();
  const ciudadano = user?.rol === 'CIUDADANO';
  const { datos, error } = useListaPerfil<ReservaPropia>('/jornadas/mis-reservas', ciudadano ? user.id : undefined);

  return (
    <AccountLayout title="Mis reservas" description="Consulta tus cupos apartados y su estado.">
      <div className="flex flex-wrap gap-3">
        <Link href="/perfil" className={accountSecondary}>Volver a mi perfil</Link>
        <Link href="/jornadas" className={accountSecondary}>Ver jornadas</Link>
      </div>
      {loading ? <p role="status">Cargando tu cuenta…</p> : !ciudadano ? (
        <p className={accountCard}>Inicia sesión con una cuenta de ciudadano para ver tus reservas.</p>
      ) : error ? <p role="alert">No se pudieron cargar tus reservas.</p> :
        !datos ? <p role="status">Cargando tus reservas…</p> :
          datos.length === 0 ? <p className={accountCard}>Aún no tienes reservas.</p> : (
            <div className="grid gap-5 md:grid-cols-2">
              {datos.map((reserva) => (
                <article key={reserva.id} className={accountCard}>
                  <p className="text-sm font-bold text-primary-hover">{reserva.estado}</p>
                  <h2 className="mt-1 text-xl font-black">{reserva.jornadaTitulo ?? 'Jornada veterinaria'}</h2>
                  <p className="mt-2 text-sm text-slate-600">{reserva.nombreMascota} · {reserva.codigo}</p>
                  {reserva.fechaTexto && <p className="mt-1 text-sm text-slate-600">{reserva.fechaTexto} · {reserva.horaTexto}</p>}
                  {reserva.direccion && <p className="mt-1 text-sm text-slate-600">{reserva.direccion}</p>}
                </article>
              ))}
            </div>
          )}
    </AccountLayout>
  );
}
