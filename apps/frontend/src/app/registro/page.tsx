'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authAPI } from '@/lib/api-client';

export default function RegistroPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [rol, setRol] = useState('CIUDADANO');
  const [cargando, setCargando] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreCompleto || !email || !pass || !telefono) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast('Por favor completa todos los campos requeridos.', 'advertencia');
      return;
    }

    if (pass.length < 8) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast('La contraseña debe tener al menos 8 caracteres.', 'advertencia');
      return;
    }

    if (pass !== confirmPass) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setCargando(true);
    try {
      // Coincide con RegisterDto de NestJS: { nombreCompleto, email, password, telefono, rol }
      const res = await authAPI.register({
        nombreCompleto,
        email,
        password: pass,
        telefono,
        rol,
      });

      const token = res.accessToken || res.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('vecipets_access_token', token);
      }

      const userData = res.usuario || res.user;
      if (userData) {
        localStorage.setItem(
          'vecipets_user',
          JSON.stringify({
            id: userData.id,
            nombre: ('nombreCompleto' in userData ? userData.nombreCompleto : (userData as any).nombre) || nombreCompleto,
            email: userData.email,
            telefono,
            rol,
          })
        );
      }

      mostrarToast('¡Cuenta creada exitosamente! Bienvenido a la comunidad VeciPets.', 'exito');
      router.push('/perfil');
    } catch (err: any) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      mostrarToast(err.message || 'Error al crear la cuenta. Inténtalo con otro correo.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div
        className={`w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-slate-100 ${
          errorShake ? 'animate-shake border-rose-400' : ''
        }`}
      >
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-[#EEF2FC] rounded-2xl flex items-center justify-center text-2xl mx-auto border border-[#5E7BC4]/20">
            🐾
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Crear Cuenta Comunitaria
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Únete a la red de vecinos para reportar y ayudar a mascotas en tu zona
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej. Ana María Pérez"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Usuario *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#5E7BC4]"
            >
              <option value="CIUDADANO">👤 Ciudadano / Vecino</option>
              <option value="REFUGIO">🏠 Refugio de Animales</option>
              <option value="VETERINARIA">🏥 Clínica Veterinaria</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña (mín. 8 caracteres) *
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-4"
          >
            {cargando ? (
              <span>Creando cuenta en backend...</span>
            ) : (
              <span>Completar Registro ✨</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
          ¿Ya posees una cuenta registrada?{' '}
          <Link href="/login" className="text-[#5E7BC4] hover:underline font-bold">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}