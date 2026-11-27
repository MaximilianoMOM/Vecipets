'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useListaPerfil } from '@/lib/use-lista-perfil';
import AccountLayout, { accountCard, accountPrimary, accountSecondary } from '../../../components/common/AccountLayout';

type JornadaPropia = {
  id: number;
  titulo: string;
  direccion: string;
  fechaTexto: string;
  horaTexto: string;
  fechaInicio: string;
  cuposTotales: number;
  cuposDisponibles: number;
  activa: boolean;
};

export default function MisJornadasPage() {
  const { user, loading } = useAuth();
  const organizador = user?.rol === 'VETERINARIA' || user?.rol === 'REFUGIO';
  const { datos, error } = useListaPerfil<JornadaPropia>('/jornadas/organizador/mis-jornadas', organizador ? user.id : undefined);

  return (
    <AccountLayout title="Mis jornadas" description="Gestiona las jornadas de tu organización y revisa sus cupos.">
      <div className="flex flex-wrap gap-3">
        <Link href="/perfil" className={accountSecondary}>Volver a mi perfil</Link>
        {organizador && <Link href="/perfil/jornadas" className={accountPrimary}>Publicar jornada</Link>}
      </div>
      {loading ? <p role="status">Cargando tu cuenta…</p> : !organizador ? (
        <p className={accountCard}>Inicia sesión con una cuenta de veterinaria o refugio para ver tus jornadas.</p>
      ) : error ? <p role="alert">No se pudieron cargar tus jornadas.</p> :
        !datos ? <p role="status">Cargando tus jornadas…</p> :
          datos.length === 0 ? <p className={accountCard}>Aún no has publicado jornadas.</p> : (
            <div className="grid gap-5 md:grid-cols-2">
              {datos.map((jornada) => (
                <article key={jornada.id} className={accountCard}>
                  <h2 className="text-xl font-black">{jornada.titulo}</h2>
                  <p className="mt-2 text-sm text-slate-600">{jornada.fechaTexto} · {jornada.horaTexto}</p>
                  <p className="mt-1 text-sm text-slate-600">{jornada.direccion}</p>
                  <p className="mt-3 text-sm font-bold text-indigo-700">{jornada.cuposDisponibles} de {jornada.cuposTotales} cupos disponibles</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/perfil/jornadas/organizador/reservas/${jornada.id}`} className={accountSecondary}>Ver reservas</Link>
                    {jornada.activa && Date.parse(jornada.fechaInicio) > Date.now() && jornada.cuposDisponibles === jornada.cuposTotales && (
                      <Link href={`/perfil/jornadas?editar=${jornada.id}`} className={accountSecondary}>Editar jornada</Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
    </AccountLayout>
  );
}
