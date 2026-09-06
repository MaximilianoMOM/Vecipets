'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authAPI, Usuario } from '@/lib/api-client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('vecipets_access_token');
      if (token) {
        try {
          const datosUsuario = await authAPI.getPerfil();
          setUsuario(datosUsuario);
        } catch (err) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('vecipets_access_token');
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    };

    verificarSesion();
  }, [pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vecipets_access_token');
    localStorage.removeItem('vecipets_user');
    setUsuario(null);
    setDropdownAbierto(false);
    mostrarToast('Sesión cerrada correctamente', 'info');
    router.push('/');
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Mapa Explorador', href: '/mapa' },
    { name: 'Reportes', href: '/reportes' },
    { name: 'Refugios y Clínicas', href: '/refugios' },
    { name: 'Moderación', href: '/moderacion' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center group py-1">
          <Image
            src="/logo-vecipets.png"
            alt="VeciPets Logo"
            width={762}
            height={840}
            priority
            className="w-auto h-12 sm:h-14 object-contain bg-transparent group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const activo = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activo
                    ? 'bg-[#EEF2FC] text-[#5E7BC4]'
                    : 'text-[#53627A] hover:text-[#292A2F] hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* ACCIONES Y PERFIL */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/reportar"
            className="bg-[#F3B26C] hover:bg-[#e29e54] text-slate-900 text-sm font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
          >
            <span>✨</span>
            <span>+ Reportar Mascota</span>
          </Link>

          {!cargando && (
            <>
              {usuario ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownAbierto(!dropdownAbierto)}
                    className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 py-2 px-3.5 rounded-xl border border-slate-200 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5E7BC4] text-white flex items-center justify-center font-bold text-sm">
                      {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 max-w-[100px] truncate">
                      {usuario.nombre || 'Mi Perfil'}
                    </span>
                    <span className="text-xs text-slate-400">▼</span>
                  </button>

                  {dropdownAbierto && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Conectado como</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{usuario.email}</p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setDropdownAbierto(false)}
                        className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        👤 Mi Perfil y Mis Reportes
                      </Link>
                      <button
                        onClick={cerrarSesion}
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-[#53627A] hover:text-[#292A2F] px-3 py-2 rounded-xl transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/reportar"
            className="bg-[#F3B26C] text-slate-900 text-xs font-bold py-2 px-3 rounded-lg shadow-sm"
          >
            + Reportar
          </Link>
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Abrir menú"
          >
            <span className="text-2xl">{menuMovilAbierto ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-slide-down">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuMovilAbierto(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === link.href
                    ? 'bg-[#EEF2FC] text-[#5E7BC4]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {usuario ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="w-full text-center bg-slate-100 text-slate-800 font-semibold py-2.5 rounded-xl text-sm"
                >
                  👤 Mi Perfil ({usuario.nombre})
                </Link>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    cerrarSesion();
                  }}
                  className="w-full text-center bg-rose-50 text-rose-600 font-semibold py-2.5 rounded-xl text-sm"
                >
                  🚪 Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex-1 text-center bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex-1 text-center bg-[#5E7BC4] text-white font-semibold py-2.5 rounded-xl text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
