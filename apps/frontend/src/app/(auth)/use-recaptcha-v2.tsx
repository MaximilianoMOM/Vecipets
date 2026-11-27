'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';
import { scriptRecaptcha } from './use-recaptcha';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY?.trim();

export function useRecaptchaV2() {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const token = useRef('');
  const [verificado, setVerificado] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    token.current = '';
    setVerificado(false);
    if (widget.current !== null) window.grecaptcha?.reset(widget.current);
  }

  function tomarToken() {
    const valor = token.current;
    if (valor) reset();
    return valor;
  }

  const casilla = (
    <div>
      {siteKey && (
        <>
          <div ref={container} className="flex justify-center" />
          <Script
            src={scriptRecaptcha}
            onReady={() => window.grecaptcha?.ready(() => {
              if (!container.current || widget.current !== null) return;
              try {
                widget.current = window.grecaptcha!.render(container.current, {
                  sitekey: siteKey,
                  size: container.current.clientWidth < 304 ? 'compact' : 'normal',
                  callback: (respuesta) => {
                    token.current = respuesta;
                    setVerificado(Boolean(respuesta));
                    setError('');
                  },
                  'expired-callback': () => {
                    reset();
                    setError('La verificación venció. Marca la casilla nuevamente.');
                  },
                  'error-callback': () => {
                    token.current = '';
                    setVerificado(false);
                    setError('No se pudo verificar reCAPTCHA. Recarga la página e intenta nuevamente.');
                  },
                });
              } catch {
                setError('No se pudo cargar reCAPTCHA. Recarga la página e intenta nuevamente.');
              }
            })}
            onError={() => setError('No se pudo cargar reCAPTCHA. Recarga la página e intenta nuevamente.')}
          />
        </>
      )}
      {(!siteKey || error) && (
        <p role="alert" className="text-sm text-red-600">
          {error || 'La verificación reCAPTCHA no está disponible.'}
        </p>
      )}
    </div>
  );
  return { casilla, verificado, tomarToken };
}
