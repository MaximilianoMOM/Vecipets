'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Search, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/lib/auth-context';
import { accountStatus, roleLabels } from '@/lib/account-labels';
import { accountCard, accountIcon, accountPrimary } from '../components/common/AccountLayout';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [operacion, setOperacion] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let vigente = true;
    apiClient.get<User[]>('/usuarios')
      .then(({ data }) => { if (vigente) setUsuarios(data); })
      .catch(() => { if (vigente) setErrorCarga(true); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  async function cambiarSuspension(usuario: User) {
    const suspendido = usuario.estadoAprobacion === 'APROBADO';
    if (suspendido && !window.confirm(`¿Suspender la cuenta de ${usuario.nombre}? Se bloqueará su acceso a VeciPets.`)) return;

    setOperacion(usuario.id);
    setError('');
    setMensaje('');
    try {
      const { data } = await apiClient.patch<Pick<User, 'estadoAprobacion'>>(
        `/usuarios/${usuario.id}/suspension`,
        { suspendido },
      );
      setUsuarios((actuales) => actuales.map((actual) =>
        actual.id === usuario.id ? { ...actual, estadoAprobacion: data.estadoAprobacion } : actual,
      ));
      setMensaje(suspendido ? 'Cuenta suspendida.' : 'Cuenta reactivada.');
    } catch (err) {
      const detalle = isAxiosError(err) ? err.response?.data?.message : null;
      setError(typeof detalle === 'string' ? detalle : 'No se pudo actualizar la cuenta. Intenta nuevamente.');
    } finally {
      setOperacion(null);
    }
  }

  const consulta = busqueda.trim().toLowerCase();
  const visibles = usuarios.filter(({ nombre, correo }) =>
    nombre.toLowerCase().includes(consulta) || correo.toLowerCase().includes(consulta),
  );

  return (
    <section className={accountCard} aria-labelledby="accounts-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className={accountIcon}><Users className="h-5 w-5" aria-hidden="true" /></span>
          <h2 id="accounts-title" className="text-2xl font-black tracking-tight text-slate-900">Cuentas de usuarios</h2>
        </div>
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
          <Search className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
          <span className="sr-only">Buscar por nombre o correo</span>
          <input className="min-w-0 bg-transparent text-sm outline-none" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por nombre o correo" />
        </label>
      </div>
      {mensaje && <p role="status" className="mt-4 text-sm text-emerald-700">{mensaje}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
      {cargando ? (
        <p role="status" className="mt-5 text-sm text-slate-600">Cargando cuentas…</p>
      ) : errorCarga ? (
        <p role="alert" className="mt-5 text-sm text-rose-700">No se pudieron cargar las cuentas. Recarga la página para intentarlo de nuevo.</p>
      ) : visibles.length === 0 ? (
        <p className="mt-5 text-sm text-slate-600">No se encontraron cuentas.</p>
      ) : (
        <ul className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
          {visibles.map((usuario) => {
            const inactivo = usuario.estadoAprobacion === 'INACTIVO';
            const puedeCambiar = usuario.rol !== 'ADMINISTRADOR' && (inactivo || usuario.estadoAprobacion === 'APROBADO');
            return (
              <li key={usuario.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="break-words font-bold text-slate-900">{usuario.nombre}</p>
                  <p className="break-all text-sm text-slate-600">{usuario.correo}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-700">{roleLabels[usuario.rol]}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${inactivo ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                  {accountStatus[usuario.estadoAprobacion] ?? usuario.estadoAprobacion}
                </span>
                {puedeCambiar && (
                  <button type="button" disabled={operacion !== null} onClick={() => void cambiarSuspension(usuario)} className={inactivo ? accountPrimary : 'rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50'}>
                    {operacion === usuario.id ? 'Guardando…' : inactivo ? 'Reactivar' : 'Suspender'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
