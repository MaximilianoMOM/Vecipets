'use client';

import Script from 'next/script';
import { useState } from 'react';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (key: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha(action: 'login' | 'register') {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function getToken() {
    if (!siteKey || !ready || !window.grecaptcha) {
      throw new Error('reCAPTCHA no está disponible');
    }

    return window.grecaptcha.execute(siteKey, { action });
  }

  const script = siteKey && (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
      onReady={() => window.grecaptcha?.ready(() => setReady(true))}
      onError={() => setLoadError(true)}
    />
  );

  const error = (!siteKey || loadError) && (
    <p role="alert" className="text-sm text-red-600">
      No se pudo cargar reCAPTCHA. Recarga la página e intenta nuevamente.
    </p>
  );

  return { ready, getToken, script, error };
}
