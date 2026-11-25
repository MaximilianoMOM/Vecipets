'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Syringe, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AccountLayout, { accountCard, accountIcon } from '../components/common/AccountLayout';

interface Jornada {
  id: number;
  titulo: string;
  comuna: string;
  direccion: string;
  inicio: string;
  fin: string;
  cupos: number;
  precioCop: number;
  precioApartadoCop: number;
  veterinaria: string;
}

const fechaJornada = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
});
const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function PaginaJornadas() {
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');

  useEffect(() => {
    const abort = new AbortController();
    apiClient.get<Jornada[]>('/jornadas', { signal: abort.signal })
      .then(({ data }) => {
        if (abort.signal.aborted) return;
        setJornadas(data);
        setEstado('listo');
      })
      .catch(() => { if (!abort.signal.aborted) setEstado('error'); });
    return () => abort.abort();
  }, []);

  return (
    <AccountLayout title={<>Jornadas <span className="text-indigo-600">veterinarias</span></>} description="Encuentra próximas jornadas de vacunación, esterilización y otros servicios para tu mascota.">
      {estado === 'cargando' && <p role="status" className={accountCard}>Cargando jornadas…</p>}
      {estado === 'error' && <p role="alert" className={accountCard}>No se pudieron cargar las jornadas. Recarga la página para volver a intentarlo.</p>}
      {estado === 'listo' && jornadas.length === 0 && <p className={accountCard}>Aún no hay próximas jornadas publicadas.</p>}
      {estado === 'listo' && jornadas.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jornadas.map((jornada) => (
            <article key={jornada.id} className={`${accountCard} flex min-w-0 flex-col gap-5`}>
              <div className="flex items-start gap-3">
                <span className={accountIcon}>
                  <Syringe className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-indigo-700">{jornada.veterinaria}</p>
                  <h2 className="break-words text-xl font-black tracking-tight text-slate-900">{jornada.titulo}</h2>
                </div>
              </div>
              <div className="grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
                <p className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span>{fechaJornada.formatRange(new Date(jornada.inicio), new Date(jornada.fin))}</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="break-words">{jornada.direccion} · {jornada.comuna}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  {jornada.cupos} {jornada.cupos === 1 ? 'cupo disponible' : 'cupos disponibles'}
                </p>
              </div>
              <dl className="mt-auto divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-sm">
                <div className="flex justify-between gap-3 px-4 py-2.5">
                  <dt>Procedimiento</dt>
                  <dd className="text-right font-semibold">{jornada.precioCop === 0 ? 'Gratuito' : pesos.format(jornada.precioCop)}</dd>
                </div>
                <div className="flex justify-between gap-3 px-4 py-2.5">
                  <dt>Apartado por cupo</dt>
                  <dd className="text-right font-semibold">{pesos.format(jornada.precioApartadoCop)}</dd>
                </div>
                <div className="flex justify-between gap-3 bg-amber-50 px-4 py-3 font-bold text-slate-900">
                  <dt>Total por cupo</dt>
                  <dd className="text-right">{pesos.format(jornada.precioCop + jornada.precioApartadoCop)} COP</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
