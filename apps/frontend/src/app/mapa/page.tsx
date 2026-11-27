'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import apiClient, { API_BASE_URL } from '@/lib/api-client';
import type { MapItem } from './MapClient';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <p className="p-5">Cargando mapa…</p>,
});

const categories = [
  { id: 'PERDIDA', label: 'Mascotas perdidas', color: 'bg-red-600' },
  { id: 'HALLAZGO', label: 'Mascotas encontradas', color: 'bg-emerald-600' },
  { id: 'veterinaria', label: 'Veterinarias', color: 'bg-sky-600' },
  { id: 'refugio', label: 'Refugios', color: 'bg-violet-600' },
] as const;

type Category = typeof categories[number]['id'];
type Reporte = {
  id: number;
  nombre: string;
  especie: string;
  tipo: 'PERDIDA' | 'HALLAZGO';
  latitud: string | null;
  longitud: string | null;
  barrioSector: string;
  ciudad?: string;
  direccion?: string;
  imagenUrl?: string;
  fechaEvento: string;
  esTurbo: boolean;
  turboVenceEn?: string;
};

const all = categories.map(({ id }) => id);
const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function MapaPage() {
  const [allies, setAllies] = useState<MapItem[]>([]);
  const [alliesError, setAlliesError] = useState(false);
  const [items, setItems] = useState<MapItem[]>([]);
  const [filters, setFilters] = useState<Category[]>(all);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const { data: reports } = await apiClient.get<Reporte[]>('/mapa/reportes', { signal: controller.signal });
      if (controller.signal.aborted) return;
      const origin = API_BASE_URL.replace(/\/api\/v1$/, '');
      setItems(reports.flatMap((report) => {
        const lat = Number(report.latitud);
        const lng = Number(report.longitud);
        if (!report.latitud?.toString().trim() || !report.longitud?.toString().trim() ||
          !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) return [];
        return [{
          id: String(report.id),
          name: report.nombre,
          category: report.especie.toLowerCase() === 'gato' ? 'gato' : 'perro',
          status: report.tipo === 'PERDIDA' ? 'PERDIDO' : 'HALLAZGO',
          filter: report.tipo,
          locationName: [report.barrioSector, report.ciudad].filter(Boolean).join(', '),
          address: report.direccion,
          lat,
          lng,
          date: report.fechaEvento,
          photo: report.imagenUrl ? new URL(report.imagenUrl, origin).href : undefined,
          turbo: report.esTurbo && Date.parse(report.turboVenceEn ?? '') > Date.now(),
          href: '/reportes/' + report.id,
        }];
      }));
      setStatus('ready');
    }
    void apiClient.get<Array<{
      id: number; nombre: string; tipo: 'veterinaria' | 'refugio'; municipio: string;
      direccion: string; latitud: number; longitud: number; contacto?: string; horarios?: string; servicios?: string;
    }>>('/mapa/aliados', { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setAllies(data.map((item) => ({
        id: 'aliado-' + item.id, name: item.nombre, category: item.tipo, filter: item.tipo,
        locationName: item.municipio, address: item.direccion, phone: item.contacto, hours: item.horarios,
        services: item.servicios, lat: item.latitud, lng: item.longitud, href: '/mapa/aliados/' + item.id,
      })));
    }).catch(() => { if (!controller.signal.aborted) setAlliesError(true); });
    void load().catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, []);

  const matches = [...items, ...allies].filter((item) => normalize([item.name, item.locationName, item.address].join(' ')).includes(normalize(query.trim())));
  const visible = matches.filter((item) => filters.includes(item.filter));
  const selectedItem = visible.find((item) => item.id === selected?.id) ?? null;

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[minmax(280px,1fr)_2fr] lg:p-6">
      <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Mapa de VeciPets</h1>
        <label className="block text-sm font-medium">
          Buscar por dirección, barrio, municipio o sector
          <input value={query} onChange={(event) => setQuery(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 p-2" type="search" />
        </label>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Categorías y leyenda</legend>
          <button type="button" onClick={() => setFilters(all)} className="text-sm font-semibold text-indigo-700">Mostrar todas</button>
          {categories.map(({ id, label, color }) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.includes(id)}
                onChange={(event) => setFilters((current) => event.target.checked ? [...current, id] : current.filter((filter) => filter !== id))} />
              <span className={'h-3 w-3 rounded-full ' + color} aria-hidden="true" />
              {label}{status === 'ready' && ' (' + matches.filter((item) => item.filter === id).length + ')'}
            </label>
          ))}
        </fieldset>
        <p role="status" className="text-sm text-slate-600">
          {status === 'loading' ? 'Cargando reportes…' : status === 'error' ? 'No se pudieron cargar los reportes.' : visible.length + ' resultados con ubicación'}
        </p>
        {alliesError && <p role="status" className="text-sm text-slate-600">El directorio de aliados no está disponible.</p>}
        <ul className="max-h-52 space-y-2 overflow-y-auto lg:max-h-80">
          {visible.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelected(item)} className="w-full rounded-xl border border-slate-200 p-3 text-left">
                <strong className="block text-sm">{item.name}</strong>
                <span className="text-xs text-slate-600">{item.locationName}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section aria-label="Mapa de resultados" className="h-[55vh] min-h-80 rounded-3xl border border-slate-200 lg:h-[70vh]">
        <MapClient items={visible} selectedItem={selectedItem} />
      </section>
    </main>
  );
}
