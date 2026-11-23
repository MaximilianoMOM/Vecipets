
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';

export default function VerificarCorreoPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const correoURL = parametros.get('correo');

    if (correoURL) {
      setCorreo(correoURL);
    }
  }, []);

  const verificar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!/^\d{6}$/.test(codigo)) {
      setError('El código debe tener exactamente 6 números.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await apiClient.post(
        '/usuarios/verificar-correo',
        {
          correo: correo.trim().toLowerCase(),
          codigo,
        },
      );

      setMensaje(
        respuesta.data?.mensaje || 'Correo verificado correctamente.',
      );

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        setError(
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(', ')
              : 'No se pudo verificar el código.',
        );
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white/90 p-8 shadow-lg">
        <h1 className="mb-3 text-center text-2xl font-bold text-gray-800">
          Verificar correo
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.
          Recuerda que vence en 5 minutos.
        </p>

        <form onSubmit={verificar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código de verificación
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              required
              placeholder="000000"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-center text-xl tracking-widest"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          {mensaje && (
            <p className="text-center text-sm text-green-600">{mensaje}</p>
          )}

          <button
            type="submit"
            disabled={cargando || mensaje !== ''}
            className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {cargando ? 'Verificando...' : 'Verificar correo'}
          </button>
        </form>
      </div>
    </section>
  );
}
