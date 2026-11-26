'use client';

import { useEffect, useState } from 'react';
import { apiClient } from './api-client';

export function useListaPerfil<T>(ruta: string, usuarioId?: number) {
  const [resultado, setResultado] = useState<{ ruta: string; usuarioId: number; datos: T[]; error: boolean }>();

  useEffect(() => {
    if (usuarioId === undefined) return;
    const controller = new AbortController();
    apiClient.get<T[]>(ruta, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResultado({ ruta, usuarioId, datos: data, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResultado({ ruta, usuarioId, datos: [], error: true });
      });
    return () => controller.abort();
  }, [ruta, usuarioId]);

  const actual = resultado?.usuarioId === usuarioId && resultado?.ruta === ruta ? resultado : undefined;
  return {
    datos: actual?.datos,
    error: actual?.error === true,
    setResultado,
  };
}
