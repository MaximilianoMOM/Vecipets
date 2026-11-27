'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient, { API_BASE_URL } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { locate, reverseAddress, searchAddress, validCoordinates, type Coordinates } from '@/lib/geocoding';

const Map = dynamic(() => import('../[id]/MapaDetalleReporte'), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-slate-500">Cargando mapa…</p>,
});
type Sighting = {
  id: number;
  autor: string;
  barrioSector: string;
  comentario: string;
  fechaAvistamiento: string;
  latitud: number;
  longitud: number;
  tieneImagen: boolean;
};

const field = 'w-full rounded-xl border border-slate-300 p-2 text-sm';
const button = 'rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60';

export default function Avistamientos({ id, original, originalLabel, sectorOriginal, direccionOriginal, activo }: {
  id: number | null;
  originalLabel: string;
  sectorOriginal?: string;
  direccionOriginal?: string;
  original?: Coordinates;
  activo: boolean;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<Sighting[]>([]);
  const [focused, setFocused] = useState<Sighting | null>(null);
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [point, setPoint] = useState<Coordinates>();
  const [confirmed, setConfirmed] = useState(false);
  const [finding, setFinding] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [listStatus, setListStatus] = useState('Cargando avistamientos…');
  const request = useRef<AbortController | null>(null);
  const mapPanel = useRef<HTMLDivElement>(null);
  const endpoint = '/reportes/' + id + '/avistamientos';

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data } = await apiClient.get<Sighting[]>(endpoint, { signal });
      if (!signal?.aborted) {
        setItems(data);
        setFocused((current) => current ? data.find((item) => item.id === current.id) ?? null : null);
        setListStatus(data.length ? '' : 'Aún no hay avistamientos publicados.');
      }
    } catch {
      if (!signal?.aborted) setListStatus('No se pudieron consultar los avistamientos.');
    }
  }, [endpoint]);

  useEffect(() => {
    if (!activo) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, [activo, load]);

  function invalidate() {
    request.current?.abort();
    setConfirmed(false);
    setFinding(false);
    setMessage('');
  }

  async function resolve(operation: (signal: AbortSignal) => Promise<void>) {
    invalidate();
    const controller = new AbortController();
    request.current = controller;
    setFinding(true);
    try {
      await operation(controller.signal);
      if (!controller.signal.aborted) setConfirmed(true);
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'No se pudo confirmar la ubicación.');
    } finally {
      if (!controller.signal.aborted) setFinding(false);
    }
  }

  async function reverse(coords: Coordinates, signal: AbortSignal) {
    if (signal.aborted) return;
    setFocused(null);
    setPoint(coords);
    const result = await reverseAddress(coords, signal);
    if (signal.aborted) return;
    setAddress(result.address);
    setSector(result.sector);
  }

  function search() {
    void resolve(async (signal) => {
      if (address.trim().length < 3) throw new Error('Escribe una dirección para buscar.');
      const result = await searchAddress([address, sector].filter(Boolean).join(', '), signal);
      if (!signal.aborted) {
        setFocused(null);
        setPoint({ lat: result.lat, lng: result.lng });
        setAddress(result.address);
      }
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !confirmed || !point || !validCoordinates(point)) {
      setMessage('Confirma la ubicación antes de enviar.');
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const date = new Date(String(data.get('fechaAvistamiento')));
    if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now()) {
      setMessage('Escoge una fecha y hora válidas en el pasado.');
      return;
    }
    data.set('fechaAvistamiento', date.toISOString());
    data.set('latitud', String(point.lat));
    data.set('longitud', String(point.lng));
    const image = data.get('imagen');
    if (image instanceof File && image.size > 5 * 1024 * 1024) {
      setMessage('La fotografía debe pesar como máximo 5 MB.');
      return;
    }
    if (image instanceof File && !image.size) data.delete('imagen');
    setSending(true);
    setMessage('');
    try {
      await apiClient.post(endpoint, data);
      form.reset();
      setAddress('');
      setSector('');
      setPoint(undefined);
      setConfirmed(false);
      setMessage('Avistamiento enviado. Gracias por compartir la pista.');
      await load();
    } catch (error) {
      const response = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
      setMessage(typeof response === 'string' ? response : 'No se pudo enviar el avistamiento.');
    } finally {
      setSending(false);
    }
  }

  const canSelect = activo && user?.rol === 'CIUDADANO';
  const showMap = original || items.length > 0 || canSelect;

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
            {activo ? 'Ubicación y avistamientos' : 'Ubicación registrada del suceso'}
          </h2>
          <p className="mt-1 break-words text-sm text-slate-600">
            {[sectorOriginal, direccionOriginal].filter(Boolean).join(' · ')}
          </p>
        </div>
        {showMap ? (
          <>
            <div id="mapa-reporte" ref={mapPanel} className="isolate h-72 scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 sm:h-[360px]">
              <Map
                original={original}
                originalLabel={originalLabel}
                items={items}
                focused={focused ? { lat: focused.latitud, lng: focused.longitud } : undefined}
                point={point}
                onSelect={canSelect ? (coords) => { void resolve((signal) => reverse(coords, signal)); } : undefined}
              />
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-700">
              {original && <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600" />Ubicación original</li>}
              {items.length > 0 && <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-600" />Avistamientos aproximados</li>}
              {canSelect && <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Punto del formulario</li>}
            </ul>
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Coordenadas no registradas
          </p>
        )}
      </section>
      {activo && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section className="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">¿Viste esta mascota?</h2>
              <p className="text-sm text-slate-600">Ayúdanos a encontrarla. Cuéntanos dónde y cuándo la viste.</p>
            </div>
            {!user ? <Link href="/login" className="font-semibold text-emerald-800 underline">Inicia sesión para enviar un avistamiento</Link>
              : user.rol !== 'CIUDADANO' ? <p className="text-sm">Los ciudadanos pueden registrar avistamientos.</p> : (
              <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">Dirección
                    <input className={field} name="direccion" value={address} required minLength={3} maxLength={200}
                      onChange={(event) => { invalidate(); setAddress(event.target.value); }}
                      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); search(); } }} />
                  </label>
                  <label className="text-sm">Barrio o sector
                    <input className={field} name="barrioSector" value={sector} required minLength={2} maxLength={150}
                      onChange={(event) => { invalidate(); setSector(event.target.value); }} />
                  </label>
                  <label className="text-sm">Fecha y hora
                    <input className={field} name="fechaAvistamiento" type="datetime-local" required />
                  </label>
                  <label className="text-sm">Fotografía opcional
                    <input className={field} name="imagen" type="file" accept="image/jpeg,image/png,image/webp" />
                  </label>
                </div>
                <label className="block text-sm">Comentario
                  <textarea className={field} name="comentario" required minLength={5} maxLength={1000}
                    placeholder="Describe lo que viste sin incluir datos personales." />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button} disabled={finding} onClick={search}>Buscar en mapa</button>
                  <button type="button" className={button} disabled={finding}
                    onClick={() => resolve(async (signal) => reverse(await locate(), signal))}>Mi ubicación</button>
                </div>
                <a href="#mapa-reporte" className="inline-block text-sm font-semibold text-emerald-800 underline">
                  Seleccionar un punto en el mapa
                </a>
                <p className="text-xs text-slate-600">{finding ? 'Consultando ubicación…' : confirmed ? 'Ubicación confirmada' : 'Busca la dirección o selecciona un punto.'}</p>
                <button className={button} disabled={sending || finding || !confirmed} type="submit">{sending ? 'Enviando…' : 'Enviar avistamiento'}</button>
                <p role="status" className="text-sm">{message}</p>
              </form>
            )}
          </section>
          <section className="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Avistamientos de la comunidad</h2>
            {listStatus && <p role="status" className="text-sm">{listStatus}</p>}
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <strong className="break-words text-slate-900">{item.autor}</strong>
                  <p className="break-words text-xs text-slate-600">{new Date(item.fechaAvistamiento).toLocaleString('es-CO', { timeZone: 'America/Bogota' })} · {item.barrioSector}</p>
                  <p className="whitespace-pre-wrap break-words">{item.comentario}</p>
                  {item.tieneImagen && <img src={API_BASE_URL + endpoint + '/' + item.id + '/imagen'}
                    alt="Fotografía del avistamiento" loading="lazy" className="max-h-48 rounded-xl object-contain" />}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <button type="button" className="font-semibold text-emerald-800 underline" onClick={() => {
                      setFocused(item);
                      mapPanel.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }}>Ver ubicación</button>
                    {user?.rol === 'ADMINISTRADOR' && <button type="button" className="text-red-700 underline" onClick={async () => {
                      try {
                        await apiClient.patch(endpoint + '/' + item.id + '/moderacion', { visible: false });
                        await load();
                      } catch {
                        setListStatus('No se pudo ocultar el avistamiento.');
                      }
                    }}>Ocultar avistamiento</button>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
