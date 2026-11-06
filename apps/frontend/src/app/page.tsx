'use client';

import React from 'react';
import HeroSection from './components/landing/HeroSection';
import AlertasRecientes from './components/landing/AlertasRecientes';
import ComoFunciona from './components/landing/ComoFunciona';
import MapaSeccion from './components/landing/MapaSeccion';
import SeccionFinalAyuda from './components/landing/SeccionFinalAyuda';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                <HeroSection />
                <AlertasRecientes />
                <ComoFunciona />
                <MapaSeccion />
                <SeccionFinalAyuda /> {/* <-- Ubicado justo después del mapa como pediste */}
            </main>
        </div>
    );
}