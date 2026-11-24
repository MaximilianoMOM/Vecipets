'use client';

import { API_BASE_URL } from '@/lib/api-client';

export function GoogleAuthButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.assign(`${API_BASE_URL}/auth/google`)}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
    >
      Continuar con Google
    </button>
  );
}
