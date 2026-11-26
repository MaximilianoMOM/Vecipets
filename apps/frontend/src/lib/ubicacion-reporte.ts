import { leerCoordenadas } from './reportes-mapa';

export const municipiosValleDeAburra = [
  'Medellín', 'Barbosa', 'Bello', 'Caldas', 'Copacabana', 'Envigado',
  'Girardota', 'Itagüí', 'La Estrella', 'Sabaneta',
] as const;

const limites = { oeste: -75.83, este: -75.18, sur: 5.95, norte: 6.65 };
const proveedor = (process.env.NEXT_PUBLIC_GEOCODER_URL || 'https://nominatim.openstreetmap.org').replace(/\/+$/, '');

export type Coordenadas = { lat: number; lng: number };
export type ResultadoUbicacion = Coordenadas & {
  etiqueta: string;
  municipio: string;
  barrio: string;
  direccion: string;
  numeroRegistrado: boolean;
};

type ResultadoGeocodificador = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: Record<string, string>;
};

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function municipioValleDeAburra(texto: string) {
  const nombre = normalizar(texto).replace(/^perimetro urbano (?:de )?/, '');
  return municipiosValleDeAburra.find((municipio) => normalizar(municipio) === nombre);
}

export function dentroDelArea({ lat, lng }: Coordenadas) {
  return lat >= limites.sur && lat <= limites.norte && lng >= limites.oeste && lng <= limites.este;
}

function convertirResultado(resultado: ResultadoGeocodificador, punto?: Coordenadas): ResultadoUbicacion | null {
  const direccion = resultado.address;
  const coordenadas = punto ?? leerCoordenadas(resultado.lat, resultado.lon);
  if (!direccion || !coordenadas || !dentroDelArea(coordenadas) || direccion.country_code !== 'co') return null;
  const antioquia = normalizar(direccion.state ?? '') === 'antioquia' || direccion['ISO3166-2-lvl4'] === 'CO-ANT';
  if (!antioquia) return null;

  const municipios = [direccion.city, direccion.town, direccion.municipality, direccion.county];
  const municipio = municipios.map((nombre) => municipioValleDeAburra(nombre ?? '')).find(Boolean);
  if (!municipio) return null;
  const barrio = direccion.neighbourhood || direccion.suburb || direccion.quarter ||
    direccion.residential || direccion.city_district || direccion.village || '';
  const calle = [direccion.road, direccion.house_number].filter(Boolean).join(direccion.road && direccion.house_number ? ' # ' : '');

  return {
    ...coordenadas, municipio, barrio, direccion: calle,
    etiqueta: resultado.display_name || [calle, barrio, municipio].filter(Boolean).join(', '),
    numeroRegistrado: Boolean(direccion.house_number),
  };
}

export async function buscarDireccion(barrio: string, direccion: string, municipio: string, signal: AbortSignal) {
  const numeroBuscado = direccion.split('#')[1]?.trim();
  const direccionNormalizada = direccion.replace(/\s*#\s*/g, ' ').replace(/\s*-\s*/g, '-').trim();
  const parametros = new URLSearchParams({
    q: [direccionNormalizada, barrio.trim(), municipio, 'Antioquia', 'Colombia'].filter(Boolean).join(', '),
    format: 'jsonv2', addressdetails: '1', countrycodes: 'co', bounded: '1', limit: '5',
    viewbox: `${limites.oeste},${limites.norte},${limites.este},${limites.sur}`,
    'accept-language': 'es',
  });
  const respuesta = await fetch(`${proveedor}/search?${parametros}`, { signal, headers: { Accept: 'application/json' } });
  if (!respuesta.ok) throw new Error('No se pudo buscar la dirección.');
  const resultados: ResultadoGeocodificador[] = await respuesta.json();
  return resultados.flatMap((resultado) => {
    const convertido = convertirResultado(resultado);
    if (convertido?.municipio !== municipio) return [];
    if (numeroBuscado) {
      const numero = resultado.address?.house_number ?? '';
      convertido.numeroRegistrado = normalizar(numero).replace(/\s/g, '') === normalizar(numeroBuscado).replace(/\s/g, '');
    }
    return [convertido];
  });
}

export async function comprobarPunto(punto: Coordenadas, signal: AbortSignal) {
  if (!dentroDelArea(punto)) return null;
  const parametros = new URLSearchParams({
    lat: String(punto.lat), lon: String(punto.lng), format: 'jsonv2',
    addressdetails: '1', 'accept-language': 'es',
  });
  const respuesta = await fetch(`${proveedor}/reverse?${parametros}`, { signal, headers: { Accept: 'application/json' } });
  if (!respuesta.ok) throw new Error('No se pudo comprobar el punto.');
  return convertirResultado(await respuesta.json(), punto);
}
