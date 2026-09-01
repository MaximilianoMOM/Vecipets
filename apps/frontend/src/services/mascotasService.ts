import { apiClient } from '@/lib/api-client';

export interface CrearMascotaData {
  nombre: string;
  especie: string;
  raza: string;
  edadAprox: number;
  color: string;
  caracteristicas: string;
  fotoUrl: string;
}

export const mascotasFrontendService = {
  async obtenerMascotasReportadas(filtros?: any) {
    try {
      const response = await apiClient.get('/mascotas/reportadas', {
        params: filtros || {},
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Error al obtener mascotas reportadas:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  async obtenerMisMascotas() {
    try {
      const response = await apiClient.get('/mascotas');

      return response.data;
    } catch (error: any) {
      console.error(
        'Error al obtener mis mascotas:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  async registrarMascota(data: CrearMascotaData) {
    try {
      const response = await apiClient.post('/mascotas', data);

      return response.data;
    } catch (error: any) {
      console.error(
        'Error al registrar mascota:',
        error?.response?.data || error
      );

      throw error;
    }
  },
};