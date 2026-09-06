/**
 * Combina clases CSS filtrando valores nulos o falsos
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}