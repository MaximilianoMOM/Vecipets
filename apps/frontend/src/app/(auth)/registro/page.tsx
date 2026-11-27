
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '@/lib/api-client';
import { GoogleAuthButton } from '../google-auth-button';
import { useRecaptcha } from '../use-recaptcha';
import { useState } from 'react';
import axios from 'axios';

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
  const recaptcha = useRecaptcha('register');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: yupResolver(schema),
    defaultValues: {
      rol: 'CIUDADANO',
    },
  });
  const rol = watch('rol');

  const onSubmit = async (data: RegisterData) => {
    setApiError(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await recaptcha.getToken();
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
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-200 p-4">
      {recaptcha.script}
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
              <option value="VETERINARIA">Veterinaria o clínica</option>
            </select>
            {errors.rol && (
              <p className="mt-1 text-sm text-red-600">
                {errors.rol.message}
              </p>
            )}
          </div>

          {(rol === 'REFUGIO' || rol === 'VETERINARIA') && (
            <p role="status" className="rounded bg-primary-50 p-3 text-sm text-primary-900">
              Verifica tu correo y espera a que VeciPets apruebe tu solicitud. Una vez aprobada, podrás iniciar sesión y publicar.
            </p>
          )}

          {apiError && (
            <p className="text-center text-sm text-red-600">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !recaptcha.ready}
            className="w-full rounded bg-primary py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
          {recaptcha.error}
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
