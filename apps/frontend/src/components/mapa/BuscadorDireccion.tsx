'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface SugerenciaDireccion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

interface BuscadorDireccionProps {
  direccionInicial?: string;
  onSeleccionarUbicacion: (lat: number, lng: number, direccionCompleta?: string) => void;
}

export default function BuscadorDireccion({
  direccionInicial = '',
  onSeleccionarUbicacion,
}: BuscadorDireccionProps) {
  const [query, setQuery] = useState(direccionInicial);
  const [sugerencias, setSugerencias] = useState<SugerenciaDireccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar el input si la dirección cambia desde afuera (ej. por clic en el mapa)
  useEffect(() => {
    setQuery(direccionInicial);
  }, [direccionInicial]);

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debouncing para búsqueda en la API de Nominatim (OpenStreetMap) orientada a Medellín
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSugerencias([]);
      setMostrarDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        // Normalizar sintaxis de direcciones colombianas (ej. 'Calle 104#42b17' -> 'Calle 104 # 42b17')
        const qLimpia = query.replace(/#/g, ' # ').replace(/([a-zA-Z])([0-[#])/g, '$1 $2').trim();
        const qConMedellin = qLimpia.toLowerCase().includes('medellin') || qLimpia.toLowerCase().includes('medellín')
          ? qLimpia
          : `${qLimpia}, Medellín`;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            qConMedellin
          )}&countrycodes=co&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'es',
            },
          }
        );

        if (res.ok) {
          const data: SugerenciaDireccion[] = await res.json();
          setSugerencias(data);
          setMostrarDropdown(data.length > 0);
        }
      } catch (err) {
        console.warn('Error buscando sugerencias de dirección:', err);
      } finally {
        setCargando(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const seleccionarSugerencia = (sug: SugerenciaDireccion) => {
    const lat = parseFloat(sug.lat);
    const lng = parseFloat(sug.lon);

    const partes = [];
    if (sug.address?.road) partes.push(sug.address.road);
    if (sug.address?.suburb) partes.push(sug.address.suburb);
    if (sug.address?.city || sug.address?.town) partes.push(sug.address.city || sug.address.town);

    const direccionCorta = partes.length > 0 ? partes.join(', ') : sug.display_name;

    setQuery(direccionCorta);
    setMostrarDropdown(false);
    onSeleccionarUbicacion(lat, lng, direccionCorta);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSeleccionarUbicacion(0, 0, e.target.value);
          }}
          onFocus={() => {
            if (sugerencias.length > 0) setMostrarDropdown(true);
          }}
          placeholder="🔍 Escribe una dirección, barrio o punto de referencia..."
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] font-medium pr-10 shadow-2xs"
        />

        {cargando && (
          <div className="absolute right-3 top-3 text-slate-400 text-xs animate-spin font-bold">
            🌀
          </div>
        )}

        {!cargando && query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSugerencias([]);
              setMostrarDropdown(false);
            }}
            className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* DROPDOWN CON SUGERENCIAS */}
      {mostrarDropdown && sugerencias.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-[2000] overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
          {sugerencias.map((sug) => (
            <button
              key={sug.place_id}
              type="button"
              onClick={() => seleccionarSugerencia(sug)}
              className="w-full text-left px-4 py-3 hover:bg-[#EEF2FC] transition-colors flex items-start gap-2.5"
            >
              <span className="text-base shrink-0 mt-0.5">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {sug.address?.road || sug.display_name.split(',')[0]}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                  {sug.display_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
