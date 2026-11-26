
import axios from 'axios';
import { backendApiUrl } from './api-url';

const backendUrl = backendApiUrl(process.env.NEXT_PUBLIC_API_URL);
const usarProxy = process.env.NEXT_PUBLIC_API_USE_PROXY === 'true';

export const API_BASE_URL = usarProxy
  ? '/api/v1'
  : backendUrl;

// Cliente Axios con el prefijo global de la API
const usarProxyLocal = !usarProxy && process.env.NODE_ENV === 'development' &&
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
