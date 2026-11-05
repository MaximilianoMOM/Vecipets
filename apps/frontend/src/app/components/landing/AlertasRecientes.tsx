'use client';

import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

export default function AlertasRecientes() {
    return (
        <section id="reportes" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Alertas Recientes</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Mascotas que necesitan ayuda urgente</h2>
                    </div>
                    <a href="#todos" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 md:mt-0">
                        Ver todos los reportes <ChevronRight size={16} />
                    </a>
                </div>

                {/* BACKEND: Mapear desde GET /api/v1/reportes/urgentes */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Tarjeta 1 */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-48">
                            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" alt="Max" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">PERDIDA</span>
                                <span className="bg-slate-900/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">🐶 PERRO</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Max</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin size={12} className="text-slate-400" /> Zona Norte, Calle 45
                                </p>
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                    Se extravió cerca a la estación principal. Lleva collar azul.
                                </p>
                            </div>
                            <button className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                                Ver Información y Contacto
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-48">
                            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600" alt="Luna" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">ENCONTRADO</span>
                                <span className="bg-slate-900/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">🐱 GATO</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Luna</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin size={12} className="text-slate-400" /> Zona Poniente
                                </p>
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                    Encontrada resguardada bajo un comercial. Es muy confianzuda.
                                </p>
                            </div>
                            <button className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                                Ver Información y Contacto
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-48">
                            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600" alt="Kira" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">PERDIDA</span>
                                <span className="bg-slate-900/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">🐶 PERRO</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Kira</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin size={12} className="text-slate-400" /> Mezquida, Segovia
                                </p>
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                    Busca atención, se perdió cerca del parque central.
                                </p>
                            </div>
                            <button className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                                Ver Información y Contacto
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}