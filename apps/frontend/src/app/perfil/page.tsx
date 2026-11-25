'use client';

import Link from 'next/link';
import { ArrowRight, Building2, HeartHandshake, PawPrint, Shield, Stethoscope } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { accountStatus, roleLabels } from '@/lib/account-labels';
import AccountLayout, { accountCard, accountIcon, accountPrimary, accountSecondary } from '../components/common/AccountLayout';

const roleDetails = {
  CIUDADANO: {
    icon: HeartHandshake,
    description: 'Encuentra mascotas y comparte una alerta con tu comunidad.',
    links: [{ href: '/reportar', label: 'Reportar mascota' }, { href: '/reportes', label: 'Ver reportes' }],
  },
  ADMINISTRADOR: {
    icon: Shield,
    description: 'Gestiona el acceso de las cuentas de VeciPets.',
    links: [{ href: '/admin', label: 'Abrir panel de administración' }],
  },
  REFUGIO: {
    icon: Building2,
    description: 'Consulta alertas de mascotas y jornadas de la comunidad.',
    links: [{ href: '/reportes', label: 'Ver reportes' }, { href: '/jornadas', label: 'Ver jornadas' }],
  },
  VETERINARIA: {
    icon: Stethoscope,
    description: 'Publica jornadas de atención para que la comunidad pueda verlas.',
    links: [{ href: '/perfil/jornadas', label: 'Publicar jornada' }, { href: '/jornadas', label: 'Ver jornadas' }],
  },
};

export default function PerfilPage() {
  const { user, loading } = useAuth();
  const details = user ? roleDetails[user.rol] : null;
  const Icon = details?.icon ?? PawPrint;

  return (
    <AccountLayout title={<>Mi <span className="text-indigo-600">perfil</span></>} description="Consulta tu cuenta y accede a las herramientas de VeciPets.">
      {loading ? (
        <p role="status" className={accountCard}>Cargando tu perfil…</p>
      ) : user && details ? (
        <div className="grid max-w-5xl gap-6 md:grid-cols-5">
          <section className={`${accountCard} md:col-span-3`} aria-labelledby="account-name">
            <div className="flex items-center gap-4">
              <div className={accountIcon}>
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-700">{roleLabels[user.rol]}</p>
                <h2 id="account-name" className="break-words text-2xl font-black tracking-tight text-slate-900">{user.nombre}</h2>
              </div>
            </div>
            <dl className="mt-6 grid gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-slate-600">Correo electrónico</dt>
                <dd className="mt-1 break-all font-medium">{user.correo}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-600">Estado de la cuenta</dt>
                <dd className="mt-1 font-medium">{accountStatus[user.estadoAprobacion] ?? user.estadoAprobacion}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-600">Verificación del correo</dt>
                <dd className="mt-1 font-medium">{user.correoVerificado ? 'Verificado' : 'Pendiente'}</dd>
              </div>
            </dl>
          </section>
          <section className={`${accountCard} md:col-span-2`} aria-labelledby="account-actions">
            <h2 id="account-actions" className="text-xl font-black tracking-tight text-slate-900">Accesos de {roleLabels[user.rol].toLowerCase()}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{details.description}</p>
            <div className="mt-5 grid gap-3">
              {details.links.map(({ href, label }, index) => (
                <Link key={href} href={href} className={index === 0 ? accountPrimary : accountSecondary}>
                  {label}
                  {index === 0 && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section className={accountCard}>
          <p>Inicia sesión para ver tu perfil.</p>
          <Link href="/login" className={`mt-4 ${accountPrimary}`}>
            Iniciar sesión
          </Link>
        </section>
      )}
    </AccountLayout>
  );
}
