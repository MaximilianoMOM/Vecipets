'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

import apiClient, { API_BASE_URL } from '@/lib/api-client';

import {
  convertirReporteEnMarcador,
  leerCoordenadas,
  etiquetaReporteMapa,
  type CategoriaMapa,
  type ReporteMapa,
} from '@/lib/reportes-mapa';

import type { MapItem } from './MapClient';

// ==========================================
// CARGA DINÁMICA DEL MAPA
// ==========================================

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <p role="status" className="p-6 text-sm text-slate-600">
      Cargando mapa…
    </p>
  ),
});

// ==========================================
// CATEGORÍAS Y FILTROS
// ==========================================

const categories = [
  {
    id: 'PERDIDA',
    label: 'Mascotas perdidas',
    color: 'bg-red-600',
  },
  {
    id: 'HALLAZGO',
    label: 'Mascotas encontradas',
    color: 'bg-emerald-600',
  },
  {
    id: 'veterinaria',
    label: 'Veterinarias',
    color: 'bg-sky-600',
  },
  {
    id: 'refugio',
    label: 'Refugios',
    color: 'bg-violet-600',
  },
] as const;

const especies = [
  { id: 'todos', label: 'Todos' },
  { id: 'perro', label: 'Perros' },
  { id: 'gato', label: 'Gatos' },
  { id: 'otro', label: 'Otros' },
] as const;

type Category = (typeof categories)[number]['id'];

type Reporte = ReporteMapa & {
  direccion?: string;
  imagenUrl?: string;
  fechaEvento?: string;
  esTurbo?: boolean;
  turboVenceEn?: string;
};

interface Aliado {
  id: number;
  nombre: string;
  tipo: 'veterinaria' | 'refugio';
  municipio: string;
  direccion: string;
  latitud: number | string;
  longitud: number | string;
  contacto?: string;
  horarios?: string;
  servicios?: string;
}

const all: Category[] = categories.map(({ id }) => id);

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

function obtenerImagen(imagenUrl?: string) {
  if (!imagenUrl) return undefined;

  try {
    const base = new URL(
      API_BASE_URL,
      window.location.origin
    );

    return new URL(imagenUrl, base.origin).href;
  } catch {
    return undefined;
  }
}

function obtenerFiltro(item: MapItem): Category | undefined {
  if (item.filter) return item.filter;

  if (
    item.category === 'veterinaria' ||
    item.category === 'refugio'
  ) {
    return item.category;
  }

  if (item.status === 'PERDIDO') {
    return 'PERDIDA';
  }

  return item.status;
}

function obtenerEtiqueta(item: MapItem) {
  if (item.category === 'veterinaria') {
    return 'Veterinaria';
  }

  if (item.category === 'refugio') {
    return 'Refugio';
  }

  if (!item.status) {
    return 'Mascota';
  }

  const estado =
    item.status === 'PERDIDO'
      ? 'PERDIDA'
      : item.status;

  return etiquetaReporteMapa[estado];
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function MapaPage() {
  const [allies, setAllies] = useState<MapItem[]>([]);
  const [items, setItems] = useState<MapItem[]>([]);

  const [alliesError, setAlliesError] = useState(false);

  const [filters, setFilters] = useState<Category[]>(all);

  const [categoria, setCategoria] = useState<
    CategoriaMapa | 'todos'
  >('todos');

  const [query, setQuery] = useState('');

  const [seleccion, setSeleccion] = useState<string | null>(
    null
  );

  const [status, setStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

  const [consulta, setConsulta] = useState(0);

  // ==========================================
  // ENFOCAR REPORTE DESDE UN ENLACE
  // ==========================================

  useEffect(() => {
    function enfocarDesdeEnlace() {
      const id = /^#reporte-(\d+)$/.exec(
        window.location.hash
      )?.[1];

      if (id) {
        setSeleccion(id);
        setFilters(all);
        setCategoria('todos');
        setQuery('');
      }
    }

    enfocarDesdeEnlace();

    window.addEventListener(
      'hashchange',
      enfocarDesdeEnlace
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        enfocarDesdeEnlace
      );
    };
  }, []);

  // ==========================================
  // CARGAR REPORTES Y ALIADOS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function cargarReportes() {
      try {
        const { data: reports } =
          await apiClient.get<Reporte[]>(
            '/mapa/reportes',
            { signal }
          );

        if (signal.aborted) return;

        const marcadores = reports.flatMap(
          (report): MapItem[] => {
            const marcador =
              convertirReporteEnMarcador(report);

            if (!marcador) return [];

            return [
              {
                ...marcador,

                filter: report.tipo,

                address: report.direccion,

                date: report.fechaEvento,

                photo: obtenerImagen(report.imagenUrl),

                turbo:
                  Boolean(report.esTurbo) &&
                  Date.parse(
                    report.turboVenceEn ?? ''
                  ) > Date.now(),

                href: `/reportes/${report.id}`,
              },
            ];
          }
        );

        setItems(marcadores);
        setStatus('ready');
      } catch {
        if (!signal.aborted) {
          setStatus('error');
        }
      }
    }

    async function cargarAliados() {
      try {
        const { data } = await apiClient.get<Aliado[]>(
          '/mapa/aliados',
          { signal }
        );

        if (signal.aborted) return;

        const marcadores = data.flatMap(
          (item): MapItem[] => {
            const posicion = leerCoordenadas(
              item.latitud,
              item.longitud
            );

            if (!posicion) return [];

            return [
              {
                id: `aliado-${item.id}`,
                name: item.nombre,
                category: item.tipo,
                filter: item.tipo,

                locationName: item.municipio,
                address: item.direccion,
                phone: item.contacto,
                hours: item.horarios,
                services: item.servicios,

                ...posicion,

                href: `/mapa/aliados/${item.id}`,
              },
            ];
          }
        );

        setAllies(marcadores);
        setAlliesError(false);
      } catch {
        if (!signal.aborted) {
          setAlliesError(true);
        }
      }
    }

    void cargarReportes();
    void cargarAliados();

    return () => controller.abort();
  }, [consulta]);

  // ==========================================
  // RECARGAR INFORMACIÓN
  // ==========================================

  function recargar() {
    setStatus('loading');
    setAlliesError(false);
    setConsulta((actual) => actual + 1);
  }

  // ==========================================
  // BÚSQUEDA Y FILTRADO
  // ==========================================

  const matches = [...items, ...allies].filter((item) => {
    const texto = normalize(
      [
        item.name,
        item.locationName,
        item.address,
      ]
        .filter(Boolean)
        .join(' ')
    );

    const coincideBusqueda = texto.includes(
      normalize(query.trim())
    );

    const esAliado =
      item.category === 'veterinaria' ||
      item.category === 'refugio';

    const coincideEspecie =
      esAliado ||
      categoria === 'todos' ||
      item.category === categoria;

    return coincideBusqueda && coincideEspecie;
  });

  const visible = matches.filter((item) => {
    const filtro = obtenerFiltro(item);

    return filtro !== undefined && filters.includes(filtro);
  });

  const selectedItem =
    visible.find((item) => item.id === seleccion) ?? null;

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <main className="bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(280px,1fr)_2fr]">

        {/* PANEL DE FILTROS */}

        <aside
          className="flex min-h-0 flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          aria-labelledby="mapa-titulo"
        >
          <header>
            <h1
              id="mapa-titulo"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Mapa de VeciPets
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Explora mascotas perdidas, encontradas,
              veterinarias y refugios.
            </p>
          </header>

          {/* BUSCADOR */}

          <label className="text-sm font-semibold text-slate-700">
            Buscar en el mapa

            <input
              type="search"
              value={query}
              placeholder="Nombre, dirección, barrio o municipio"
              onChange={(event) =>
                setQuery(event.target.value)
              }
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          {/* FILTRO POR ESPECIE */}

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Filtrar por especie
            </p>

            <div
              className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1"
              aria-label="Filtrar por especie"
            >
              {especies.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={categoria === id}
                  onClick={() => setCategoria(id)}
                  className={`rounded-lg px-1 py-2 text-xs font-bold ${
                    categoria === id
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORÍAS Y LEYENDA */}

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">
              Categorías y leyenda
            </legend>

            <button
              type="button"
              onClick={() => {
                setFilters(all);
                setCategoria('todos');
              }}
              className="text-sm font-semibold text-indigo-700"
            >
              Mostrar todas
            </button>

            {categories.map(({ id, label, color }) => (
              <label
                key={id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={filters.includes(id)}
                  onChange={(event) =>
                    setFilters((current) =>
                      event.target.checked
                        ? Array.from(
                            new Set([...current, id])
                          )
                        : current.filter(
                            (filter) => filter !== id
                          )
                    )
                  }
                />

                <span
                  className={`h-3 w-3 rounded-full ${color}`}
                  aria-hidden="true"
                />

                {label}

                {status === 'ready' && (
                  <span className="text-slate-500">
                    (
                    {
                      matches.filter(
                        (item) => obtenerFiltro(item) === id
                      ).length
                    }
                    )
                  </span>
                )}
              </label>
            ))}
          </fieldset>

          {/* ESTADOS DE CARGA */}

          {status === 'loading' && (
            <p
              role="status"
              className="text-sm text-slate-600"
            >
              Cargando reportes…
            </p>
          )}

          {status === 'error' && (
            <div
              role="alert"
              className="space-y-2 text-sm text-rose-700"
            >
              <p>
                No se pudieron cargar los reportes del mapa.
              </p>

              <button
                type="button"
                onClick={recargar}
                className="font-bold underline"
              >
                Volver a intentar
              </button>
            </div>
          )}

          {alliesError && (
            <div
              role="alert"
              className="space-y-2 text-sm text-slate-600"
            >
              <p>
                El directorio de aliados no está disponible.
              </p>

              <button
                type="button"
                onClick={recargar}
                className="font-bold text-indigo-700 underline"
              >
                Volver a intentar
              </button>
            </div>
          )}

          {status === 'ready' && (
            <p
              role="status"
              className="text-sm text-slate-600"
            >
              {visible.length} resultados con ubicación
            </p>
          )}

          {/* LISTADO DE RESULTADOS */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {status === 'ready' && visible.length === 0 && (
              <p className="text-sm text-slate-600">
                {items.length === 0 && allies.length === 0
                  ? 'Aún no hay resultados con ubicación registrada.'
                  : 'No hay resultados que coincidan con los filtros.'}
              </p>
            )}

            <ul className="max-h-52 space-y-2 overflow-y-auto lg:max-h-80">
              {visible.map((item) => {
                const esAliado =
                  item.category === 'veterinaria' ||
                  item.category === 'refugio';

                const enlace =
                  item.href ||
                  (!esAliado
                    ? `/reportes/${item.id}`
                    : undefined);

                return (
                  <li
                    key={`${item.category}-${item.id}`}
                    className={`rounded-2xl border p-3 ${
                      seleccion === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={seleccion === item.id}
                      onClick={() => setSeleccion(item.id)}
                      className="flex w-full items-start gap-2 rounded-lg text-left focus-visible:outline-indigo-600"
                    >
                      <MapPin
                        className="mt-1 h-4 w-4 shrink-0 text-indigo-600"
                        aria-hidden="true"
                      />

                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-indigo-700">
                          {obtenerEtiqueta(item)}
                        </span>

                        <span className="block break-words text-sm font-bold text-slate-900">
                          {item.name}
                        </span>

                        <span className="block text-xs text-slate-600">
                          {item.locationName}
                        </span>

                        {item.turbo && (
                          <span className="mt-1 block text-xs font-bold text-amber-700">
                            ⚡ Alerta Turbo
                          </span>
                        )}
                      </span>
                    </button>

                    {seleccion === item.id && enlace && (
                      <Link
                        href={enlace}
                        className="mt-2 inline-block text-xs font-bold text-indigo-700 hover:underline"
                      >
                        {esAliado
                          ? 'Ver más'
                          : 'Ver reporte'}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ENLACE A REPORTES */}

          <Link
            href="/reportes"
            className="text-sm font-bold text-indigo-700 hover:underline"
          >
            Ir al listado de reportes
          </Link>
        </aside>

        {/* MAPA INTERACTIVO */}

        <section
          aria-label="Mapa de resultados"
          className="h-[55vh] min-h-80 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm lg:h-[70vh]"
        >
          <MapClient
            items={visible}
            selectedItem={selectedItem}
          />
        </section>
      </div>
    </main>
  );
}