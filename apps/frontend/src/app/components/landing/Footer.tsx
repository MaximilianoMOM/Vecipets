'use client';

import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 mb-8 text-xs">
                <div>
                    <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                        🐾 VeciPets
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Plataforma comunitaria orientada a conectar a vecinos, refugios y clínicas veterinarias para la localización rápida de mascotas perdidas.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-3">Navegación</h4>
                    <ul className="space-y-2">
                        <li><a href="#inicio" className="hover:text-white">Inicio</a></li>
                        <li><a href="#mapa" className="hover:text-white">Mapa Explorador</a></li>
                        <li><a href="#reportes" className="hover:text-white">Reportes Recientes</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-3">Comunidad</h4>
                    <ul className="space-y-2">
                        <li><a href="#refugios" className="hover:text-white">Refugios y Clínicas</a></li>
                        <li><a href="#moderacion" className="hover:text-white">Panel de Moderación</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-3">Legales</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-white">Términos y Condiciones</a></li>
                        <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} VeciPets. Todos los derechos reservados.
            </div>
        </footer>
    );
}