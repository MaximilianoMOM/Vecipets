'use client';

import React, { useEffect, useState } from 'react';
import ReporteCard from '@/components/reportes/ReporteCard';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros reactivos
  const [filtroEspecie, setFiltroEspecie] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarReportes = async () => {
      setCargando(true);
      try {
        const params: Record<string, string> = {};
        if (filtroEspecie !== 'TODOS') params.especie = filtroEspecie;
        if (filtroTipo !== 'TODOS') params.tipo = filtroTipo;
        if (busqueda) params.q = busqueda;

        const datos = await reportesAPI.getReportes(params);
        setReportes(datos);
      } catch (err) {
        // Datos mock de respaldo si el backend no está conectado
        const mock: Reporte[] = [
          {
            id: '1',
            titulo: 'Perro Beagle extraviado',
            nombreMascota: 'Bruno',
            especie: 'PERRO',
            tipo: 'PERDIDO',
            estado: 'PERDIDO',
            descripcion: 'Se extravió cerca al Parque Virrey. Responde al nombre de Bruno.',
            fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Calle 88 con 15',
            ciudad: 'Bogotá',
            latitud: 4.6735,
            longitud: -74.0561,
            fechaEvento: '2026-09-04',
            contactoTelefono: '3001234567',
            recompensa: 100000,
            createdAt: '2026-09-04T10:00:00Z',
          },
          {
            id: '2',
            titulo: 'Gata mestiza encontrada en garaje',
            nombreMascota: 'Luna',
            especie: 'GATO',
            tipo: 'ENCONTRADO',
            estado: 'ENCONTRADO',
            descripcion: 'Apareció en un parqueadero cubierto. Es blanca con manchas grises.',
            fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Barrio Palermo',
            ciudad: 'Bogotá',
            latitud: 4.6300,
            longitud: -74.0700,
            fechaEvento: '2026-09-05',
            contactoTelefono: '3119876543',
            createdAt: '2026-09-05T08:00:00Z',
          },
          {
            id: '3',
            titulo: 'Perrita en adopción responsable',
            nombreMascota: 'Kira',
            especie: 'PERRO',
            tipo: 'ADOPCION',
            estado: 'EN_ADOPCION',
            descripcion: 'Cachorra mestiza desparasitada. Muy juguetona y amorosa.',
            fotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Refugio Los Pinos',
            ciudad: 'Medellín',
            latitud: 6.2442,
            longitud: -75.5812,
            fechaEvento: '2026-09-01',
            contactoTelefono: '3205551234',
            createdAt: '2026-09-01T12:00:00Z',
          },
          {
            id: '4',
            titulo: 'Conejo doméstico encontrado',
            nombreMascota: 'Copito',
            especie: 'OTRO',
            tipo: 'ENCONTRADO',
            estado: 'ENCONTRADO',
            descripcion: 'Conejo blanco encontrado en jardín público.',
            fotoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
            ubicacion: 'Zona Sur',
            ciudad: 'Cali',
            latitud: 3.4516,
            longitud: -76.532,
            fechaEvento: '2026-09-02',
            contactoTelefono: '3158889999',
            createdAt: '2026-09-02T15:00:00Z',
          },
        ];

        // Filtrar localmente si fue error de backend
        let resultado = mock;
        if (filtroEspecie !== 'TODOS') resultado = resultado.filter((r) => r.especie === filtroEspecie);
        if (filtroTipo !== 'TODOS') resultado = resultado.filter((r) => r.tipo === filtroTipo);
        if (busqueda) {
          const q = busqueda.toLowerCase();
          resultado = resultado.filter(
            (r) =>
              r.titulo.toLowerCase().includes(q) ||
              (r.nombreMascota && r.nombreMascota.toLowerCase().includes(q)) ||
              r.descripcion.toLowerCase().includes(q) ||
              r.ubicacion.toLowerCase().includes(q)
          );
        }

        setReportes(resultado);
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, [filtroEspecie, filtroTipo, busqueda]);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-widest bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-xs">
            Catálogo Comunitario
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mascotas Reportadas
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Filtra por especie, estado o busca por palabras clave para encontrar publicaciones activas.
          </p>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* BUSCADOR */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, raza, barrio o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all placeholder-slate-400"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>

            {/* FILTRO ESPECIE */}
            <div className="md:col-span-3">
              <select
                value={filtroEspecie}
                onChange={(e) => setFiltroEspecie(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5E7BC4]"
              >
                <option value="TODOS">🐾 Todas las Especies</option>
                <option value="PERRO">🐶 Perros</option>
                <option value="GATO">🐱 Gatos</option>
                <option value="OTRO">🐾 Otros animales</option>
              </select>
            </div>

            {/* FILTRO TIPO DE REPORTE */}
            <div className="md:col-span-3">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5E7BC4]"
              >
                <option value="TODOS">📋 Todos los Tipos</option>
                <option value="PERDIDO">🚨 Perdidos</option>
                <option value="ENCONTRADO">🔍 Encontrados</option>
                <option value="ADOPCION">🏠 En Adopción</option>
              </select>
            </div>

          </div>

          {/* BOTONES RÁPIDOS DE FILTRADO */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
            <span className="text-slate-400">Atajos rápidos:</span>
            {['TODOS', 'PERDIDO', 'ENCONTRADO', 'ADOPCION'].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filtroTipo === t
                    ? 'bg-[#5E7BC4] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'TODOS' ? 'Todos' : t}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE RESULTADOS */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : reportes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 max-w-md mx-auto my-12 space-y-4">
            <span className="text-5xl block">🔎</span>
            <h3 className="text-lg font-bold text-slate-800">
              No se encontraron reportes con estos filtros
            </h3>
            <p className="text-xs text-slate-500">
              Intenta cambiar los términos de búsqueda o seleccionar otras categorías.
            </p>
            <button
              onClick={() => {
                setFiltroEspecie('TODOS');
                setFiltroTipo('TODOS');
                setBusqueda('');
              }}
              className="bg-[#5E7BC4] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportes.map((rep) => (
              <ReporteCard key={rep.id} reporte={rep} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
