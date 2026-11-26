
import axios from 'axios';

// Dirección base del backend
const backendUrl = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/+$/, '');

export const API_BASE_URL = backendUrl.endsWith('/api/v1')
  ? backendUrl
  : `${backendUrl}/api/v1`;

// Cliente Axios con el prefijo global de la API
const usarProxyLocal = process.env.NODE_ENV === 'development' &&
  ['localhost', '127.0.0.1'].includes(new URL(backendUrl).hostname);

export const apiClient = axios.create({
  baseURL: usarProxyLocal ? '/api/vecipets' : API_BASE_URL,
  withCredentials: true,
});

// Interceptor para manejar errores de las peticiones
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
