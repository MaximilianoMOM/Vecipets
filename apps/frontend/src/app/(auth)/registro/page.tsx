import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

type RegisterData = {
  email: string;
  password: string;
  name: string;
  lastname: string;
};

const schema = yup.object({
  email: yup.string().email('Correo no válido').required('El correo es obligatorio'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
  name: yup.string().required('Nombre obligatorio'),
  lastname: yup.string().required('Apellido obligatorio'),
});

export default function RegistroPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: RegisterData) => {
    setApiError(null);
    try {
      await apiClient.post('/auth/register', data);
      router.push(`/auth/verificar?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setApiError('Datos incompletos o formato incorrecto.');
      } else if (err.response?.status === 409) {
        setApiError('El correo ya está registrado.');
      } else {
        setApiError('Error inesperado. Por favor, intente de nuevo.');
      }
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" {...register('email')} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" {...register('password')} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" {...register('name')} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido</label>
            <input type="text" {...register('lastname')} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.lastname && <p className="mt-1 text-sm text-red-600">{errors.lastname.message}</p>}
          </div>
          {apiError && <p className="text-center text-sm text-red-600">{apiError}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </section>
  );
}
