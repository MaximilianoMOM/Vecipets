import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { WompiService } from './wompi.service';

const integrity = 'test_integrity_fixture';
const wompi = new WompiService(new ConfigService({
  WOMPI_ENVIRONMENT: 'sandbox',
  WOMPI_SANDBOX_PUBLIC_KEY: 'pub_test_fixture',
  WOMPI_SANDBOX_INTEGRITY_SECRET: integrity,
}));

describe('URL firmada de Wompi', () => {
  it.each([
    { monto: 200_000, retorno: '/jornadas/reserva-resultado?origen=local&reserva=1', conVencimiento: true },
    { monto: 1_500_000, retorno: '/reportar', conVencimiento: false },
  ])('firma y codifica $retorno', ({ monto, retorno, conVencimiento }) => {
    const ref = 'VECIPETS-prueba_1';
    const redirect = 'http://localhost:3000' + retorno;
    const expira = conVencimiento ? new Date(Date.now() + 60_000).toISOString() : undefined;
    const { checkoutUrl } = wompi.prepararCheckout(ref, monto, 'COP', redirect, expira);
    const url = new URL(checkoutUrl);
    const params = url.searchParams;
    const signedExpiration = params.get('expiration-time');
    expect(url.origin + url.pathname).toBe('https://checkout.wompi.co/p/');
    expect(params.get('public-key')).toBe('pub_test_fixture');
    expect(params.get('reference')).toBe(ref);
    expect(params.get('amount-in-cents')).toBe(String(monto));
    expect(params.get('redirect-url')).toBe(redirect);
    expect(signedExpiration).toBe(expira ?? null);
    expect(params.get('signature:integrity')).toBe(createHash('sha256').update(
      ref + monto + 'COP' + (signedExpiration ?? '') + integrity,
    ).digest('hex'));
    expect(checkoutUrl).toContain('signature%3Aintegrity=');
  });

  it.each(['', 'invalida', '2000-01-01T00:00:00.000Z'])('rechaza expiración inválida o vencida %j', expira => {
    expect(() => wompi.prepararCheckout('ref', 200_000, 'COP', 'http://localhost:3000', expira))
      .toThrow(/expiración/);
  });
});