'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

interface Usuario {
  nombre?: string;
  email?: string;
  rol?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    const verificarSesion = () => {
      try {
        const usuarioGuardado = localStorage.getItem('vecipets_user');
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('vecipets_access_token');

        if (token && usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        } else {
          setUsuario(null);
        }
      } catch {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
    setMenuMovilAbierto(false);
    setDropdownAbierto(false);
  }, [pathname]);

  useEffect(() => {
    const manejarClicAfuera = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownAbierto(false);
      }
    };

    if (dropdownAbierto) {
      document.addEventListener('mousedown', manejarClicAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', manejarClicAfuera);
    };
  }, [dropdownAbierto]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vecipets_access_token');
    localStorage.removeItem('vecipets_user');
    setUsuario(null);
    setDropdownAbierto(false);
    setMenuMovilAbierto(false);
    router.push('/');
  };

  const esAdmin =
    usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'ADMIN';

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Mapa Explorador', href: '/mapa' },
    { name: 'Reportes', href: '/reportes' },
    { name: 'Clínicas y Vet.', href: '/clinicas' },
    { name: 'Jornadas', href: '/jornadas' },
    ...(esAdmin ? [{ name: 'Moderación', href: '/admin' }] : []),
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* LOGO & BRAND */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group py-1 shrink-0"
        >
          <Image
            src="/logo-vecipets.png"
            alt="Logo VeciPets"
            width={44}
            height={44}
            priority
            unoptimized
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight">
            VeciPets
          </span>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const activo = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activo
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* ACCIONES Y PERFIL (DESKTOP) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/reportar"
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 transform active:scale-95"
          >
            <span>🚨</span>
            <span>Reportar Mascota</span>
          </Link>

          {!cargando && (
            <>
              {usuario ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownAbierto((prev) => !prev)}
                    aria-expanded={dropdownAbierto}
                    className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {usuario.nombre
                        ? usuario.nombre.charAt(0).toUpperCase()
                        : '👤'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate leading-tight">
                        {usuario.nombre || 'Mi Perfil'}
                      </span>
                      {usuario.rol && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {usuario.rol}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {dropdownAbierto ? '▲' : '▼'}
                    </span>
                  </button>

                  {dropdownAbierto && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">
                          Conectado como
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {usuario.email || 'Usuario'}
                        </p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setDropdownAbierto(false)}
                        className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        👤 Mi Perfil y Mis Reportes
                      </Link>
                      {esAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownAbierto(false)}
                          className="block px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          🛡️ Panel de Moderación
                        </Link>
                      )}
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
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
                    className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition-all"
                  >
                    Regístrate
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <Link
            href="/reportar"
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold py-2 px-3 rounded-lg shadow-sm"
          >
            + Reportar
          </Link>
          <button
            type="button"
            onClick={() => setMenuMovilAbierto((prev) => !prev)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuMovilAbierto}
          >
            <span className="text-2xl leading-none">
              {menuMovilAbierto ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuMovilAbierto && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-md">
          <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const activo = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuMovilAbierto(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activo
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {usuario ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="w-full text-center bg-slate-100 text-slate-800 font-semibold py-2.5 rounded-xl text-sm"
                >
                  👤 Mi Perfil ({usuario.nombre || 'Usuario'})
                </Link>
                {esAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuMovilAbierto(false)}
                    className="w-full text-center bg-purple-50 text-purple-700 font-semibold py-2.5 rounded-xl text-sm"
                  >
                    🛡️ Panel de Moderación
                  </Link>
                )}
                <button
                  type="button"
                  onClick={cerrarSesion}
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
                  className="flex-1 text-center bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm"
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