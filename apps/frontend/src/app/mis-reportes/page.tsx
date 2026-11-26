'use client';

import Link from 'next/link';
import { useState } from 'react';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
import AccountLayout, { accountCard, accountPrimary, accountSecondary } from '../components/common/AccountLayout';

type ReportePropio = {
  id: number;
  nombre: string;
  barrioSector: string;
  estado: string;
  estadoAprobacion: string;
  enviadoRevision: boolean;
};

const estados: Record<string, string> = {
  PENDIENTE: 'Pendiente de revisión',
  PUBLICO: 'Publicado',
  RECHAZADO: 'Rechazado',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};

export default function MisReportesPage() {
  const { user, loading } = useAuth();
  const ciudadano = user?.rol === 'CIUDADANO' ? user : null;
  const { datos, error, setResultado } = useListaPerfil<ReportePropio>('/reportes/mis-reportes', ciudadano?.id);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function cambiarEstado(id: number, estado: 'RESUELTO' | 'CERRADO') {
    if (!ciudadano) return;
    setGuardando(true);
    setMensaje('');
    try {
      const { data } = await apiClient.patch<ReportePropio>(`/reportes/${id}`, { estado });
      setResultado((actual) => actual?.usuarioId === ciudadano.id
        ? { ...actual, datos: actual.datos.map((reporte) => reporte.id === id ? data : reporte) }
        : actual);
    } catch (err) {
      const detalle = isAxiosError(err) ? err.response?.data?.message : null;
      setMensaje(typeof detalle === 'string' ? detalle : 'No se pudo actualizar el reporte.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <AccountLayout title="Mis reportes" description="Consulta el estado de tus reportes y marca los casos resueltos.">
      <Link href="/perfil" className={accountSecondary}>Volver a mi perfil</Link>
      {loading ? <p role="status">Cargando tu cuenta…</p> : !ciudadano ? (
        <p className={accountCard}>Inicia sesión con una cuenta de ciudadano para ver tus reportes.</p>
      ) : (
        <>
          <div><Link href="/reportar" className={accountPrimary}>Crear reporte</Link></div>
          {mensaje && <p role="alert" className="text-rose-700">{mensaje}</p>}
          {error ? <p role="alert">No se pudieron cargar tus reportes.</p> :
            !datos ? <p role="status">Cargando tus reportes…</p> :
              datos.length === 0 ? <p className={accountCard}>Aún no tienes reportes.</p> : (
                <div className="grid gap-5 md:grid-cols-2">
                  {datos.map((reporte) => (
                    <article key={reporte.id} className={accountCard}>
                      <p className="text-sm font-bold text-indigo-700">{reporte.enviadoRevision ? (estados[reporte.estado] ?? reporte.estado) : 'Borrador'}</p>
                      <h2 className="mt-1 text-xl font-black">{reporte.nombre}</h2>
                      <p className="mt-1 text-sm text-slate-600">{reporte.barrioSector}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/reportes/${reporte.id}`} className={accountSecondary}>Ver detalles</Link>
                        {reporte.estado === 'PUBLICO' && (
                          <button disabled={guardando} className={accountPrimary} onClick={() => void cambiarEstado(reporte.id, 'RESUELTO')}>Marcar como resuelto</button>
                        )}
                        {['PUBLICO', 'RESUELTO'].includes(reporte.estado) && (
                          <button disabled={guardando} className={accountSecondary} onClick={() => void cambiarEstado(reporte.id, 'CERRADO')}>Cerrar reporte</button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
        </>
      )}
    </AccountLayout>
  );
}
