'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const handleClose = () => setIsOpen(false);

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md w-full relative">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight">
                            VeciPets 🐾
                        </Link>
                    </div>

                    {/* Navegación principal completa */}
                    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs xl:text-sm font-medium">
                        <Link
                            href="/"
                            className={`px-2.5 py-2 rounded-lg transition ${isActive('/') ? 'bg-gray-100 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            Inicio
                        </Link>
                        <Link
                            href="/mapa"
                            className={`px-2.5 py-2 rounded-lg transition ${isActive('/mapa') ? 'bg-gray-100 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            Mapa Explorador
                        </Link>
                        <Link
                            href="/reportes"
                            className={`px-2.5 py-2 rounded-lg transition ${isActive('/reportes') ? 'bg-gray-100 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            Reportes
                        </Link>
                        <Link
                            href="/clinicas"
                            className={`px-2.5 py-2 rounded-lg transition flex items-center gap-1 ${isActive('/clinicas') ? 'bg-gray-100 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            <span>Clínicas y Vet.</span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded-full font-bold">Aliados</span>
                        </Link>
                        <Link
                            href="/jornadas"
                            className={`px-2.5 py-2 rounded-lg transition ${isActive('/jornadas') ? 'bg-gray-100 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            Jornadas
                        </Link>
                        <Link
                            href="/reportar"
                            className={`px-2.5 py-2 rounded-lg transition font-semibold ${isActive('/reportar') ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800'
                                }`}
                        >
                            Reportar Mascota
                        </Link>
                    </nav>

                    {/* Botones de Autenticación en escritorio */}
                    <div className="hidden lg:flex items-center space-x-2">
                        <Link
                            href="/auth/login"
                            className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition ${isActive('/auth/login')
                                ? 'bg-gray-200 text-gray-900 font-semibold shadow-inner'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                                }`}
                        >
                            Ingresar
                        </Link>
                        <Link
                            href="/auth/registro"
                            className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition shadow-sm ${isActive('/auth/registro')
                                ? 'bg-indigo-800 text-white font-semibold'
                                : 'text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            Regístrate
                        </Link>
                    </div>

                    {/* Sección visible en pantallas muy angostas */}
                    <div className="flex lg:hidden items-center space-x-2">
                        <Link
                            href="/auth/login"
                            className={`text-xs font-medium px-2 py-1.5 rounded-lg transition ${isActive('/auth/login') ? 'bg-gray-200 text-gray-900 font-semibold' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            Ingresar
                        </Link>

                        <Link
                            href="/auth/registro"
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shadow-sm ${isActive('/auth/registro') ? 'bg-indigo-800 text-white' : 'text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            Registrarse
                        </Link>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="p-1.5 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none"
                            aria-label="Abrir menú"
                        >
                            {isOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Menú desplegable hamburguesa */}
            {isOpen && (
                <div className="absolute right-4 top-20 w-72 bg-white rounded-xl border border-gray-100 shadow-2xl py-3 px-3 space-y-2 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-xs font-semibold text-gray-400 uppercase px-3 pb-1 border-b border-gray-100">
                        Menú de Navegación
                    </div>

                    <Link
                        href="/"
                        onClick={handleClose}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/') ? 'bg-gray-100 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                    >
                        🏠 Inicio
                    </Link>
                    <Link
                        href="/mapa"
                        onClick={handleClose}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/mapa') ? 'bg-gray-100 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                    >
                        🗺️ Mapa Explorador
                    </Link>
                    <Link
                        href="/reportes"
                        onClick={handleClose}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/reportes') ? 'bg-gray-100 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                    >
                        📋 Reportes
                    </Link>
                    <Link
                        href="/clinicas"
                        onClick={handleClose}
                        className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/clinicas') ? 'bg-gray-100 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                    >
                        <span>🏥 Clínicas y Veterinarias</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Aliados</span>
                    </Link>
                    <Link
                        href="/jornadas"
                        onClick={handleClose}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/jornadas') ? 'bg-gray-100 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                    >
                        🩺 Jornadas de Vacunación
                    </Link>
                    <Link
                        href="/reportar"
                        onClick={handleClose}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/reportar') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100'
                            }`}
                    >
                        🚨 Reportar Mascota
                    </Link>
                </div>
            )}
        </header>
    );
}