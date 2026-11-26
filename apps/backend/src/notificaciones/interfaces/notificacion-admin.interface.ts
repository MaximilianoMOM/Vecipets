export interface NotificacionAdminTurbo {
  id: string;
  titulo: string;
  usuarioNombre: string;
  reporteId: number | null;
  reservaId?: number;
  clave?: string;
  monto: string;
  referencia: string;
  fechaPago: Date | string;
  estado: string;
  enlaceReporte: string;
  leida: boolean;
  creadoEn: Date | string;
}

export interface RegistrarNotificacionTurboDto {
  titulo?: string;
  usuarioNombre: string;
  reporteId: number | null;
  reservaId?: number;
  clave?: string;
  monto?: string;
  referencia: string;
  fechaPago: Date | string;
  estado?: string;
  enlaceReporte?: string;
}
