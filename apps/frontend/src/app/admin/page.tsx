'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  AlertTriangle,
  FileText,
  User,
  CreditCard,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import AccountLayout, { accountCard } from '../components/common/AccountLayout';
import UsuariosAdmin from './UsuariosAdmin';

interface NotificacionAdmin {
  id: string;
  titulo: string;
  usuarioNombre: string;
  reporteId: number;
  monto: string;
  referencia: string;
  fechaPago: string;
  estado: string;
  enlaceReporte: string;
  leida: boolean;
  creadoEn: string;
}

interface ReporteModeracion {
  id: number;
  nombre: string;
  tipo: string;
  especie: string;
  raza?: string;
  barrioSector: string;
  descripcion: string;
  estado: string;
  estadoAprobacion: string;
  esTurbo: boolean;
  creadoEn?: string;
  fechaEvento?: string;
  usuario?: {
    id: number;
    nombre: string;
    correo?: string;
  };
}

export default function AdminPage() {
    const { user, loading } = useAuth();

    return (
        <AccountLayout title={<span className="text-indigo-600">Administración</span>} description="Gestiona las cuentas, los reportes y las notificaciones de VeciPets.">
            {loading ? (
                <p role="status" className={accountCard}>Cargando el panel…</p>
            ) : user?.rol === 'ADMINISTRADOR' ? (
                <>
                    <UsuariosAdmin />
                    <AdminDashboard />
                </>
            ) : (
                <section className={accountCard}>
                    <p>{user ? 'Esta página requiere permisos de administrador.' : 'Inicia sesión para acceder al panel.'}</p>
                    {!user && <Link href="/login" className="mt-3 inline-block font-bold text-indigo-700 hover:underline">Iniciar sesión</Link>}
                </section>
            )}
        </AccountLayout>
    );
}

function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState<'notificaciones' | 'moderacion'>('notificaciones');

  // Estado Notificaciones Turbo
  const [notificaciones, setNotificaciones] = useState<NotificacionAdmin[]>([]);
  const [cargandoNotif, setCargandoNotif] = useState(false);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);

  // Estado Moderación de Reportes
  const [reportes, setReportes] = useState<ReporteModeracion[]>([]);
  const [cargandoReportes, setCargandoReportes] = useState(false);
  const [filtroModeracion, setFiltroModeracion] = useState<'TODOS' | 'PENDIENTE' | 'PUBLICO'>('PENDIENTE');

  // Cargar notificaciones informativas del admin
  const cargarNotificaciones = useCallback(async () => {
    setCargandoNotif(true);
    setErrorNotif(null);
    try {
      const res = await apiClient.get('/admin/notificaciones');
      setNotificaciones(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error al cargar notificaciones de admin:', err);
      setErrorNotif(err.response?.data?.message || 'No fue posible cargar las notificaciones.');
    } finally {
      setCargandoNotif(false);
    }
  }, []);

  // Cargar reportes para moderación posterior
  const cargarReportes = useCallback(async () => {
    setCargandoReportes(true);
    try {
      const res = await apiClient.get('/reportes', {
        params: { limite: 100 },
      });
      const datos = res.data?.datos ?? res.data ?? [];
      setReportes(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setCargandoReportes(false);
    }
  }, []);

  useEffect(() => {
    void cargarNotificaciones();
    void cargarReportes();
  }, [cargarNotificaciones, cargarReportes]);

  // Marcar notificación como leída
  const handleMarcarLeida = async (id: string) => {
    try {
      await apiClient.patch(`/admin/notificaciones/${id}/leida`);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  // Moderar reporte (aprobar o retirar si hay irregularidades)
  const handleModerarReporte = async (id: number, estadoAprobacion: 'APROBADO' | 'RECHAZADO') => {
    try {
      await apiClient.patch(`/reportes/${id}`, { estadoAprobacion });
      setReportes((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                estadoAprobacion,
                estado: estadoAprobacion === 'APROBADO' ? 'PUBLICO' : 'RECHAZADO',
              }
            : r
        )
      );
    } catch (err) {
      console.error('Error al moderar reporte:', err);
    }
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  const reportesFiltrados = reportes.filter((r) => {
    if (filtroModeracion === 'PENDIENTE') return r.estadoAprobacion === 'PENDIENTE';
    if (filtroModeracion === 'PUBLICO') return r.estado === 'PUBLICO';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-6">

        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
          <div>
            <span className="text-[11px] font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Panel Administrativo • VeciPets 🛡️
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Centro de Gestión y Notificaciones
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión informativa de pagos Turbo y moderación de contenido comunitario.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void cargarNotificaciones();
                void cargarReportes();
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/mapa"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center shadow-sm"
            >
              Ver Mapa en Vivo 🗺️
            </Link>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button
            onClick={() => setTabActiva('notificaciones')}
            className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-2 ${
              tabActiva === 'notificaciones'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            Notificaciones Alerta Turbo
            {noLeidasCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                tabActiva === 'notificaciones'
                  ? 'bg-white text-amber-600'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {noLeidasCount} nuevas
              </span>
            )}
          </button>
          <button
            onClick={() => setTabActiva('moderacion')}
            className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-2 ${
              tabActiva === 'moderacion'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Moderación de Reportes Comunitarios
          </button>
        </div>

        {/* TAB 1: NOTIFICACIONES ALERTA TURBO */}
        {tabActiva === 'notificaciones' && (
          <div className="space-y-4">
            {/* Banner Informativo */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
              <div>
                <p className="font-bold">Notificaciones estrictamente informativas</p>
                <p className="text-amber-800 mt-0.5">
                  Los reportes con Alerta Turbo confirmada por Wompi se publican de forma <strong>100% automática</strong>.
                  No requieren aprobación manual administrativa. El administrador puede consultar la información y marcar la notificación como leída.
                </p>
              </div>
            </div>

            {/* Listado de Notificaciones */}
            {cargandoNotif ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Cargando notificaciones...</p>
              </div>
            ) : errorNotif ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs font-semibold text-rose-800 text-center">
                {errorNotif}
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <p className="text-3xl">⚡</p>
                <p className="text-sm font-bold text-slate-800">No hay notificaciones de Alerta Turbo</p>
                <p className="text-xs text-slate-400">
                  Las confirmaciones de pago exitoso de $15.000 COP aparecerán automáticamente aquí.
                </p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    notif.leida
                      ? 'bg-white border-slate-200 opacity-80'
                      : 'bg-white border-amber-300 shadow-md ring-1 ring-amber-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-amber-700" /> {notif.titulo}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                          Estado: {notif.estado}
                        </span>
                        {notif.leida ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                            Leída
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full animate-pulse">
                            Nueva
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(notif.fechaPago).toLocaleString('es-CO', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* Detalles Requeridos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>Usuario:</strong> {notif.usuarioNombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>Reporte ID:</strong> #{notif.reporteId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span><strong>Monto:</strong> {notif.monto}</span>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3 flex items-center gap-1.5 text-slate-500 font-mono text-[11px] break-all">
                          <span><strong>Referencia:</strong> {notif.referencia}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de la Notificación (Informativa, sin botones de aprobar/rechazar) */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <Link
                        href={notif.enlaceReporte}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Reporte
                      </Link>

                      {!notif.leida && (
                        <button
                          onClick={() => handleMarcarLeida(notif.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MODERACIÓN POSTERIOR DE REPORTES */}
        {tabActiva === 'moderacion' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroModeracion('PENDIENTE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filtroModeracion === 'PENDIENTE'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Pendientes ({reportes.filter((r) => r.estadoAprobacion === 'PENDIENTE').length})
              </button>
              <button
                onClick={() => setFiltroModeracion('PUBLICO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filtroModeracion === 'PUBLICO'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Publicados ({reportes.filter((r) => r.estado === 'PUBLICO').length})
              </button>
              <button
                onClick={() => setFiltroModeracion('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filtroModeracion === 'TODOS'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Todos ({reportes.length})
              </button>
            </div>

            {/* Listado de Reportes */}
            {cargandoReportes ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Cargando reportes...</p>
              </div>
            ) : reportesFiltrados.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <p className="text-3xl">📭</p>
                <p className="text-sm font-bold text-slate-800">No hay reportes en esta sección</p>
              </div>
            ) : (
              reportesFiltrados.map((reporte) => (
                <div
                  key={reporte.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        reporte.tipo === 'PERDIDA' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {reporte.tipo}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                        {reporte.especie} {reporte.raza ? `• ${reporte.raza}` : ''}
                      </span>
                      {reporte.esTurbo && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-amber-950" /> Turbo
                        </span>
                      )}
                      <span className="text-xs text-slate-400">ID: #{reporte.id}</span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base">{reporte.nombre}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {reporte.barrioSector}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">{reporte.descripcion}</p>
                  </div>

                  {/* Acciones de Moderación para Reportes Regulares */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <Link
                      href={`/reportes/${reporte.id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Detalle
                    </Link>

                    {reporte.estadoAprobacion === 'PENDIENTE' ? (
                      <>
                        <button
                          onClick={() => handleModerarReporte(reporte.id, 'RECHAZADO')}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleModerarReporte(reporte.id, 'APROBADO')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Aprobar
                        </button>
                      </>
                    ) : reporte.estado === 'PUBLICO' ? (
                      <button
                        onClick={() => handleModerarReporte(reporte.id, 'RECHAZADO')}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                        title="Retirar reporte del mapa y feed público"
                      >
                        Retirar Reporte
                      </button>
                    ) : (
                      <span className="text-xs text-rose-600 font-bold px-2 py-1 bg-rose-50 rounded-lg">
                        Rechazado / Retirado
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
