const BASE_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/api/v1';

export interface APIErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Cliente HTTP modular universal fetchAPI para la plataforma VeciPets
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Autenticación por token JWT en localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('vecipets_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Si el cuerpo NO es FormData, establecer Content-Type por defecto como application/json
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data !== null && (data.message || data.error))
          ? Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || data.error
          : `Error HTTP ${response.status}: ${response.statusText}`;

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    // Si la conexión fue rechazada porque el backend local no está encendido, relanzar un mensaje comprensible
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NETWORK_OFFLINE');
    }
    throw error;
  }
}

/**
 * Objeto de compatibilidad retroactiva para servicios legacy
 */
export const apiClient = {
  get: async (endpoint: string, options: any = {}) => {
    const query = options.params ? `?${new URLSearchParams(options.params).toString()}` : '';
    const data = await fetchAPI<any>(`${endpoint}${query}`, { method: 'GET' });
    return { data };
  },
  post: async (endpoint: string, data: any) => {
    const resData = await fetchAPI<any>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return { data: resData };
  },
  patch: async (endpoint: string, data: any) => {
    const resData = await fetchAPI<any>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { data: resData };
  },
  delete: async (endpoint: string) => {
    const resData = await fetchAPI<any>(endpoint, { method: 'DELETE' });
    return { data: resData };
  },
};

// -------------------------------------------------------------
// SERVICIOS Y HELPER METHODS PARA ENDPOINTS REST ESPECÍFICOS
// -------------------------------------------------------------

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  avatarUrl?: string;
}

export interface AuthLoginResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  token?: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  };
  user?: {
    id: string;
    nombreCompleto?: string;
    email: string;
    telefono?: string;
  };
}

export interface Reporte {
  id: string;
  titulo: string;
  nombreMascota?: string;
  especie: 'PERRO' | 'GATO' | 'OTRO';
  raza?: string;
  color?: string;
  tipo: 'PERDIDO' | 'ENCONTRADO' | 'ADOPCION';
  estado: 'PERDIDO' | 'ENCONTRADO' | 'REUNIDO' | 'EN_ADOPCION' | 'ADOPTADO';
  descripcion: string;
  fotoUrl: string;
  ubicacion: string;
  ciudad?: string;
  latitud: number;
  longitud: number;
  fechaEvento: string;
  contactoTelefono: string;
  contactoEmail?: string;
  recompensa?: number;
  usuarioId?: string;
  usuario?: Usuario;
  createdAt: string;
}

export interface Refugio {
  id: string;
  nombre: string;
  tipo: 'REFUGIO' | 'VETERINARIA' | 'CLINICA';
  direccion: string;
  telefono: string;
  email?: string;
  horario?: string;
  servicios?: string[];
  latitud: number;
  longitud: number;
  imagenUrl?: string;
}

export const authAPI = {
  // Coincide exactamente con NestJS LoginDto: { email, password }
  login: async (data: { email: string; password: string }): Promise<AuthLoginResponse> => {
    try {
      return await fetchAPI<AuthLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'NETWORK_OFFLINE') {
        // Fallback local si el backend no está encendido en el puerto 4000
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        const mockUser = {
          id: 'local-user-id',
          nombre: data.email.split('@')[0],
          email: data.email,
          rol: 'CIUDADANO',
        };
        return {
          message: 'Inicio de sesión simulado (Modo Cliente)',
          accessToken: mockToken,
          usuario: mockUser,
        };
      }
      throw err;
    }
  },

  // Coincide exactamente con NestJS RegisterDto: { nombreCompleto, email, password, telefono, rol }
  register: async (data: {
    nombreCompleto: string;
    email: string;
    password: string;
    telefono: string;
    rol?: string;
  }): Promise<AuthLoginResponse> => {
    // Garantizar envío estricto de campos requeridos por RegisterDto en NestJS
    const payload = {
      nombreCompleto: data.nombreCompleto.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      telefono: data.telefono.trim(),
      rol: data.rol || 'CIUDADANO',
    };

    try {
      return await fetchAPI<AuthLoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'NETWORK_OFFLINE') {
        // Fallback local si el servidor backend aún no está iniciado
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        const mockUser = {
          id: 'user-' + Date.now(),
          nombreCompleto: payload.nombreCompleto,
          email: payload.email,
          telefono: payload.telefono,
          rol: payload.rol,
        };
        return {
          message: 'Registro exitoso (Modo Cliente)',
          accessToken: mockToken,
          user: mockUser,
        };
      }
      throw err;
    }
  },

  getPerfil: async (): Promise<Usuario> => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('vecipets_user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {}
      }
    }
    try {
      return await fetchAPI<Usuario>('/auth/perfil');
    } catch (e) {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('vecipets_user');
        if (storedUser) return JSON.parse(storedUser);
      }
      throw new Error('No hay usuario autenticado');
    }
  },
};

export const reportesAPI = {
  getReportes: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchAPI<Reporte[]>(`/reportes${query}`);
  },

  getReporteById: (id: string) => fetchAPI<Reporte>(`/reportes/${id}`),

  crearReporte: (formData: FormData) =>
    fetchAPI<Reporte>('/reportes', {
      method: 'POST',
      body: formData,
    }),

  cambiarEstado: (id: string, estado: string) =>
    fetchAPI<Reporte>(`/reportes/${id}/resolver`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
};

export const refugiosAPI = {
  getRefugios: () => fetchAPI<Refugio[]>('/refugios'),
};