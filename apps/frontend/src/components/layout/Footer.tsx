'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
  const [emailBoletin, setEmailBoletin] = useState('');
  const { mostrarToast } = useToast();

  const manejarSuscripcion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBoletin || !emailBoletin.includes('@')) {
      mostrarToast('Por favor ingresa un correo electrónico válido.', 'advertencia');
      return;
    }
    mostrarToast('¡Gracias por suscribirte al boletín comunitario!', 'exito');
    setEmailBoletin('');
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-12 mt-auto border-t border-slate-800 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-10 right-10 text-9xl opacity-5 pointer-events-none select-none">🐾</div>
      <div className="absolute bottom-5 left-5 text-7xl opacity-5 pointer-events-none select-none">🐾</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* COLUMNA 1: INFO DE LA PLATAFORMA */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-vecipets.png"
                alt="VeciPets Logo"
                width={762}
                height={840}
                priority
                className="w-auto h-12 object-contain bg-transparent"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plataforma comunitaria dedicada a conectar personas para proteger, cuidar y encontrar animales perdidos o en adopción en tu ciudad.
            </p>
            <div className="flex gap-3 pt-2">
              {['Facebook', 'Instagram', 'Twitter'].map((red) => (
                <a
                  key={red}
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#5E7BC4] flex items-center justify-center text-xs font-bold transition-colors text-slate-300 hover:text-white"
                  aria-label={red}
                >
                  {red.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN RÁPIDA */}
          <div>
            <h3 className="text-base font-bold text-white mb-4">Navegación Rápida</h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-[#F3B26C] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/reportes" className="hover:text-[#F3B26C] transition-colors">
                  Buscar Mascotas Perdidas
                </Link>
              </li>
              <li>
                <Link href="/reportar" className="hover:text-[#F3B26C] transition-colors">
                  Publicar un Reporte
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="hover:text-[#F3B26C] transition-colors">
                  Explorador en Mapa
                </Link>
              </li>
              <li>
                <Link href="/refugios" className="hover:text-[#F3B26C] transition-colors">
                  Refugios y Veterinarias
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: SOPORTE Y COMUNIDAD */}
          <div>
            <h3 className="text-base font-bold text-white mb-4">Comunidad</h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <Link href="/moderacion" className="hover:text-[#F3B26C] transition-colors">
                  Centro de Moderación
                </Link>
              </li>
              <li>
                <a href="mailto:soporte@vecipets.org" className="hover:text-[#F3B26C] transition-colors">
                  Contacto y Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F3B26C] transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F3B26C] transition-colors">
                  Políticas de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: BOLETÍN INFORMATIVO */}
          <div>
            <h3 className="text-base font-bold text-white mb-4">Boletín Informativo</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Recibe en tu correo las alertas urgentes de mascotas perdidas en tu zona.
            </p>
            <form onSubmit={manejarSuscripcion} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={emailBoletin}
                onChange={(e) => setEmailBoletin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#5E7BC4] placeholder-slate-500"
              />
              <button
                type="submit"
                className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md"
              >
                Suscribirme a Alertas
              </button>
            </form>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 VeciPets. Desarrollado para la comunidad de mascotas.</p>
          <p className="flex items-center gap-1">
            <span>Hecho con</span>
            <span className="text-rose-500">❤️</span>
            <span>para perros y gatos</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
