export type CategoriaMapa = 'perro' | 'gato' | 'otro';
export type TipoReporteMapa = 'PERDIDA' | 'HALLAZGO';

export type ReporteMapa = {
  id: number | string;
  nombre: string;
  especie: string;
  tipo: TipoReporteMapa;
  barrioSector?: string | null;
  ciudad?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
};

export type MapItem = {
  id: string;
  name: string;
  category: CategoriaMapa;
  status: TipoReporteMapa;
  locationName: string;
  lat: number;
  lng: number;
};

export function leerCoordenadas(latitud: ReporteMapa['latitud'], longitud: ReporteMapa['longitud']) {
  if (latitud == null || longitud == null || String(latitud).trim() === '' || String(longitud).trim() === '') {
    return null;
  }
  const lat = Number(latitud);
  const lng = Number(longitud);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
}

export function convertirReporteEnMarcador(reporte: ReporteMapa): MapItem | null {
  const posicion = leerCoordenadas(reporte.latitud, reporte.longitud);
  if (!posicion) return null;
  const especie = reporte.especie.trim().toLowerCase();
  return {
    id: String(reporte.id),
    name: reporte.nombre,
    category: especie === 'perro' || especie === 'gato' ? especie : 'otro',
    status: reporte.tipo,
    locationName: [reporte.barrioSector, reporte.ciudad].filter(Boolean).join(', ') || 'Ubicación registrada',
    ...posicion,
  };
}

export const etiquetaReporteMapa: Record<TipoReporteMapa, string> = {
  PERDIDA: 'Perdido',
  HALLAZGO: 'Hallazgo',
};
