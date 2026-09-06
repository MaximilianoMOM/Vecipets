'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Reporte } from '@/lib/api-client';

// Generador de iconos personalizados con HTML/CSS para evitar problemas de assets estáticos de Leaflet
const createCustomIcon = (tipo: string, especie: string) => {
  let bgColor = '#F3B26C'; // Naranja
  let emoji = '🐾';

  if (tipo === 'PERDIDA') {
    bgColor = '#EF4444'; // Red
    emoji = '🚨';
  } else if (tipo === 'HALLAZGO') {
    bgColor = '#10B981'; // Green
    emoji = '🔍';
  }

  if (especie === 'PERRO') emoji = '🐶';
  else if (especie === 'GATO') emoji = '🐱';

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 3px solid #ffffff;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-pin',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

interface MapaGeneralProps {
  reportes?: Reporte[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  onSelectReporte?: (reporte: Reporte) => void;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapaGeneralLeaflet({
  reportes = [],
  centroInicial = [4.6097, -74.0817], // Bogotá por defecto
  zoomInicial = 12,
  onSelectReporte,
}: MapaGeneralProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando mapa interactivo...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={centroInicial} />

        {reportes.map((rep) => {
          if (typeof rep.latitud !== 'number' || typeof rep.longitud !== 'number') return null;

          return (
            <Marker
              key={rep.id}
              position={[rep.latitud, rep.longitud]}
              icon={createCustomIcon(rep.tipo, rep.especie)}
              eventHandlers={{
                click: () => onSelectReporte && onSelectReporte(rep),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[220px]">
                  {rep.fotoUrl && (
                    <img
                      src={rep.fotoUrl}
                      alt={rep.titulo}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase text-white ${
                        rep.tipo === 'PERDIDA'
                          ? 'bg-rose-500'
                          : rep.tipo === 'HALLAZGO'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                    >
                      {rep.tipo}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {rep.especie}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                    {rep.nombreMascota || rep.titulo}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    📍 {rep.ubicacion}
                  </p>
                  <Link
                    href={`/reportes/${rep.id}`}
                    className="mt-3 block text-center bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                  >
                    Ver Detalle Completo
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
