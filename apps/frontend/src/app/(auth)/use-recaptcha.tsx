'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';

export const scriptRecaptcha = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=es';
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (widget: number, options: { action: string }) => Promise<string>;
      reset: (widget: number) => void;
      render: (element: HTMLElement, options: {
        sitekey: string;
        size: 'compact' | 'normal' | 'invisible';
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }) => number;
    };
  }
}

export function useRecaptcha(action: 'register') {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function getToken() {
    if (!ready || widget.current === null || !window.grecaptcha) {
      throw new Error('reCAPTCHA no está disponible');
    }

    window.grecaptcha.reset(widget.current);
    return window.grecaptcha.execute(widget.current, { action });
  }

  const script = siteKey && (
    <>
      <div ref={container} />
      <Script
        src={scriptRecaptcha}
        onReady={() => window.grecaptcha?.ready(() => {
          if (!container.current || widget.current !== null) return;
          try {
            widget.current = window.grecaptcha!.render(container.current, { sitekey: siteKey, size: 'invisible' });
            setReady(true);
          } catch {
            setLoadError(true);
          }
        })}
        onError={() => setLoadError(true)}
      />
    </>
  );

  const error = (!siteKey || loadError) && (
    <p role="alert" className="text-sm text-red-600">
      No se pudo cargar reCAPTCHA. Recarga la página e intenta nuevamente.
    </p>
  );

  return { ready, getToken, script, error };
}
