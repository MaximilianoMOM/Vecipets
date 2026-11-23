'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapItem } from './MapClient';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <p className="text-gray-400 font-medium animate-pulse">Cargando mapa interactivo del Valle de Aburrá...</p>
    </div>
  ),
});

export default function MapaPage() {
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  const [items] = useState<MapItem[]>([
    { id: '1', name: 'Bruno (Golden Retriever)', category: 'perro', status: 'PERDIDO', locationName: 'El Poblado, Medellín', lat: 6.2088, lng: -75.5673 },
    { id: '2', name: 'Luna (Gata Siamesa)', category: 'gato', status: 'HALLAZGO', locationName: 'Laureles, Medellín', lat: 6.2476, lng: -75.5908 },
    { id: '3', name: 'Max (Bulldog Francés)', category: 'perro', status: 'PERDIDO', locationName: 'Parque Principal, Envigado', lat: 6.1684, lng: -75.5857 },
    { id: '4', name: 'Clínica Veterinaria Las Vegas', category: 'veterinaria', locationName: 'Avenida Las Vegas, Itagüí', lat: 6.1841, lng: -75.6025 },
    { id: '5', name: 'Refugio Animal La Perla', category: 'refugio', locationName: 'Altavista, Medellín', lat: 6.2150, lng: -75.6500 },
    { id: '6', name: 'Hospital Veterinario Small Paws', category: 'veterinaria', locationName: 'Sabaneta', lat: 6.1517, lng: -75.6155 },
  ]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = 
      filterCategory === 'todos' ||
      (filterCategory === 'perro' && item.category === 'perro') ||
      (filterCategory === 'gato' && item.category === 'gato') ||
      (filterCategory === 'veterinaria' && item.category === 'veterinaria') ||
      (filterCategory === 'refugio' && item.category === 'refugio');

    const matchesStatus = 
      filterStatus === 'todos' || 
      item.status === filterStatus;

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-gray-50">
      {/* Columna Izquierda: Filtros, Buscador y Listado */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🗺️ Explorador en Vivo
            </h1>
            <p className="text-sm text-gray-500 mt-1">{filteredItems.length} publicaciones con ubicación registrada</p>

            {/* Pestañas de Especie */}
            <div className="grid grid-cols-3 gap-1.5 mt-4 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'todos', label: '🐾 Todos' },
                { id: 'perro', label: '🐕 Perros' },
                { id: 'gato', label: '🐈 Gatos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition ${
                    filterCategory === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pestañas de Establecimiento */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'veterinaria', label: '🏥 Clínicas' },
                { id: 'refugio', label: '🏠 Refugios' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition ${
                    filterCategory === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desplegable de Estado */}
            <div className="mt-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-700"
              >
                <option value="todos">Filtrar por estado (Todos)</option>
                <option value="PERDIDO">🔴 Solo Perdidos</option>
                <option value="HALLAZGO">🟢 Solo Encontrados (Hallazgos)</option>
              </select>
            </div>

            {/* Buscador por zona */}
            <div className="mt-3">
              <input
                type="text"
                placeholder="Buscar barrio o municipio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Listado lateral */}
          <div className="mt-4 space-y-2.5 overflow-y-auto flex-1 pr-1">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-center text-gray-400 py-8">No hay registros que coincidan.</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    selectedItem?.id === item.id 
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500/20' 
                      : 'border-gray-100 hover:border-gray-300 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'PERDIDO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {item.status}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.category === 'veterinaria' ? 'bg-sky-100 text-sky-700' : item.category === 'refugio' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mt-1.5 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {item.locationName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Mapa Interactivo */}
      <div className="w-full lg:w-2/3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
        <MapClient items={filteredItems} selectedItem={selectedItem} />
      </div>
    </div>
  );
}