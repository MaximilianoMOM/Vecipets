
'use client';

import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '@/lib/api-client';
import { GoogleAuthButton } from '../google-auth-button';
import { useState } from 'react';
import axios from 'axios';

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

type RegisterData = {
  email: string;
  password: string;
  name: string;
  lastname: string;
  rol: 'CIUDADANO' | 'REFUGIO' | 'VETERINARIA';
};

const schema = yup.object({
  email: yup
    .string()
    .email('Correo no válido')
    .required('El correo es obligatorio'),

  password: yup
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(72, 'La contraseña es demasiado larga')
    .required('La contraseña es obligatoria'),

  name: yup.string().required('El nombre es obligatorio'),
  lastname: yup.string().required('El apellido es obligatorio'),

  rol: yup
    .mixed<'CIUDADANO' | 'REFUGIO' | 'VETERINARIA'>()
    .oneOf(['CIUDADANO', 'REFUGIO', 'VETERINARIA'])
    .required('Selecciona un tipo de cuenta'),
});

export default function RegistroPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaLoadError, setRecaptchaLoadError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: yupResolver(schema),
    defaultValues: {
      rol: 'CIUDADANO',
    },
  });

  const onSubmit = async (data: RegisterData) => {
    setApiError(null);

    if (!recaptchaSiteKey || !recaptchaReady || !window.grecaptcha) return;

    let recaptchaToken: string;
    try {
      recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
        action: 'register',
      });
    } catch {
      setApiError('No se pudo completar reCAPTCHA. Intenta nuevamente.');
      return;
    }

    try {
      const nombreCompleto =
        `${data.name.trim()} ${data.lastname.trim()}`.trim();

      await apiClient.post('/usuarios', {
        nombre: nombreCompleto,
        correo: data.email.trim().toLowerCase(),
        password: data.password,
        rol: data.rol,
        recaptchaToken,
      });

      router.push(
        `/verificar-correo?correo=${encodeURIComponent(
          data.email.trim().toLowerCase(),
        )}`,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 400) {
          setApiError(
            'Revisa los datos. Verifica que la contraseña tenga mínimo 8 caracteres.',
          );
        } else if (status === 409) {
          setApiError('Este correo ya está registrado.');
        } else {
          const message = error.response?.data?.message;
          setApiError(
            typeof message === 'string'
              ? message
              : 'No se pudo completar el registro. Intenta nuevamente.',
          );
        }
      } else {
        setApiError('Ocurrió un error inesperado.');
      }
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`}
          onReady={() => window.grecaptcha?.ready(() => setRecaptchaReady(true))}
          onError={() => setRecaptchaLoadError(true)}
        />
      )}
      <div className="w-full max-w-md rounded-xl bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Crear cuenta
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Regístrate en VeciPets
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              {...register('lastname')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.lastname && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastname.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de cuenta
            </label>
            <select
              {...register('rol')}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2"
            >
              <option value="CIUDADANO">Ciudadano</option>
              <option value="REFUGIO">Refugio</option>
              <option value="VETERINARIA">Veterinaria</option>
            </select>
            {errors.rol && (
              <p className="mt-1 text-sm text-red-600">
                {errors.rol.message}
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-center text-sm text-red-600">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !recaptchaReady}
            className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
          {(!recaptchaSiteKey || recaptchaLoadError) && (
            <p role="alert" className="text-sm text-red-600">
              No se pudo cargar reCAPTCHA. Recarga la página e intenta nuevamente.
            </p>
          )}
        </form>
        <div className="mt-4">
          <GoogleAuthButton />
          <p className="mt-2 text-center text-sm text-gray-600">
            Disponible para cuentas de ciudadano.
          </p>
        </div>
      </div>
    </section>
  );
}
