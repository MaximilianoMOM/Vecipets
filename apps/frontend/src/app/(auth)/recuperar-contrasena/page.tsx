
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const solicitarCodigo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);

    const correoNormalizado = correo.trim().toLowerCase();

    try {
      const respuesta = await apiClient.post(
        '/usuarios/solicitar-recuperacion',
        { correo: correoNormalizado },
      );

      setMensaje(
        respuesta.data?.mensaje ||
          'Si el correo está registrado y verificado, recibirás instrucciones.',
      );

      // Continuar a la pantalla del código.
      router.push(
        `/restablecer-contrasena?correo=${encodeURIComponent(correoNormalizado)}`,
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const message = data?.message;

        setError(
          typeof message === 'string'
            ? message
            : 'No se pudo procesar la solicitud. Intenta nuevamente.',
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
          Recuperar contraseña
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Ingresa el correo asociado a tu cuenta. Te enviaremos un código
          para restablecer tu contraseña.
        </p>

        <form onSubmit={solicitarCodigo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              autoComplete="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          {mensaje && (
            <p className="text-center text-sm text-green-700">{mensaje}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {cargando ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-indigo-600 hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </section>
  );
}