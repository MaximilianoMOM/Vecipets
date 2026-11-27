export type Coordinates = { lat: number; lng: number };
type Address = { lat: string; lon: string; display_name: string; address?: Record<string, string> };

export function validCoordinates({ lat, lng }: Coordinates) {
  return Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180;
}

const nominatimCache = new Map<string, unknown>();
let nextNominatimRequest = 0;

async function request<T>(path: string, params: Record<string, string>, signal: AbortSignal): Promise<T> {
  const base = process.env.NEXT_PUBLIC_GEOCODER_URL;
  if (!base) throw new Error('El servicio de direcciones todavía no está configurado.');
  const url = new URL(base.replace(/\/+$/, '') + '/' + path);
  url.search = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', ...params }).toString();
  const isPublicNominatim = url.hostname === 'nominatim.openstreetmap.org';
  if (isPublicNominatim) {
    const cached = nominatimCache.get(url.href);
    if (cached !== undefined) return cached as T;
    const start = Math.max(Date.now(), nextNominatimRequest);
    nextNominatimRequest = start + 1100;
    if (start > Date.now()) await new Promise((resolve) => setTimeout(resolve, start - Date.now()));
    signal.throwIfAborted();
  }
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) });
  if (!response.ok) throw new Error('El servicio de direcciones no respondió. Intenta más tarde.');
  const data = await response.json() as T;
  if (isPublicNominatim) {
    if (nominatimCache.size >= 64) {
      const oldest = nominatimCache.keys().next().value;
      if (oldest !== undefined) nominatimCache.delete(oldest);
    }
    nominatimCache.set(url.href, data);
  }
  return data;
}

export async function searchAddress(address: string, signal: AbortSignal) {
  const results = await request<Address[]>('search', {
    q: address,
    countrycodes: 'co',
    viewbox: '-75.74,6.46,-75.43,6.05',
    limit: '1',
  }, signal);
  const result = results[0];
  const point = { lat: Number(result?.lat), lng: Number(result?.lon) };
  if (!result?.display_name || !validCoordinates(point)) throw new Error('No encontramos la dirección. Incluye el municipio o selecciona el punto en el mapa.');
  return { ...point, address: result.display_name.slice(0, 200) };
}

export async function reverseAddress(point: Coordinates, signal: AbortSignal) {
  if (!validCoordinates(point)) throw new Error('Las coordenadas no son válidas.');
  const result = await request<Address>('reverse', { lat: String(point.lat), lon: String(point.lng) }, signal);
  if (!result.display_name) throw new Error('No encontramos una dirección para ese punto.');
  const address = result.address ?? {};
  return {
    address: result.display_name.slice(0, 200),
    sector: [address.neighbourhood || address.suburb || address.quarter, address.city || address.town || address.village].filter(Boolean).join(', ').slice(0, 150),
  };
}

export function locate(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('El navegador no permite obtener la ubicación.'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => reject(new Error('No se pudo obtener tu ubicación. Revisa el permiso del navegador.')),
      { timeout: 10000 },
    );
  });
}
