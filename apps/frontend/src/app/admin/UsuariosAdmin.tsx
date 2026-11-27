'use client';

import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Search, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/lib/auth-context';
import { accountStatus, roleLabels } from '@/lib/account-labels';
import { accountCard, accountIcon, accountPrimary } from '../components/common/AccountLayout';

const destructiveButton = 'rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [operacion, setOperacion] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const dialogo = useRef<HTMLDialogElement>(null);
  const guardando = useRef(false);
  const [decision, setDecision] = useState<{
    usuario: User;
    estado: 'APROBADO' | 'RECHAZADO';
  } | null>(null);

  useEffect(() => {
    let vigente = true;
    apiClient.get<User[]>('/usuarios')
      .then(({ data }) => { if (vigente) setUsuarios(data); })
      .catch(() => { if (vigente) setErrorCarga(true); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (decision) dialogo.current?.showModal();
  }, [decision]);

  async function actualizarCuenta(
    usuario: User,
    endpoint: 'suspension' | 'aprobacion',
    cambios: { suspendido: boolean } | { estado: 'APROBADO' | 'RECHAZADO' },
    aviso: string,
  ) {
    if (guardando.current) return;
    guardando.current = true;
    setOperacion(usuario.id);
    setError('');
    setMensaje('');
    try {
      const { data } = await apiClient.patch<Pick<User, 'estadoAprobacion'>>(
        `/usuarios/${usuario.id}/${endpoint}`,
        cambios,
      );
      setUsuarios((actuales) => actuales.map((actual) =>
        actual.id === usuario.id ? { ...actual, estadoAprobacion: data.estadoAprobacion } : actual,
      ));
      setMensaje(aviso);
    } catch (err) {
      const detalle = isAxiosError(err) ? err.response?.data?.message : null;
      setError(typeof detalle === 'string' ? detalle : 'No se pudo actualizar la cuenta. Intenta nuevamente.');
    } finally {
      guardando.current = false;
      setOperacion(null);
    }
  }

  function cambiarSuspension(usuario: User) {
    const suspendido = usuario.estadoAprobacion === 'APROBADO';
    if (suspendido && !window.confirm(`¿Suspender la cuenta de ${usuario.nombre}?`)) return;
    void actualizarCuenta(usuario, 'suspension', { suspendido },
      suspendido ? 'Cuenta suspendida.' : 'Cuenta reactivada.');
  }

  function moderarAliado(usuario: User, estado: 'APROBADO' | 'RECHAZADO') {
    setDecision({ usuario, estado });
  }

  function confirmarDecision() {
    if (!decision || !dialogo.current?.open) return;
    const { usuario, estado } = decision;
    dialogo.current.close();
    void actualizarCuenta(usuario, 'aprobacion', { estado },
      `Solicitud de ${usuario.nombre} ${estado === 'APROBADO' ? 'aprobada' : 'rechazada'}.`);
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
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
          <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="sr-only">Buscar por nombre o correo</span>
          <input className="min-w-0 bg-transparent text-sm outline-none" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por nombre o correo" />
        </label>
      </div>
      {mensaje && <p role="status" className="mt-4 text-sm text-emerald-700">{mensaje}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
      <dialog ref={dialogo} onClose={() => setDecision(null)} aria-labelledby="approval-title" aria-describedby="approval-account"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/50">
        {decision && (
          <>
            <h3 id="approval-title" className="text-lg font-bold">
              {decision.estado === 'APROBADO' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </h3>
            <p id="approval-account" className="mt-2 break-words text-sm text-slate-600">
              {decision.usuario.nombre} ({decision.usuario.correo})
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" autoFocus className={destructiveButton} onClick={() => dialogo.current?.close()}>Cancelar</button>
              <button type="button" className={accountPrimary} onClick={confirmarDecision}>Confirmar</button>
            </div>
          </>
        )}
      </dialog>
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
            const aliadoPendiente = (usuario.rol === 'VETERINARIA' || usuario.rol === 'REFUGIO') &&
              usuario.estadoAprobacion === 'PENDIENTE';
            return (
              <li key={usuario.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="break-words font-bold text-slate-900">{usuario.nombre}</p>
                  <p className="break-all text-sm text-slate-600">{usuario.correo}</p>
                </div>
                <span className="text-sm font-semibold text-primary-hover">{roleLabels[usuario.rol]}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${inactivo ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                  {accountStatus[usuario.estadoAprobacion] ?? usuario.estadoAprobacion}
                </span>
                {aliadoPendiente && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={operacion !== null} className={accountPrimary} onClick={() => moderarAliado(usuario, 'APROBADO')}>Aprobar</button>
                    <button type="button" disabled={operacion !== null} className={destructiveButton} onClick={() => moderarAliado(usuario, 'RECHAZADO')}>Rechazar</button>
                  </div>
                )}
                {puedeCambiar && (
                  <button type="button" disabled={operacion !== null} onClick={() => cambiarSuspension(usuario)} className={inactivo ? accountPrimary : destructiveButton}>
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
