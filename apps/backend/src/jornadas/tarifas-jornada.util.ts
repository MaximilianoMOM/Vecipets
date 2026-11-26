import { BadRequestException } from '@nestjs/common';

// ==========================================
// TARIFAS DE APARTADO DE JORNADAS
// ==========================================
// - Procedimiento gratuito: $2.000 COP (200.000 centavos)
// - Procedimiento > 0 y < $50.000 COP: $5.000 COP (500.000 centavos)
// - Procedimiento >= $50.000 COP: $10.000 COP (1.000.000 centavos)

export const APARTADO_GRATUITO_CENTAVOS = 200_000;
export const APARTADO_BAJO_CENTAVOS = 500_000;
export const APARTADO_ALTO_CENTAVOS = 1_000_000;
export const UMBRAL_PRECIO_ALTO_CENTAVOS = 5_000_000;

export function calcularApartadoCentavos(precioCentavos: number): number {
  if (!Number.isSafeInteger(precioCentavos) || precioCentavos < 0) {
    throw new BadRequestException('El precio del procedimiento no es válido.');
  }

  if (precioCentavos === 0) {
    return APARTADO_GRATUITO_CENTAVOS;
  }

  if (precioCentavos < UMBRAL_PRECIO_ALTO_CENTAVOS) {
    return APARTADO_BAJO_CENTAVOS;
  }

  return APARTADO_ALTO_CENTAVOS;
}

export function calcularSaldoPendienteCentavos(
  precioProcedimientoCentavos: number,
  precioApartadoCentavos: number,
): number {
  return Math.max(0, precioProcedimientoCentavos - precioApartadoCentavos);
}
