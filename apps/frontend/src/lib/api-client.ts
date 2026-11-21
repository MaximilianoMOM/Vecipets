
import axios from 'axios';

// Dirección base del backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Cliente Axios con el prefijo global de la API
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/+$/, '')}/api/v1`,
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