const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api/v1';

console.log(
  '🔥 BASE_URL DEL FRONTEND:',
  BASE_URL,
);

// ============================================================
// TIPOS GENERALES
// ============================================================

export interface APIErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

// ============================================================
// USUARIO
// ============================================================

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  activo?: boolean;
  avatarUrl?: string;

  refugio?: {
    id: string;
    nombre: string;
    capacidad: number;
    horario: string;
    sitioWeb?: string | null;

    ubicacion?: {
      direccion: string;
      comuna: string;
      barrio: string;
      latitud: number | string;
      longitud: number | string;
    } | null;
  } | null;

  veterinaria?: {
    id: string;
    nombre: string;
    urgencias24h: boolean;
    horario: string;

    ubicacion?: {
      direccion: string;
      comuna: string;
      barrio: string;
      latitud: number | string;
      longitud: number | string;
    } | null;
  } | null;
}

// ============================================================
// RESPUESTA LOGIN / REGISTRO
// ============================================================

export interface AuthLoginResponse {
  message: string;

  accessToken: string;

  refreshToken?: string;

  token?: string;

  usuario?: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    rol?: string;
    estado?: string;
    activo?: boolean;
    avatarUrl?: string;
  };

  user?: {
    id: string;
    nombreCompleto?: string;
    nombre?: string;
    email: string;
    telefono?: string;
    rol?: string;
    estado?: string;
    activo?: boolean;
    avatarUrl?: string;
  };
}

// ============================================================
// REPORTES
// ============================================================

export interface Reporte {
  id: string;

  titulo: string;

  nombreMascota?: string;

  especie:
    | 'PERRO'
    | 'GATO'
    | 'OTRO';

  raza?: string;

  color?: string;

  tipo:
    | 'PERDIDA'
    | 'HALLAZGO';

  estado:
    | 'PENDIENTE'
    | 'PUBLICO'
    | 'RECHAZADO'
    | 'RESUELTO'
    | 'CERRADO';

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

// ============================================================
// MASCOTAS
// ============================================================

export interface Mascota {
  id: string;

  nombre: string;

  especie: string;

  raza: string;

  edadAprox: number;

  color: string;

  caracteristicas: string;

  fotoUrl?: string;

  usuarioId?: string;
}

// ============================================================
// UBICACIONES
// ============================================================

export interface Ubicacion {
  id: string;

  direccion: string;

  comuna: string;

  barrio: string;

  latitud: number;

  longitud: number;
}

// ============================================================
// REFUGIOS / VETERINARIAS
// ============================================================

export interface Refugio {
  id: string;

  nombre: string;

  tipo:
    | 'REFUGIO'
    | 'VETERINARIA'
    | 'CLINICA';

  direccion: string;

  telefono: string;

  email?: string;

  horario?: string;

  servicios?: string[];

  latitud: number;

  longitud: number;

  imagenUrl?: string;
}

// ============================================================
// CLIENTE HTTP PRINCIPAL
// ============================================================

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  const url =
    `${BASE_URL}${cleanEndpoint}`;

  const headers =
    new Headers(options.headers);

  // ==========================================================
  // AGREGAR JWT AUTOMÁTICAMENTE
  // ==========================================================

  if (
    typeof window !== 'undefined'
  ) {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem(
        'vecipets_access_token',
      );

    if (token) {
      headers.set(
        'Authorization',
        `Bearer ${token}`,
      );
    }
  }

  // ==========================================================
  // CONTENT TYPE
  // ==========================================================

  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  if (
    !isFormData &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  try {
    const response =
      await fetch(url, {
        ...options,
        headers,
      });

    const contentType =
      response.headers.get(
        'content-type',
      ) || '';

    let data: any = null;

    // ========================================================
    // LEER RESPUESTA
    // ========================================================

    if (
      contentType.includes(
        'application/json',
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }

    // ========================================================
    // ERRORES HTTP
    // ========================================================

    if (!response.ok) {
      let errorMessage =
        `Error HTTP ${response.status}`;

      if (
        data &&
        typeof data === 'object'
      ) {
        if (
          Array.isArray(
            data.message,
          )
        ) {
          errorMessage =
            data.message.join(', ');
        } else if (
          data.message
        ) {
          errorMessage =
            data.message;
        } else if (
          data.error
        ) {
          errorMessage =
            data.error;
        }
      } else if (
        typeof data === 'string' &&
        data.trim()
      ) {
        errorMessage = data;
      }

      // ======================================================
      // SESIÓN NO AUTORIZADA / TOKEN EXPIRADO
      // ======================================================

<<<<<<< HEAD
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('vecipets_access_token');
          localStorage.removeItem('vecipets_user');
        }
=======
      if (
        response.status === 401
      ) {
>>>>>>> ccb32ab9b5d77229d88162b77453513429738fdb
        throw new Error(
          `UNAUTHORIZED: ${errorMessage}`,
        );
      }

      // ======================================================
      // SIN PERMISOS
      // ======================================================

      if (
        response.status === 403
      ) {
        throw new Error(
          `FORBIDDEN: ${errorMessage}`,
        );
      }

      throw new Error(
        errorMessage,
      );
    }

    return data as T;
  } catch (error: any) {
    // ========================================================
    // ERROR REAL DE CONEXIÓN
    // ========================================================

    if (
      error?.name === 'TypeError' &&
      (
        error?.message?.includes(
          'fetch',
        ) ||
        error?.message?.includes(
          'Failed to fetch',
        ) ||
        error?.message?.includes(
          'NetworkError',
        )
      )
    ) {
      throw new Error(
        'NETWORK_OFFLINE',
      );
    }

    throw error;
  }
}

// ============================================================
// CLIENTE LEGACY
// ============================================================

export const apiClient = {
  get: async (
    endpoint: string,
    options: any = {},
  ) => {
    const query =
      options.params
        ? `?${new URLSearchParams(
            options.params,
          ).toString()}`
        : '';

    const data =
      await fetchAPI<any>(
        `${endpoint}${query}`,
        {
          method: 'GET',
        },
      );

    return {
      data,
    };
  },

  post: async (
    endpoint: string,
    data: any,
  ) => {
    const response =
      await fetchAPI<any>(
        endpoint,
        {
          method: 'POST',
          body:
            data instanceof FormData
              ? data
              : JSON.stringify(data),
        },
      );

    return {
      data: response,
    };
  },

  patch: async (
    endpoint: string,
    data: any,
  ) => {
    const response =
      await fetchAPI<any>(
        endpoint,
        {
          method: 'PATCH',
          body:
            JSON.stringify(data),
        },
      );

    return {
      data: response,
    };
  },

  delete: async (
    endpoint: string,
  ) => {
    const response =
      await fetchAPI<any>(
        endpoint,
        {
          method: 'DELETE',
        },
      );

    return {
      data: response,
    };
  },
};

// ============================================================
// AUTENTICACIÓN
// ============================================================

export const authAPI = {
  // ==========================================================
  // LOGIN
  // ==========================================================

  login: async (
    data: {
      email: string;
      password: string;
    },
  ): Promise<AuthLoginResponse> => {
    const payload = {
      email:
        data.email
          .trim()
          .toLowerCase(),

      password:
        data.password,
    };

    const response =
      await fetchAPI<AuthLoginResponse>(
        '/auth/login',
        {
          method: 'POST',
          body:
            JSON.stringify(payload),
        },
      );

    // ======================================================
    // GUARDAR SESIÓN
    // ======================================================

    if (
      typeof window !== 'undefined'
    ) {
      const token =
        response.accessToken ||
        response.token;

      if (token) {
        localStorage.setItem(
          'token',
          token,
        );

        localStorage.setItem(
          'vecipets_access_token',
          token,
        );
      }

      // ====================================================
      // NORMALIZAR USUARIO
      // ====================================================

      let usuario:
        Usuario | null = null;

      if (
        response.usuario
      ) {
        usuario = {
          id:
            response.usuario.id,

          nombre:
            response.usuario.nombre,

          email:
            response.usuario.email,

          telefono:
            response.usuario.telefono,

          rol:
            response.usuario.rol,

          estado:
            response.usuario.estado,

          activo:
            response.usuario.activo,

          avatarUrl:
            response.usuario.avatarUrl,
        };
      } else if (
        response.user
      ) {
        usuario = {
          id:
            response.user.id,

          nombre:
            response.user.nombre ||
            response.user.nombreCompleto ||
            '',

          email:
            response.user.email,

          telefono:
            response.user.telefono,

          rol:
            response.user.rol,

          estado:
            response.user.estado,

          activo:
            response.user.activo,

          avatarUrl:
            response.user.avatarUrl,
        };
      }

      // ====================================================
      // GUARDAR USUARIO
      // ====================================================

      if (usuario) {
        localStorage.setItem(
          'vecipets_user',
          JSON.stringify(usuario),
        );
      }
    }

    return response;
  },

  // ==========================================================
  // REGISTRO
  // ==========================================================

  register: async (
    data: {
      nombreCompleto: string;
      email: string;
      password: string;
      telefono: string;
      rol?: string;

      // DATOS REFUGIO
      nombreRefugio?: string;
      capacidadRefugio?: number;
      horarioRefugio?: string;
      sitioWebRefugio?: string;

      // DATOS VETERINARIA
      nombreVeterinaria?: string;
      urgencias24h?: boolean;
      horarioVeterinaria?: string;

      // UBICACIÓN
      direccion?: string;
      comuna?: string;
      barrio?: string;
      latitud?: string;
      longitud?: string;
    },
  ): Promise<AuthLoginResponse> => {
    // ========================================================
    // DATOS BÁSICOS
    // ========================================================

    const payload: any = {
      nombreCompleto:
        data.nombreCompleto.trim(),

      email:
        data.email
          .trim()
          .toLowerCase(),

      password:
        data.password,

      telefono:
        data.telefono.trim(),

      rol:
        data.rol ||
        'CIUDADANO',
    };

    // ========================================================
    // DATOS REFUGIO
    // ========================================================

    if (
      data.rol === 'REFUGIO'
    ) {
      payload.nombreRefugio =
        data.nombreRefugio?.trim();

      payload.capacidadRefugio =
        data.capacidadRefugio;

      payload.horarioRefugio =
        data.horarioRefugio?.trim();

      if (
        data.sitioWebRefugio?.trim()
      ) {
        payload.sitioWebRefugio =
          data.sitioWebRefugio.trim();
      }

      // ------------------------------------------------------
      // UBICACIÓN DEL REFUGIO
      // ------------------------------------------------------

      payload.direccion =
        data.direccion?.trim();

      payload.comuna =
        data.comuna?.trim();

      payload.barrio =
        data.barrio?.trim();

      payload.latitud =
        data.latitud?.trim();

      payload.longitud =
        data.longitud?.trim();
    }

    // ========================================================
    // DATOS VETERINARIA
    // ========================================================

    if (
      data.rol === 'VETERINARIA'
    ) {
      payload.nombreVeterinaria =
        data.nombreVeterinaria?.trim();

      payload.urgencias24h =
        data.urgencias24h ?? false;

      payload.horarioVeterinaria =
        data.horarioVeterinaria?.trim();

      // ------------------------------------------------------
      // UBICACIÓN DE LA VETERINARIA
      // ------------------------------------------------------

      payload.direccion =
        data.direccion?.trim();

      payload.comuna =
        data.comuna?.trim();

      payload.barrio =
        data.barrio?.trim();

      payload.latitud =
        data.latitud?.trim();

      payload.longitud =
        data.longitud?.trim();
    }

    // ========================================================
    // MOSTRAR DATOS QUE SE ENVIARÁN
    // ========================================================

    console.log(
      'PAYLOAD FINAL QUE SE ENVÍA AL BACKEND:',
      payload,
    );

    // ========================================================
    // ENVIAR REGISTRO
    // ========================================================

    return await fetchAPI<AuthLoginResponse>(
      '/auth/register',
      {
        method: 'POST',
        body:
          JSON.stringify(payload),
      },
    );
  },

  // ==========================================================
  // PERFIL
  // ==========================================================

  getPerfil:
    async (): Promise<Usuario> => {
      // ======================================================
      // VERIFICAR NAVEGADOR
      // ======================================================

      if (
        typeof window === 'undefined'
      ) {
        throw new Error(
          'NO_SESSION',
        );
      }

      // ======================================================
      // RECUPERAR TOKEN
      // ======================================================

      const token =
        localStorage.getItem(
          'token',
        ) ||
        localStorage.getItem(
          'vecipets_access_token',
        );

      // ======================================================
      // SI NO HAY TOKEN, USAR USUARIO GUARDADO
      // ======================================================

      if (!token) {
        const storedUser =
          localStorage.getItem(
            'vecipets_user',
          );

        if (storedUser) {
          try {
            const usuario =
              JSON.parse(
                storedUser,
              ) as Usuario;

            if (
              usuario &&
              usuario.id &&
              usuario.email
            ) {
              return usuario;
            }
          } catch (error) {
            console.error(
              'Error leyendo vecipets_user:',
              error,
            );

            localStorage.removeItem(
              'vecipets_user',
            );
          }
        }

        throw new Error(
          'NO_SESSION',
        );
      }

      // ======================================================
      // OBTENER PERFIL REAL DESDE BACKEND
      // ======================================================

      try {
        const usuario =
          await fetchAPI<Usuario>(
            '/auth/perfil',
            {
              method: 'GET',
            },
          );

        // ====================================================
        // GUARDAR PERFIL ACTUALIZADO
        // ====================================================

        localStorage.setItem(
          'vecipets_user',
          JSON.stringify(usuario),
        );

        return usuario;
      } catch (error) {
        console.error(
          'Error obteniendo perfil desde el backend:',
          error,
        );

        // ====================================================
        // RESPALDO: USUARIO GUARDADO
        // ====================================================

        const storedUser =
          localStorage.getItem(
            'vecipets_user',
          );

        if (storedUser) {
          try {
            const usuario =
              JSON.parse(
                storedUser,
              ) as Usuario;

            if (
              usuario &&
              usuario.id &&
              usuario.email
            ) {
              return usuario;
            }
          } catch (
            storageError
          ) {
            console.error(
              'Error leyendo usuario guardado:',
              storageError,
            );
          }
        }

        // ====================================================
        // SI NO HAY RESPALDO
        // ====================================================

        throw error;
      }
    },

  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  logout: () => {
    if (
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem(
        'token',
      );

      localStorage.removeItem(
        'vecipets_access_token',
      );

      localStorage.removeItem(
        'vecipets_user',
      );
    }
  },
};

// ============================================================
// REPORTES
// ============================================================

export const reportesAPI = {
  // ==========================================================
  // OBTENER TODOS LOS REPORTES
  // ==========================================================

  getReportes: (
    params?: Record<string, string>,
  ) => {
    const query =
      params &&
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(
            params,
          ).toString()}`
        : '';

    return fetchAPI<Reporte[]>(
      `/reportes${query}`,
      {
        method: 'GET',
      },
    );
  },

  // ==========================================================
  // OBTENER UN REPORTE
  // ==========================================================

  getReporteById: (
    id: string,
  ) => {
    return fetchAPI<Reporte>(
      `/reportes/${id}`,
      {
        method: 'GET',
      },
    );
  },

  // ==========================================================
  // CREAR REPORTE
  // ==========================================================

  crearReporte: (
    data: {
      mascotaId: string;
      ubicacionId: string;
      tipo:
        | 'PERDIDA'
        | 'HALLAZGO';
      titulo: string;
      descripcion: string;
      fechaAcontecimiento: string;
      imagenUrl?: string;
      imagenPublicId?: string;
    },
  ) => {
    return fetchAPI<Reporte>(
      '/reportes',
      {
        method: 'POST',
        body:
          JSON.stringify(data),
      },
    );
  },

  // ==========================================================
  // MARCAR COMO RESUELTO
  // ==========================================================

  cambiarEstado: (
    id: string,
    estado: string,
  ) => {
    return fetchAPI<Reporte>(
      `/reportes/${id}/resolver`,
      {
        method: 'PATCH',
        body:
          JSON.stringify({
            estado,
          }),
      },
    );
  },
};

// ============================================================
// MASCOTAS
// ============================================================

export const mascotasAPI = {
  // ==========================================================
  // CREAR MASCOTA
  // ==========================================================

  crearMascota: (
    data: {
      nombre: string;
      especie: string;
      raza: string;
      edadAprox: number;
      color: string;
      caracteristicas: string;
      fotoUrl?: string;
    },
  ) => {
    return fetchAPI<Mascota>(
      '/mascotas',
      {
        method: 'POST',
        body:
          JSON.stringify(data),
      },
    );
  },
};

// ============================================================
// UBICACIONES
// ============================================================

export const ubicacionesAPI = {
  // ==========================================================
  // CREAR UBICACIÓN
  // ==========================================================

  crearUbicacion: (
    data: {
      direccion: string;
      comuna: string;
      barrio: string;
      latitud: number;
      longitud: number;
    },
  ) => {
    return fetchAPI<Ubicacion>(
      '/ubicaciones',
      {
        method: 'POST',
        body:
          JSON.stringify(data),
      },
    );
  },
};

// ============================================================
// REFUGIOS Y VETERINARIAS
// ============================================================

export const refugiosAPI = {
  getRefugios: () => {
    return fetchAPI<Refugio[]>(
      '/refugios',
      {
        method: 'GET',
      },
    );
  },
};

export const veterinariasAPI = {
  getVeterinarias: () => {
    return fetchAPI<Refugio[]>(
      '/veterinarias',
      {
        method: 'GET',
      },
    );
  },
};