"use client";

import { useState } from "react";
import Link from "next/link";
import MascotaForm from "@/app/mascotas/components/mascota-form";
import MapaGeneral from "@/components/MapaGeneral";

export default function RegistrarMascotaPage() {
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<any>(null);
  const [puntos, setPuntos] = useState<any[]>([]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      
      {/* 1. Barra de Navegación Superior */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 text-white p-2 rounded-xl text-xl font-bold shadow-sm">🐾</div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">VeciPets</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/inicio" className="hover:text-orange-500 transition">Inicio</Link>
          <Link href="/mapa" className="text-orange-600 font-semibold flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">🗺️ Mapa</Link>
          <Link href="/reportes" className="hover:text-orange-500 transition">Reportes</Link>
          <Link href="/mis-mascotas" className="hover:text-orange-500 transition">Mis Mascotas</Link>
          <Link href="/perfil" className="hover:text-orange-500 transition">Perfil</Link>
        </nav>

        <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">María Gómez</p>
            <p className="text-xs text-slate-500">Ciudadano</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
            MG
          </div>
        </div>
      </header>

      {/* 2. Pantalla Dividida: Mapa real (Izquierda) + Formulario (Derecha) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full items-start">
        
        {/* COLUMNA IZQUIERDA: Componente MapaGeneral (5 columnas) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col h-[700px] lg:h-[calc(100vh-120px)] sticky top-20">
          
          <div className="mb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">Ubicación del Suceso</h2>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar dirección o lugar..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          {/* CONTENEDOR DEL MAPA GENERAL */}
          <div className="flex-1 rounded-2xl relative overflow-hidden border border-slate-200 flex flex-col">
            <MapaGeneral 
              puntos={puntos}
              elementoSeleccionado={puntoSeleccionado}
              onSelectPunto={(punto: any) => setPuntoSeleccionado(punto)}
            />
          </div>

          {/* Tarjeta de guía interactiva inferior */}
          <div className="mt-3 bg-orange-50 border border-orange-100 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2.5 rounded-xl text-base shadow-sm">📍</div>
            <div>
              <p className="text-xs font-bold text-orange-900">Haz clic en el mapa</p>
              <p className="text-[11px] text-orange-700/80">para fijar el punto exacto donde se perdió o encontró la mascota.</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario de Registro (7 columnas) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registrar Reporte de Mascota</h1>
            <p className="text-sm text-slate-500 mt-1">Completa los datos para alertar a la comunidad y refugios cercanos de forma inmediata.</p>
          </div>

          <MascotaForm />

        </div>

      </div>

    </main>
  );
}