'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">

                {/* Columna 1: Logo y Descripción */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-white font-extrabold text-xl">
                        <span className="text-2xl">🐶</span> VeciPets
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                        Plataforma comunitaria dedicada a conectar personas para proteger, cuidar y encontrar animales perdidos o en adopción en tu ciudad.
                    </p>
                    {/* Redes Sociales con SVG limpios */}
                    <div className="flex items-center gap-3 pt-2">
                        {/* Facebook */}
                        <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        {/* Twitter / X */}
                        <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Columna 2: Navegación Rápida */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-sm tracking-wider uppercase">Navegación Rápida</h4>
                    <ul className="space-y-2.5 text-sm text-slate-400">
                        <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                        <li><Link href="/reportes" className="hover:text-white transition">Buscar Mascotas Perdidas</Link></li>
                        <li><Link href="/reportar" className="hover:text-white transition">Publicar un Reporte</Link></li>
                        <li><Link href="/mapa" className="hover:text-white transition">Explorador en Mapa</Link></li>
                        <li><Link href="/clinicas" className="hover:text-white transition">Refugios y Veterinarias</Link></li>
                    </ul>
                </div>

                {/* Columna 3: Comunidad */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-sm tracking-wider uppercase">Comunidad</h4>
                    <ul className="space-y-2.5 text-sm text-slate-400">
                        <li><Link href="/moderacion" className="hover:text-white transition">Centro de Moderación</Link></li>
                        <li><Link href="/contacto" className="hover:text-white transition">Contacto y Ayuda</Link></li>
                        <li><Link href="/terminos" className="hover:text-white transition">Términos y Condiciones</Link></li>
                        <li><Link href="/privacidad" className="hover:text-white transition">Políticas de Privacidad</Link></li>
                    </ul>
                </div>

                {/* Columna 4: Boletín Informativo */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-sm tracking-wider uppercase">Boletín Informativo</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Recibe en tu correo las alertas urgentes de mascotas perdidas en tu zona.
                    </p>
                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="tu-correo@ejemplo.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                        <button
                            onClick={() => alert("¡Te has suscripto exitosamente al boletín de alertas!")}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                            Suscribirme a Alertas
                        </button>
                    </div>
                </div>

            </div>

            {/* Copyright inferior */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <p>© {new Date().getFullYear()} VeciPets. Desarrollado para la comunidad de mascotas.</p>
                <p className="flex items-center gap-1">
                    Hecho con <Heart size={14} className="text-rose-500 fill-rose-500" /> para perros y gatos
                </p>
            </div>
        </footer>
    );
}