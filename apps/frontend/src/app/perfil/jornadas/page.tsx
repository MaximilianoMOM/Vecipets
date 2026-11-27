'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
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

type JornadaEditable = {
  id: number;
  titulo: string;
  comuna: string;
  direccion: string;
  fechaInicio: string;
  fechaFin: string;
  cuposTotales: number;
  precioProcedimientoCentavos: number;
};

function fechaLocal(iso: string) {
  return new Date(Date.parse(iso) - 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export default function PublicarJornadaPage() {
  return <Suspense fallback={<p role="status">Cargando formulario…</p>}><FormularioJornada /></Suspense>;
}

function FormularioJornada() {
  const { user, loading } = useAuth();
  const editarId = useSearchParams().get('editar');
  const organizador = user?.rol === 'VETERINARIA' || user?.rol === 'REFUGIO';
  const { datos, error: errorCarga } = useListaPerfil<JornadaEditable>(
    '/jornadas/organizador/mis-jornadas', organizador && editarId ? user.id : undefined,
  );
  const jornada = datos?.find(({ id }) => String(id) === editarId);
  const valores = jornada ? {
    titulo: jornada.titulo,
    comuna: jornada.comuna,
    direccion: jornada.direccion,
    inicio: fechaLocal(jornada.fechaInicio),
    fin: fechaLocal(jornada.fechaFin),
    cupos: jornada.cuposTotales,
    precioCop: jornada.precioProcedimientoCentavos / 100,
  } : undefined;
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
      const datosJornada = {
        titulo: data.get('titulo'),
        comuna: data.get('comuna'),
        direccion: data.get('direccion'),
        inicio: `${data.get('inicio')}:00-05:00`,
        fin: `${data.get('fin')}:00-05:00`,
        cupos: Number(data.get('cupos')),
        precioCop: Number(data.get('precioCop')),
      };
      if (jornada) {
        await apiClient.patch(`/jornadas/${jornada.id}`, datosJornada);
      } else {
        await apiClient.post('/jornadas', datosJornada);
        form.reset();
      }
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
    <AccountLayout title={<>{editarId ? 'Editar' : 'Publicar'} <span className="text-indigo-600">jornada</span></>} description="Completa los datos que aparecerán en la tarjeta pública de tu jornada.">
      <Link href="/perfil/jornadas/organizador" className={accountSecondary}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a mis jornadas</Link>
      {loading ? (
        <p role="status" className={accountCard}>Cargando tu cuenta…</p>
      ) : organizador ? (
        editarId && !jornada ? (
          <p className={accountCard} role={errorCarga || datos ? 'alert' : 'status'}>
            {errorCarga ? 'No se pudo cargar la jornada.' : datos ? 'La jornada no pertenece a tu cuenta o ya no está disponible.' : 'Cargando jornada…'}
          </p>
        ) : <form key={jornada?.id ?? 'nueva'} onSubmit={publicar} className={`${accountCard} max-w-4xl space-y-6`}>
          <fieldset disabled={guardando} className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">
            {fields.map(({ name, label, ...props }) => (
              <label key={name} className={`min-w-0 text-sm font-bold text-slate-800 ${name === 'titulo' ? 'sm:col-span-2' : ''}`}>
                {label}
                <input {...props} name={name} defaultValue={valores?.[name as keyof typeof valores]} required className={inputClass} />
              </label>
            ))}
          </fieldset>
          <p className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-900">
            El valor del apartado se calcula según el costo del procedimiento: $2.000 COP si es gratuito, $5.000 COP si cuesta entre $1 y $49.999 COP, y $10.000 COP si cuesta $50.000 COP o más. Este valor lo abona el ciudadano al apartar su cupo mediante VeciPets.
          </p>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {publicada && (
            <p role="status" className="text-sm font-medium text-emerald-800">
              {jornada ? 'Cambios guardados.' : 'Jornada publicada.'} <Link href="/perfil/jornadas/organizador" className="font-bold underline">Ver mis jornadas</Link>
            </p>
          )}
          <button disabled={guardando} className={`${accountPrimary} w-full sm:w-auto`}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            {guardando ? 'Guardando…' : jornada ? 'Guardar cambios' : 'Publicar jornada'}
          </button>
        </form>
      ) : (
        <section className={accountCard}>
          <p>Solo las cuentas de veterinaria o refugio pueden publicar jornadas.</p>
          {!user && <Link href="/login" className="mt-3 inline-block font-bold text-indigo-700 hover:underline">Iniciar sesión</Link>}
        </section>
      )}
    </AccountLayout>
  );
}
