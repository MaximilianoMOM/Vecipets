
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';

export default function RestablecerContrasenaPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    setCorreo(parametros.get('correo') || '');
  }, []);

  const restablecer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!/^\d{6}$/.test(codigo)) {
      setError('El código debe tener exactamente 6 números.');
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (nuevaContrasena.length > 72) {
      setError('La contraseña no puede superar 72 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await apiClient.post(
        '/usuarios/restablecer-contrasena',
        {
          correo: correo.trim().toLowerCase(),
          codigo,
          nuevaContrasena,
        },
      );

      setMensaje(
        respuesta.data?.mensaje ||
          'Tu contraseña fue restablecida correctamente.',
      );

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const message = data?.message;

        setError(
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(', ')
              : 'No se pudo restablecer la contraseña.',
        );
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-200 p-4">
      <div className="w-full max-w-md rounded-xl bg-white/90 p-8 shadow-lg">
        <h1 className="mb-3 text-center text-2xl font-bold text-gray-800">
          Cambiar contraseña
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Ingresa el código que recibiste y crea una contraseña nueva.
          El código vence en 5 minutos.
        </p>

        <form onSubmit={restablecer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código de recuperación
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="000000"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-center text-xl tracking-widest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>

            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>

            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
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
            disabled={cargando || mensaje !== ''}
            className="w-full rounded bg-primary py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {cargando ? 'Restableciendo...' : 'Cambiar contraseña'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-primary hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </section>
  );
}