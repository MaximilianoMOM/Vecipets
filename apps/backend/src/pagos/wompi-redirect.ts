import type { ConfigService } from '@nestjs/config';

export function redireccionWompi(config: ConfigService, ruta: string): string {
  const frontend = config.get<string>('WOMPI_FRONTEND_URL')?.trim() ||
    config.get<string>('FRONTEND_URL')?.trim() || 'http://localhost:3000';
  return frontend.replace(/\/+$/, '') + ruta;
}

export function reusarCheckoutWompi(checkoutUrl: string, config: ConfigService, ruta: string): string {
  if (!config.get<string>('WOMPI_FRONTEND_URL')?.trim()) return checkoutUrl;

  const checkout = new URL(checkoutUrl);
  const redirectUrl = redireccionWompi(config, ruta);
  if (checkout.searchParams.get('redirect-url') === redirectUrl) return checkoutUrl;
  checkout.searchParams.set('redirect-url', redirectUrl);

  return checkout.toString();
}
