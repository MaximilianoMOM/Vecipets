
'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const schema = yup.object({
  correo: yup
    .string()
    .email('Correo no válido')
    .required('El correo es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
}).required();

type LoginData = yup.InferType<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    setApiError(null);

    try {
      await apiClient.post('/usuarios/login', data);
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setApiError('Credenciales incorrectas.');
      } else if (err.response?.status === 403) {
        setApiError(
          err.response?.data?.message ||
            'Tu cuenta todavía no está habilitada.',
        );
      } else {
        setApiError(
          err.response?.data?.message ||
            'Error inesperado. Por favor, intenta de nuevo.',
        );
      }
    }
  };

  const iniciarGoogle = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    window.location.assign(
      `${apiUrl.replace(/\/+$/, '')}/api/v1/auth/google`,
    );
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              autoComplete="email"
              {...register('correo')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {errors.correo && (
              <p className="mt-1 text-sm text-red-600">
                {errors.correo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <a
              href="/recuperar-contrasena"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {apiError && (
            <p className="text-center text-sm text-red-600">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-indigo-600 py-2 font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-500">
              O continúa con
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={iniciarGoogle}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Continuar con Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <a
            href="/registro"
            className="font-medium text-indigo-600 hover:underline"
          >
            Regístrate
          </a>
        </p>
      </div>
    </section>
  );
}
