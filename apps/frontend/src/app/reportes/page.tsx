
'use client';

import React, { useEffect, useState } from 'react';
import ReporteCard from '@/components/reportes/ReporteCard';
import { reportesAPI, Reporte } from '@/lib/api-client';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // =====================================================
  // FILTROS
  // =====================================================

  const [filtroEspecie, setFiltroEspecie] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // =====================================================
  // CARGAR REPORTES DESDE EL BACKEND
  // =====================================================

  useEffect(() => {
    const cargarReportes = async () => {
      setCargando(true);
      setError('');

      try {
        const params: Record<string, string> = {};

        if (filtroEspecie !== 'TODOS') {
          params.especie = filtroEspecie;
        }

        if (filtroTipo !== 'TODOS') {
          params.tipo = filtroTipo;
        }

        if (busqueda.trim()) {
          params.q = busqueda.trim();
        }

        const datos = await reportesAPI.getReportes(params);

        // Solo mostramos datos reales del backend
        setReportes(Array.isArray(datos) ? datos : []);
      } catch (err) {
        console.error('Error al cargar reportes:', err);

        setReportes(
          [],
        );

        setError(
          'No fue posible cargar los reportes. Verifica que el servidor esté funcionando.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, [filtroEspecie, filtroTipo, busqueda]);

  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  const limpiarFiltros = () => {
    setFiltroEspecie('TODOS');
    setFiltroTipo('TODOS');
    setBusqueda('');
    setError('');
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">

          <span className="text-xs font-bold text-[#5E7BC4] uppercase tracking-widest bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-xs">
            Catálogo Comunitario
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mascotas Reportadas
          </h1>

          <p className="text-sm text-slate-500 font-medium">
            Consulta los reportes de mascotas perdidas y encontradas
            registrados en VeciPets.
          </p>

        </div>

        {/* =================================================
            BARRA DE FILTROS
        ================================================= */}

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 mb-10 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* BUSCADOR */}

            <div className="md:col-span-6 relative">

              <input
                type="text"
                placeholder="🔍 Buscar por nombre, raza, barrio o descripción..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all placeholder-slate-400"
              />

              {busqueda && (
                <button
                  type="button"
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
                onChange={(e) =>
                  setFiltroEspecie(e.target.value)
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5E7BC4]"
              >
                <option value="TODOS">
                  🐾 Todas las Especies
                </option>

                <option value="PERRO">
                  🐶 Perros
                </option>

                <option value="GATO">
                  🐱 Gatos
                </option>

                <option value="OTRO">
                  🐾 Otros animales
                </option>
              </select>

            </div>

            {/* FILTRO TIPO */}

            <div className="md:col-span-3">

              <select
                value={filtroTipo}
                onChange={(e) =>
                  setFiltroTipo(e.target.value)
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5E7BC4]"
              >

                <option value="TODOS">
                  📋 Todos los tipos
                </option>

                <option value="PERDIDA">
                  🚨 Mascotas perdidas
                </option>

                <option value="HALLAZGO">
                  🔍 Mascotas encontradas
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              ATAJOS
          ================================================= */}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">

            <span className="text-slate-400">
              Atajos rápidos:
            </span>

            {[
              {
                valor: 'TODOS',
                texto: 'Todos',
              },
              {
                valor: 'PERDIDA',
                texto: 'Perdidas',
              },
              {
                valor: 'HALLAZGO',
                texto: 'Encontradas',
              },
            ].map((tipo) => (

              <button
                key={tipo.valor}
                type="button"
                onClick={() =>
                  setFiltroTipo(tipo.valor)
                }
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filtroTipo === tipo.valor
                    ? 'bg-[#5E7BC4] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tipo.texto}
              </button>

            ))}

          </div>

        </div>

        {/* =================================================
            ERROR DEL BACKEND
        ================================================= */}

        {error && !cargando && (

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-8 text-sm font-medium text-center">

            ⚠️ {error}

            <button
              type="button"
              onClick={limpiarFiltros}
              className="block mx-auto mt-3 text-xs font-bold underline hover:no-underline"
            >
              Limpiar filtros
            </button>

          </div>

        )}

        {/* =================================================
            CARGANDO
        ================================================= */}

        {cargando ? (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {[1, 2, 3, 4, 5, 6].map((i) => (

              <div
                key={i}
                className="h-96 bg-slate-100 animate-pulse rounded-3xl"
              />

            ))}

          </div>

        ) : reportes.length === 0 && !error ? (

          /* =================================================
             SIN REPORTES
          ================================================= */

          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 max-w-md mx-auto my-12 space-y-4">

            <span className="text-5xl block">
              🔎
            </span>

            <h3 className="text-lg font-bold text-slate-800">
              No se encontraron reportes
            </h3>

            <p className="text-xs text-slate-500">
              No hay reportes que coincidan con los filtros
              seleccionados.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="bg-[#5E7BC4] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all hover:opacity-90"
            >
              Restablecer filtros
            </button>

          </div>

        ) : (

          /* =================================================
             LISTADO REAL
          ================================================= */

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {reportes.map((rep) => (

              <ReporteCard
                key={rep.id}
                reporte={rep}
              />

            ))}

          </div>

        )}

      </div>
    </div>
  );
}

