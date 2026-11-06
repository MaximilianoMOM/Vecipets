'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, PlusCircle, MapPin, Tag } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative w-full bg-slate-50/50 py-12 md:py-20 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* COLUMNA IZQUIERDA: TEXTOS Y BOTONES */}
                <div className="lg:col-span-7 space-y-6 text-left">

                    {/* Badge superior */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold tracking-wide">
                        <span className="text-base">🐾</span> RED COMUNITARIA DE RESCATE Y ALERTA
                    </div>

                    {/* Título Principal */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                        Ayudamos a reunir <br className="hidden sm:inline" />
                        <span className="text-indigo-600">familias con sus mascotas</span>
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-slate-600 text-base md:text-lg max-w-xl font-normal leading-relaxed">
                        Si tu peludo se ha extraviado o encontraste un animal sin hogar en la calle, conéctate con la red vecinal más grande para su pronto regreso a casa.
                    </p>

                    {/* Botones de Acción Principal */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">

                        {/* Botón 1: Redirige a Formulario de Reporte */}
                        <Link
                            href="/reportar"
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-95"
                        >
                            <PlusCircle className="w-5 h-5 text-slate-900" />
                            <span>Reportar Mascota Perdida</span>
                        </Link>

                        {/* Botón 2: Redirige al Feed Global de Reportes */}
                        <Link
                            href="/reportes"
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-sm rounded-2xl border border-indigo-200 shadow-sm hover:shadow transition-all duration-200 transform active:scale-95"
                        >
                            <Search className="w-5 h-5 text-indigo-600" />
                            <span>Buscar Mascotas</span>
                        </Link>

                    </div>

                    {/* Métricas rápidas en la parte inferior */}
                    <div className="pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-md">
                        <div>
                            <p className="text-2xl md:text-3xl font-black text-indigo-600">1,240+</p>
                            <p className="text-xs font-medium text-slate-500">Reuniones Exitosas</p>
                        </div>
                        <div>
                            <p className="text-2xl md:text-3xl font-black text-amber-500">480+</p>
                            <p className="text-xs font-medium text-slate-500">Reportes Activos</p>
                        </div>
                        <div>
                            <p className="text-2xl md:text-3xl font-black text-emerald-600">85+</p>
                            <p className="text-xs font-medium text-slate-500">Refugios Aliados</p>
                        </div>
                    </div>

                </div>

                {/* COLUMNA DERECHA: TARJETA INTERACTIVA CON ANIMACIÓN FLOTANTE */}
                <div className="lg:col-span-5 flex justify-center">

                    {/* El enlace redirige a la vista general de /reportes */}
                    <Link
                        href="/reportes"
                        className="group relative w-full max-w-sm bg-white rounded-3xl p-4 shadow-xl border border-slate-100 transition-all duration-500 ease-out transform hover:-translate-y-3 hover:shadow-2xl animate-bounce-slow"
                    >
                        {/* Contenedor de la Imagen */}
                        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100">

                            {/* Badge de Estado Urgente */}
                            <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <span>🚨 URGENTE - PERDIDO</span>
                            </div>

                            {/* Imagen principal (con efecto zoom sutil en hover) */}
                            <img
                                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"
                                alt="Bruno (Beagle)"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Información del caso */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    Bruno <span className="text-slate-500 font-normal text-sm">(Beagle)</span>
                                </h3>
                                <span className="text-xs font-medium text-slate-400">Hace 2h</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>Visto por última vez en Parque Central</span>
                            </div>

                            {/* Footer de la tarjeta con Recompensa y Ver más */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-amber-200/60">
                                    <Tag className="w-3 h-3" /> Recompensa
                                </span>

                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Ver caso completo <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    </Link>

                </div>

            </div>
        </section>
    );
}