import type { User } from './auth-context';

export const roleLabels: Record<User['rol'], string> = {
  CIUDADANO: 'Ciudadano',
  ADMINISTRADOR: 'Administrador',
  REFUGIO: 'Refugio',
  VETERINARIA: 'Veterinaria',
};

export const accountStatus: Record<string, string> = {
  APROBADO: 'Activa',
  INACTIVO: 'Inactiva',
  PENDIENTE: 'Pendiente de aprobación',
  RECHAZADO: 'Rechazada',
};
