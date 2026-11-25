
export type EstadoValidacionImagen =
  | 'APROBADA'
  | 'RECHAZADA'
  | 'DUDOSA';

export interface ResultadoAnimal {
  contieneAnimal: boolean;
  etiquetasDetectadas: string[];
  confianzaMaxima: number;
}

export interface ResultadoSeguridad {
  esInapropiada: boolean;
  adulto: string;
  violencia: string;
}

export interface DecisionValidacionImagen {
  estado: EstadoValidacionImagen;
  aprobada: boolean;
  esInapropiada: boolean;
  esDudosa: boolean;
  motivo: string;
  errorServicio: boolean;
  animal: ResultadoAnimal;
  seguridad: ResultadoSeguridad;
  fechaValidacion: Date;
}

