'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { etiquetaReporteMapa, type CategoriaMapa, type TipoReporteMapa } from '@/lib/reportes-mapa';
import { useReportesMapa } from '@/lib/use-reportes-mapa';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <p role="status" className="p-6 text-sm text-slate-600">Cargando mapa…</p>,
});

const categorias = [
  { id: 'todos', label: 'Todos' },
  { id: 'perro', label: 'Perros' },
  { id: 'gato', label: 'Gatos' },
  { id: 'otro', label: 'Otros' },
] as const;

export default function MapaPage() {
  const { items, estado, recargar } = useReportesMapa();
  const [categoria, setCategoria] = useState<CategoriaMapa | 'todos'>('todos');
  const [tipo, setTipo] = useState<TipoReporteMapa | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seleccion, setSeleccion] = useState<string | null>(null);

  useEffect(() => {
    function enfocarDesdeEnlace() {
      const id = /^#reporte-(\d+)$/.exec(window.location.hash)?.[1];
      if (id) setSeleccion(id);
    }
    enfocarDesdeEnlace();
    window.addEventListener('hashchange', enfocarDesdeEnlace);
    return () => window.removeEventListener('hashchange', enfocarDesdeEnlace);
  }, []);

  const consulta = busqueda.trim().toLowerCase();
  const visibles = items.filter((item) =>
    (categoria === 'todos' || item.category === categoria) &&
    (tipo === 'todos' || item.status === tipo) &&
    [item.name, item.locationName].some((texto) => texto.toLowerCase().includes(consulta)),
  );

  return (
    <main className="bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(17rem,1fr)_2fr]">
        <section className="flex max-h-[38rem] min-h-0 flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="mapa-titulo">
          <header>
            <h1 id="mapa-titulo" className="text-2xl font-black tracking-tight text-slate-900">Mapa de reportes</h1>
            <p className="mt-1 text-sm text-slate-600">Explora mascotas perdidas y hallazgos con ubicación registrada.</p>
          </header>

          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1" aria-label="Filtrar por especie">
            {categorias.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={categoria === id} onClick={() => setCategoria(id)}
                className={`rounded-lg px-1 py-2 text-xs font-bold ${categoria === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>
                {label}
              </button>
            ))}
          </div>

          <label className="text-sm font-semibold text-slate-700">Tipo de reporte
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoReporteMapa | 'todos')}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <option value="todos">Perdidos y hallazgos</option>
              <option value="PERDIDA">Mascotas perdidas</option>
              <option value="HALLAZGO">Hallazgos</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">Buscar en el mapa
            <input type="search" value={busqueda} placeholder="Nombre, barrio o municipio"
              onChange={(e) => setBusqueda(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {estado === 'cargando' ? <p role="status" className="text-sm text-slate-600">Cargando reportes…</p> :
              estado === 'error' ? (
                <div role="alert" className="space-y-2 text-sm text-rose-700">
                  <p>No se pudieron cargar los reportes del mapa.</p>
                  <button type="button" onClick={recargar} className="font-bold underline">Volver a intentar</button>
                </div>
              ) : visibles.length === 0 ? (
                <p className="text-sm text-slate-600">{items.length === 0 ? 'Aún no hay reportes públicos con ubicación.' : 'No hay reportes que coincidan con los filtros.'}</p>
              ) : (
                <ul className="space-y-2">
                  {visibles.map((item) => (
                    <li key={item.id} className={`rounded-2xl border p-3 ${seleccion === item.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                      <button type="button" aria-pressed={seleccion === item.id} onClick={() => setSeleccion(item.id)}
                        className="flex w-full items-start gap-2 rounded-lg text-left focus-visible:outline-indigo-600">
                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-indigo-700">{etiquetaReporteMapa[item.status]}</span>
                          <span className="block break-words text-sm font-bold text-slate-900">{item.name}</span>
                          <span className="block text-xs text-slate-600">{item.locationName}</span>
                        </span>
                      </button>
                      {seleccion === item.id && (
                        <Link href={`/reportes/${item.id}`} className="mt-2 inline-block text-xs font-bold text-indigo-700 hover:underline">Ver reporte</Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
          </div>

          <Link href="/reportes" className="text-sm font-bold text-indigo-700 hover:underline">Ir al listado de reportes</Link>
        </section>

        <div className="h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm lg:h-[38rem]">
          <MapClient items={visibles} selectedItem={visibles.find((item) => item.id === seleccion) ?? null} />
        </div>
      </div>
    </main>
  );
}
