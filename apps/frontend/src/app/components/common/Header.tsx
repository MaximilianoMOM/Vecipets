'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Definición local del tipo Usuario para evitar errores de importación
interface Usuario {
  nombre?: string;
  email?: string;
  rol?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    // Verificamos si hay un usuario guardado en el almacenamiento local
    const verificarSesion = () => {
      try {
        const usuarioGuardado = localStorage.getItem('vecipets_user');
        const token = localStorage.getItem('token') || localStorage.getItem('vecipets_access_token');
        
        if (token && usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        } else {
          setUsuario(null);
        }
      } catch (err) {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, [pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vecipets_access_token');
    localStorage.removeItem('vecipets_user');
    setUsuario(null);
    setDropdownAbierto(false);
    router.push('/');
  };

  const esAdmin = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'ADMIN';

  // Enlaces de navegación de VeciPets
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-2.5 group py-1">
          {/* Reemplaza temporalmente el <Image /> por esto si el archivo da problemas */}
<img
    src="/logo-vecipet.png"
    alt="Logo VeciPets"
    className="w-10 h-10 object-contain"
/>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight">
            VeciPets
          </span>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden lg:flex items-center gap-1">
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

        {/* ACCIONES Y PERFIL */}
        <div className="hidden lg:flex items-center gap-3">
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
                <div className="relative">
                  <button
                    onClick={() => setDropdownAbierto(!dropdownAbierto)}
                    className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate leading-tight">
                        {usuario.nombre || 'Mi Perfil'}
                      </span>
                      {usuario.rol && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {usuario.rol}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">▼</span>
                  </button>

                  {dropdownAbierto && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Conectado como</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{usuario.email || 'Usuario'}</p>
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
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/reportar"
            className="bg-amber-400 text-slate-900 text-xs font-bold py-2 px-3 rounded-lg shadow-sm"
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
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuMovilAbierto(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-600'
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
                  👤 Mi Perfil ({usuario.nombre || 'Usuario'})
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