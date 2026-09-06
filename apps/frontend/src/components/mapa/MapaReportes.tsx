'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createStaticIcon = (tipo: string) => {
  let bgColor = '#5E7BC4';
  if (tipo === 'PERDIDO') bgColor = '#EF4444';
  if (tipo === 'ENCONTRADO') bgColor = '#10B981';
  if (tipo === 'ADOPCION') bgColor = '#8B5CF6';

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 3px solid #ffffff;
      font-size: 20px;
    ">
      🐾
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-static-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface MapaReportesProps {
  latitud: number;
  longitud: number;
  nombreMascota?: string;
  tipo?: string;
  ubicacion?: string;
}

export default function MapaReportes({
  latitud,
  longitud,
  nombreMascota = 'Mascota',
  tipo = 'PERDIDO',
  ubicacion = '',
}: MapaReportesProps) {
  const [mounted, setMounted] = useState(false);
  const position: [number, number] = [latitud || 4.6097, longitud || -74.0817];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando mapa de ubicación...
      </div>
    );
  }

  return (
    <div className="w-full h-64 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={createStaticIcon(tipo)}>
          <Popup>
            <div className="p-1 text-center">
              <strong className="block text-sm font-bold text-slate-800">{nombreMascota}</strong>
              <span className="text-xs text-slate-500">{ubicacion}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
