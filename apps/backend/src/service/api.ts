const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Error en la petición: ${res.statusText}`);
  }

  return res.json();
}

// 1. Servicio de Mascotas (Basado en el modelo Pet)
export const mascotasService = {
  obtenerMisMascotas: async (usuarioId: string) => {
    return fetchApi(`/mascotas?usuarioId=${usuarioId}`);
  },
  registrarMascota: async (datos: {
    usuarioId: string;
    nombre: string;
    especie: string;
    raza: string;
    edadAprox: number;
    color: string;
    caracteristicas: string;
    fotoUrl: string;
  }) => {
    return fetchApi('/mascotas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },
};

// 2. Servicio de Reportes y Ubicaciones para el Mapa (Modelos Report y Location)
export const reportesService = {
  obtenerReportesPublicos: async () => {
    // Ideal para mostrar en tu página del mapa interactivo
    return fetchApi('/reportes?estado=PUBLICO');
  },
  crearReporte: async (datos: {
    usuarioId: string;
    mascotaId?: string;
    ubicacion: { direccion: string; comuna: string; barrio: string; latitud: number; longitud: number };
    tipo: 'PERDIDA' | 'HALLAZGO';
    titulo: string;
    descripcion: string;
    fechaAcontecimiento: string;
  }) => {
    return fetchApi('/reportes', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },
};

// 3. Servicio de Refugios y Veterinarias (Modelos Shelter y Veterinary)
export const entidadesService = {
  obtenerDirectorio: async () => {
    return fetchApi('/entidades'); // Devuelve refugios y veterinarias junto con sus ubicaciones
  },
};