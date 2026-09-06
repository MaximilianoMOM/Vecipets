'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MapaReportesDynamic } from '@/components/mapa/MapDynamicWrapper';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function ReporteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { mostrarToast } = useToast();
  const id = params?.id as string;

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    const cargarReporte = async () => {
      if (!id) return;
      try {
        const datos = await reportesAPI.getReporteById(id);
        setReporte(datos);
      } catch (err) {
        // Datos mock de respaldo si no se encuentra en el backend
        setReporte({
          id,
          titulo: 'Mascota reportada en la comunidad',
          nombreMascota: 'Bruno',
          especie: 'PERRO',
          raza: 'Beagle',
          color: 'Tricolor (Blanco, café y negro)',
          tipo: 'PERDIDO',
          estado: 'PERDIDO',
          descripcion:
            'Bruno se asustó con fuegos artificiales y salió corriendo cerca del parque principal. Lleva un collar de cuero color azul con su plaquita.',
          fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          ubicacion: 'Parque Virrey, Calle 88 con 15',
          ciudad: 'Bogotá',
          latitud: 4.6735,
          longitud: -74.0561,
          fechaEvento: '2026-09-04',
          contactoTelefono: '+57 300 123 4567',
          contactoEmail: 'familia.bruno@ejemplo.com',
          recompensa: 150000,
          createdAt: '2026-09-04T10:00:00Z',
        });
      } finally {
        setCargando(false);
      }
    };

    cargarReporte();
  }, [id]);

  const cambiarEstadoReunido = async () => {
    if (!reporte) return;
    setActualizandoEstado(true);
    try {
      const nuevoEstado = reporte.tipo === 'ADOPCION' ? 'ADOPTADO' : 'REUNIDO';
      await reportesAPI.cambiarEstado(reporte.id, nuevoEstado);
      setReporte({ ...reporte, estado: nuevoEstado as any });
      mostrarToast('¡Excelente noticia! El estado ha sido actualizado a ' + nuevoEstado, 'exito');
    } catch (err: any) {
      mostrarToast(err.message || 'No se pudo actualizar el estado.', 'error');
    } finally {
      setActualizandoEstado(false);
    }
  };

  if (cargando) {
    return (
      <div className="py-16 max-w-5xl mx-auto px-4">
        <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <span className="text-6xl">😿</span>
        <h2 className="text-xl font-bold text-slate-800">Reporte no encontrado</h2>
        <Link href="/reportes" className="bg-[#5E7BC4] text-white px-5 py-2.5 rounded-xl font-bold text-sm inline-block">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BOTÓN VOLVER */}
        <Link
          href="/reportes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          ← Volver al catálogo de reportes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: FOTO E INFORMACIÓN PRINCIPAL */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={reporte.fotoUrl}
                  alt={reporte.nombreMascota || reporte.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider text-white ${
                      reporte.estado === 'REUNIDO' || reporte.estado === 'ADOPTADO'
                        ? 'bg-blue-600'
                        : reporte.tipo === 'PERDIDO'
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                  >
                    {reporte.estado}
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  {reporte.nombreMascota || reporte.titulo}
                </h1>

                <div className="flex flex-wrap gap-2 text-xs font-semibold mb-4">
                  <span className="bg-[#EEF2FC] text-[#5E7BC4] px-3 py-1 rounded-lg">
                    🐾 Especie: {reporte.especie}
                  </span>
                  {reporte.raza && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                      🐕 Raza: {reporte.raza}
                    </span>
                  )}
                  {reporte.color && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                      🎨 Color: {reporte.color}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Descripción Detallada
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {reporte.descripcion}
                </p>
              </div>

              {/* ACCIÓN CAMBIAR ESTADO */}
              {reporte.estado !== 'REUNIDO' && reporte.estado !== 'ADOPTADO' && (
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                    ¿Esta mascota ya regresó con su dueño?
                  </span>
                  <button
                    onClick={cambiarEstadoReunido}
                    disabled={actualizandoEstado}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎉</span>
                    <span>Marcar como "Reunido con su familia"</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* COLUMNA DERECHA: MAPA Y DATOS DE CONTACTO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD DE CONTACTO DIRECTO */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📞</span>
                <span>Datos de Contacto Directo</span>
              </h3>

              {reporte.recompensa && reporte.recompensa > 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center">
                  <span className="text-xs font-semibold text-amber-700 block">Ofrece Recompensa</span>
                  <span className="text-xl font-black text-amber-900">
                    ${reporte.recompensa.toLocaleString('es-CO')}
                  </span>
                </div>
              ) : null}

              <div className="space-y-3">
                <a
                  href={`tel:${reporte.contactoTelefono}`}
                  className="w-full bg-[#F3B26C] hover:bg-[#e29e54] text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>📞 Llamar al {reporte.contactoTelefono}</span>
                </a>

                {reporte.contactoEmail && (
                  <a
                    href={`mailto:${reporte.contactoEmail}`}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <span>✉️ Enviar correo a {reporte.contactoEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* UBICACIÓN Y MAPA ESTÁTICO */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span>📍</span>
                  <span>Ubicación del Suceso</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {reporte.ubicacion} ({reporte.ciudad || 'Ciudad'})
                </p>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden shadow-inner">
                <MapaReportesDynamic
                  latitud={reporte.latitud}
                  longitud={reporte.longitud}
                  nombreMascota={reporte.nombreMascota}
                  tipo={reporte.tipo}
                  ubicacion={reporte.ubicacion}
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
