'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AccountLayout, { accountCard } from '../../components/common/AccountLayout';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { DatosReserva, type ReservaCiudadana } from '../components/DatosReserva';

export default function MisReservasPage() {
  const { user, loading } = useAuth();
  const [resultado, setResultado] = useState<{ usuarioId: number; reservas: ReservaCiudadana[] | null }>();
  const ciudadanoId = user?.rol === 'CIUDADANO' ? user.id : undefined;
  useEffect(() => {
    if (ciudadanoId === undefined) return;
    const abort = new AbortController();
    apiClient.get<ReservaCiudadana[]>('/jornadas/mis-reservas', { signal: abort.signal })
      .then(({ data }) => {
        if (!abort.signal.aborted) setResultado({ usuarioId: ciudadanoId, reservas: data });
      })
      .catch(() => {
        if (!abort.signal.aborted) setResultado({ usuarioId: ciudadanoId, reservas: null });
      });
    return () => abort.abort();
  }, [ciudadanoId]);

  useEffect(() => {
    const fragmento = window.location.hash.slice(1);
    if (/^reserva-\d+$/.test(fragmento)) document.getElementById(fragmento)?.scrollIntoView();
  }, [resultado]);

  const reservas = resultado?.usuarioId === ciudadanoId ? resultado?.reservas : undefined;
  return (
    <AccountLayout title="Mis reservas" description="Consulta tus apartados y comprobantes de jornadas veterinarias.">
      <div className="space-y-4">
        <Link href="/jornadas" className="font-semibold text-indigo-700 underline">Volver a jornadas</Link>
        {loading ? <p role="status">Cargando sesión…</p>
          : ciudadanoId === undefined ? <Link href="/login" className="block underline">Inicia sesión para consultar tus reservas</Link>
          : reservas === undefined ? <p role="status">Cargando reservas…</p>
          : reservas === null ? <p role="alert">No se pudieron consultar tus reservas.</p>
          : reservas.length === 0 ? <p>No tienes reservas registradas.</p>
          : reservas.map((reserva) => (
            <section className={accountCard + ' scroll-mt-24'} id={'reserva-' + reserva.id} key={reserva.id}>
              <DatosReserva reserva={reserva} />
            </section>
          ))}
      </div>
    </AccountLayout>
  );
}