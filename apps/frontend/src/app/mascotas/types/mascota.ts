export type TipoReporte =
  | "perdida"
  | "encontrada";

export type Especie =
  | "Perro"
  | "Gato"
  | "Otro";

export type Mascota = {
  id: number;

  tipo: TipoReporte;

  nombre: string;

  especie: Especie;

  raza: string;

  color: string;

  tamaño: string;

  sexo: string;

  fecha: string;

  sector: string;

  ciudad: string;

  descripcion: string;

  imagen?: string;
};