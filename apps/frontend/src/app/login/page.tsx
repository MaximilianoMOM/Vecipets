'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authAPI } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 relative overflow-hidden">
      
      {/* CÍRCULOS DECORATIVOS DE FONDO */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#F3B26C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#5E7BC4]/15 rounded-full blur-3xl pointer-events-none" />

      {/* TARJETA DE INICIO DE SESIÓN */}
      <div
        className={`w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 relative z-10 transition-all duration-300 ${
          errorShake ? 'animate-shake border-rose-400' : ''
        }`}
      >
        
        {/* LOGO OFICIAL DE VECIPETS */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-3 hover:scale-105 transition-transform">
            <Image
              src="/logo-vecipets.png"
              alt="VeciPets Logo"
              width={762}
              height={840}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Ingresa a la plataforma comunitaria para administrar tus reportes
            </p>
          </div>
        </div>

        {/* FORMULARIO DE INICIO DE SESIÓN */}
        <form onSubmit={manejarSubmit} className="space-y-5">
          
          {/* CORREO ELECTRÓNICO */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white focus:ring-3 focus:ring-[#5E7BC4]/10 transition-all font-medium text-slate-800"
                required
              />
              <span className="absolute left-4 top-3.5 text-base text-slate-400 pointer-events-none">
                📧
              </span>
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contraseña
              </label>
              <Link href="/recuperar-password" className="text-xs font-bold text-[#5E7BC4] hover:underline transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white focus:ring-3 focus:ring-[#5E7BC4]/10 transition-all font-medium text-slate-800"
                required
              />
              <span className="absolute left-4 top-3.5 text-base text-slate-400 pointer-events-none">
                🔒
              </span>

              {/* BOTÓN OJO DE REVELAR CONTRASEÑA */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-2.5 p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-all text-sm"
                title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* BOTÓN INGRESAR */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-extrabold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer mt-2"
          >
            {cargando ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <span>Ingresar a VeciPets</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </form>

        {/* PIE DE TARJETA */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="text-[#5E7BC4] hover:underline font-bold transition-colors">
            Regístrate aquí gratis
          </Link>
        </div>
      </div>
    </div>
  );
}