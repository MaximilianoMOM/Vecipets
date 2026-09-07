'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authAPI } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast('Por favor completa todos los campos del formulario.', 'advertencia');
      return;
    }

    setCargando(true);
    try {
      // Enviar password según LoginDto del backend de NestJS
      const res = await authAPI.login({ email, password: pass });
      
      const token = res.accessToken || res.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('vecipets_access_token', token);
      }

      if (res.usuario) {
        localStorage.setItem('vecipets_user', JSON.stringify(res.usuario));
      }

      mostrarToast(`¡Bienvenido de nuevo, ${res.usuario?.nombre || 'Usuario'}!`, 'exito');
      router.push('/perfil');
    } catch (err: any) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast(err.message || 'Error al iniciar sesión. Verifique sus credenciales.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div
        className={`w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 ${
          errorShake ? 'animate-shake border-rose-400' : ''
        }`}
      >
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-[#EEF2FC] rounded-2xl flex items-center justify-center text-2xl mx-auto border border-[#5E7BC4]/20">
            🔐
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Ingresa a tu cuenta de VeciPets para administrar tus reportes
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contraseña
              </label>
              <a href="recuperar-password" className="text-xs font-semibold text-[#5E7BC4] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            {cargando ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <span>Ingresar</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="text-[#5E7BC4] hover:underline font-bold">
            Regístrate aquí gratis
          </Link>
        </div>
      </div>
    </div>
  );
}