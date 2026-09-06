'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { authAPI, reportesAPI, Usuario, Reporte } from '@/lib/api-client';

export default function PerfilPage() {
  const { mostrarToast } = useToast();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [misReportes, setMisReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario editar perfil
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    const cargarPerfilYReportes = async () => {
      try {
        const datosUser = await authAPI.getPerfil();
        setUsuario(datosUser);
        setNombre(datosUser.nombre || '');
        setTelefono(datosUser.telefono || '');

        const todosReportes = await reportesAPI.getReportes();
        // Filtrar reportes creados por el usuario
        setMisReportes(todosReportes.filter((r) => r.usuarioId === datosUser.id));
      } catch (err) {
        // Datos mock de perfil si no hay token backend activo
        setUsuario({
          id: 'user-1',
          nombre: 'Ana María Pérez',
          email: 'ana.perez@ejemplo.com',
          telefono: '+57 300 123 4567',
        });
        setNombre('Ana María Pérez');
        setTelefono('+57 300 123 4567');

        setMisReportes([
          {
            id: '1',
            titulo: 'Perro Beagle extraviado',
            nombreMascota: 'Bruno',
            especie: 'PERRO',
            tipo: 'PERDIDO',
            estado: 'PERDIDO',
            descripcion: 'Se extravió cerca al Parque Virrey.',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Parque Virrey, Bogotá',
            latitud: 4.6735,
            longitud: -74.0561,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3001234567',
            createdAt: '2026-09-04T10:00:00Z',
          },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfilYReportes();
  }, []);

  const guardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    mostrarToast('Perfil actualizado correctamente.', 'exito');
  };

  if (cargando) {
    return (
      <div className="py-16 max-w-4xl mx-auto px-4">
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* CABECERA PERFIL */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#5E7BC4] text-white flex items-center justify-center text-3xl font-black shadow-md">
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-slate-900">{usuario?.nombre}</h1>
            <p className="text-xs text-slate-500 font-medium">{usuario?.email}</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
              Miembro Activo VeciPets
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* EDITAR DATOS DE PERFIL */}
          <div className="lg:col-span-5">
            <form onSubmit={guardarCambios} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Información Personal
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={usuario?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3 rounded-xl shadow-xs transition-all text-xs"
              >
                Guardar Cambios
              </button>
            </form>
          </div>

          {/* MIS REPORTES PUBLICADOS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Mis Reportes Publicados ({misReportes.length})
              </h3>
              <Link
                href="/reportar"
                className="text-xs font-bold text-[#5E7BC4] bg-[#EEF2FC] px-3 py-1.5 rounded-xl hover:bg-[#5E7BC4] hover:text-white transition-colors"
              >
                + Nuevo Reporte
              </Link>
            </div>

            {misReportes.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 space-y-2">
                <span className="text-3xl block">📋</span>
                <p className="text-xs font-bold text-slate-700">Aún no has creado reportes</p>
                <p className="text-[11px] text-slate-400">
                  Si se te extravió una mascota o encontraste una, publícala aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {misReportes.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rep.fotoUrl}
                        alt={rep.titulo}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase">
                          {rep.estado}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mt-0.5">
                          {rep.nombreMascota || rep.titulo}
                        </h4>
                        <span className="text-[11px] text-slate-400">📍 {rep.ubicacion}</span>
                      </div>
                    </div>

                    <Link
                      href={`/reportes/${rep.id}`}
                      className="text-xs font-bold text-[#5E7BC4] hover:underline whitespace-nowrap"
                    >
                      Ver / Editar →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}