'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
import type { Aliado } from '../../clinicas/components/TarjetaAliado';
import AccountLayout, { accountCard, accountPrimary, accountSecondary } from '../../components/common/AccountLayout';

const campos = [
  { name: 'nombre', label: 'Nombre público', minLength: 2, maxLength: 100 },
  { name: 'direccion', label: 'Dirección y ciudad', minLength: 5, maxLength: 180 },
  { name: 'horario', label: 'Horario de atención', minLength: 2, maxLength: 140 },
  { name: 'telefono', label: 'Teléfono público, sin espacios', type: 'tel', pattern: '\\+?[0-9]{7,15}' },
];
const input = 'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200';

export default function MisSedesPage() {
  const { user, loading } = useAuth();
  const puedeGestionar = user?.rol === 'VETERINARIA' || user?.rol === 'REFUGIO';
  const { datos, error, setResultado } = useListaPerfil<Aliado>('/sedes/mias', puedeGestionar ? user.id : undefined);
  const [editando, setEditando] = useState<{ usuarioId: number; sede: Aliado }>();
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');
  const sede = editando?.usuarioId === user?.id ? editando?.sede : undefined;

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puedeGestionar || !datos) return;
    const form = event.currentTarget;
    const campos = new FormData(form);
    const contenido = {
      nombre: campos.get('nombre'),
      direccion: campos.get('direccion'),
      horario: campos.get('horario'),
      telefono: campos.get('telefono'),
      tipo: user.rol === 'REFUGIO' ? 'REFUGIO' : campos.get('tipo'),
      imagenUrl: String(campos.get('imagenUrl') ?? '').trim() || null,
      servicios: String(campos.get('servicios') ?? '').split(',').map((servicio) => servicio.trim()).filter(Boolean),
    };
    setGuardando(true);
    setMensaje('');
    setErrorGuardado('');
    try {
      const { data } = sede
        ? await apiClient.patch<Aliado>(`/sedes/${sede.id}`, contenido)
        : await apiClient.post<Aliado>('/sedes', contenido);
      setResultado((actual) => actual?.usuarioId === user.id ? {
        ...actual,
        datos: sede ? actual.datos.map((item) => item.id === sede.id ? data : item) : [...actual.datos, data],
      } : actual);
      form.reset();
      setEditando(undefined);
      setMensaje(sede ? 'Sede actualizada.' : 'Sede publicada en el directorio.');
    } catch (err) {
      const detalle = isAxiosError(err) ? err.response?.data?.message : null;
      setErrorGuardado(Array.isArray(detalle) ? detalle.join(' ') :
        typeof detalle === 'string' ? detalle : 'No se pudo guardar la sede.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <AccountLayout title="Mis sedes" description="Publica y actualiza la información de atención de tu organización.">
      <div className="flex flex-wrap gap-3">
        <Link href="/perfil" className={accountSecondary}>Volver a mi perfil</Link>
        <Link href="/clinicas" className={accountSecondary}>Ver directorio</Link>
      </div>
      {loading ? <p role="status">Cargando tu cuenta…</p> : !puedeGestionar ? (
        <p className={accountCard}>La gestión de sedes está disponible para veterinarias y refugios aprobados.</p>
      ) : error ? <p role="alert">No se pudieron cargar tus sedes.</p> :
        !datos ? <p role="status">Cargando tus sedes…</p> : (
          <div className="grid items-start gap-6 lg:grid-cols-5">
            <form key={sede?.id ?? 'nueva'} onSubmit={guardar} className={`${accountCard} space-y-5 lg:col-span-3`}>
              <h2 className="text-xl font-black">{sede ? 'Editar sede' : 'Nueva sede'}</h2>
              <fieldset disabled={guardando} className="grid gap-4 sm:grid-cols-2">
                {campos.map(({ name, label, ...props }) => (
                  <label key={name} className="text-sm font-bold">{label}
                    <input {...props} required name={name} className={input} defaultValue={sede?.[name as 'nombre' | 'direccion' | 'horario' | 'telefono']} />
                  </label>
                ))}
                {user.rol === 'VETERINARIA' && (
                  <label className="text-sm font-bold">Tipo de sede
                    <select name="tipo" defaultValue={sede?.tipo ?? 'VETERINARIA'} className={input}>
                      <option value="VETERINARIA">Veterinaria</option>
                      <option value="CLINICA">Clínica</option>
                    </select>
                  </label>
                )}
                <label className="text-sm font-bold">Servicios separados por comas
                  <input required name="servicios" maxLength={730} className={input} defaultValue={sede?.servicios.join(', ')} />
                </label>
                <label className="text-sm font-bold sm:col-span-2">Enlace HTTPS de la foto (opcional)
                  <input type="url" name="imagenUrl" maxLength={1000} className={input} defaultValue={sede?.imagenUrl ?? ''} />
                </label>
              </fieldset>
              {mensaje && <p role="status" className="text-sm text-emerald-700">{mensaje}</p>}
              {errorGuardado && <p role="alert" className="text-sm text-rose-700">{errorGuardado}</p>}
              <div className="flex flex-wrap gap-2">
                <button disabled={guardando} className={accountPrimary}>{guardando ? 'Guardando…' : sede ? 'Guardar cambios' : 'Publicar sede'}</button>
                {sede && <button type="button" disabled={guardando} className={accountSecondary} onClick={() => setEditando(undefined)}>Cancelar edición</button>}
              </div>
            </form>
            <section className={`${accountCard} lg:col-span-2`} aria-label="Sedes publicadas">
              <h2 className="text-xl font-black">Sedes publicadas</h2>
              {datos.length === 0 ? <p className="mt-3 text-sm text-slate-600">Aún no has publicado sedes.</p> : (
                <ul className="mt-2 divide-y divide-slate-200">
                  {datos.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div><p className="font-bold">{item.nombre}</p><p className="text-sm text-slate-600">{item.direccion}</p></div>
                      <button type="button" disabled={guardando} className={accountSecondary} onClick={() => {
                        setMensaje('');
                        setErrorGuardado('');
                        setEditando({ usuarioId: user.id, sede: item });
                      }}>Editar</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
    </AccountLayout>
  );
}
