'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import AccountLayout, { accountCard, accountPrimary, accountSecondary } from '../../components/common/AccountLayout';

const inputClass = 'mt-2 block min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-normal text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200';
const fields = [
  { name: 'titulo', label: 'Nombre de la jornada', maxLength: 120, minLength: 4 },
  { name: 'comuna', label: 'Comuna o sector', maxLength: 80, minLength: 2 },
  { name: 'direccion', label: 'Dirección y ciudad', maxLength: 160, minLength: 4 },
  { name: 'inicio', label: 'Fecha y hora de inicio (Colombia)', type: 'datetime-local' },
  { name: 'fin', label: 'Fecha y hora de cierre (Colombia)', type: 'datetime-local' },
  { name: 'cupos', label: 'Cupos ofrecidos', type: 'number', min: 1, max: 10000 },
  { name: 'precioCop', label: 'Costo del procedimiento en COP (0 si es gratuito)', type: 'number', min: 0, max: 21474836 },
];

export default function PublicarJornadaPage() {
  const { user, loading } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [publicada, setPublicada] = useState(false);

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setGuardando(true);
    setError('');
    setPublicada(false);
    try {
      await apiClient.post('/jornadas', {
        titulo: data.get('titulo'),
        comuna: data.get('comuna'),
        direccion: data.get('direccion'),
        inicio: `${data.get('inicio')}:00-05:00`,
        fin: `${data.get('fin')}:00-05:00`,
        cupos: Number(data.get('cupos')),
        precioCop: Number(data.get('precioCop')),
      });
      form.reset();
      setPublicada(true);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      setError(Array.isArray(message) ? message.join(' ') :
        typeof message === 'string' ? message : 'No se pudo publicar la jornada. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <AccountLayout title={<>Publicar <span className="text-indigo-600">jornada</span></>} description="Completa los datos que aparecerán en la tarjeta pública de tu jornada.">
      <Link href="/perfil" className={accountSecondary}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a mi perfil</Link>
      {loading ? (
        <p role="status" className={accountCard}>Cargando tu cuenta…</p>
      ) : user?.rol === 'VETERINARIA' ? (
        <form onSubmit={publicar} className={`${accountCard} max-w-4xl space-y-6`}>
          <fieldset disabled={guardando} className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">
            {fields.map(({ name, label, ...props }) => (
              <label key={name} className={`min-w-0 text-sm font-bold text-slate-800 ${name === 'titulo' ? 'sm:col-span-2' : ''}`}>
                {label}
                <input {...props} name={name} required className={inputClass} />
              </label>
            ))}
          </fieldset>
          <p className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-900">
            La tarifa por cupo es de $2.000 si el procedimiento es gratuito,
            $5.000 si tiene costo y la jornada ofrece hasta 50 cupos, o $10.000 si tiene costo y ofrece más de 50.
          </p>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {publicada && (
            <p role="status" className="text-sm font-medium text-emerald-800">
              Jornada publicada. <Link href="/jornadas" className="font-bold underline">Ver el listado público</Link>
            </p>
          )}
          <button disabled={guardando} className={`${accountPrimary} w-full sm:w-auto`}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            {guardando ? 'Publicando…' : 'Publicar jornada'}
          </button>
        </form>
      ) : (
        <section className={accountCard}>
          <p>Solo las cuentas de veterinaria pueden publicar jornadas.</p>
          {!user && <Link href="/login" className="mt-3 inline-block font-bold text-indigo-700 hover:underline">Iniciar sesión</Link>}
        </section>
      )}
    </AccountLayout>
  );
}
