'use client';

import { useEffect, useState } from 'react';
import { apiClient } from './api-client';
import { convertirReporteEnMarcador, type MapItem, type ReporteMapa } from './reportes-mapa';

export function useReportesMapa(maximo?: number) {
  const [items, setItems] = useState<MapItem[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [consulta, setConsulta] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function cargar() {
      const marcadores = new Map<string, MapItem>();
      let pagina = 1;
      let paginas = 1;
      try {
        while (pagina <= paginas && (maximo === undefined || marcadores.size < maximo)) {
          const { data } = await apiClient.get<{ datos: ReporteMapa[]; totalPaginas: number }>('/reportes', {
            params: { limite: 100, pagina },
            signal,
          });
          for (const reporte of data.datos) {
            const marcador = convertirReporteEnMarcador(reporte);
            if (marcador) marcadores.set(marcador.id, marcador);
            if (maximo !== undefined && marcadores.size === maximo) break;
          }
          paginas = data.totalPaginas;
          pagina += 1;
        }
        if (!signal.aborted) {
          setItems(Array.from(marcadores.values()));
          setEstado('listo');
        }
      } catch {
        if (!signal.aborted) setEstado('error');
      }
    }

    void cargar();
    return () => controller.abort();
  }, [maximo, consulta]);

  function recargar() {
    setEstado('cargando');
    setConsulta((actual) => actual + 1);
  }

  return { items, estado, recargar };
}
