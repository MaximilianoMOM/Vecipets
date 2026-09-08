'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

export interface ElementoMapa {
  id: string;
  tipoItem: 'MASCOTA' | 'REFUGIO' | 'VETERINARIA';
  subtipo: 'PERDIDA' | 'HALLAZGO' | 'REFUGIO' | 'VETERINARIA' | 'CLINICA';
  especie?: 'PERRO' | 'GATO' | 'OTRO' | string;
  nombre: string;
  descripcion?: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  fotoUrl?: string;
  telefono?: string;
  horario?: string;
  servicios?: string[];
  reporteId?: string;
}

// Generador de íconos personalizados con HTML/CSS para Leaflet
const createCustomIcon = (tipoItem: string, subtipo: string, especie?: string) => {
  let bgColor = '#5E7BC4';
  let emoji = '🐾';

  if (tipoItem === 'MASCOTA') {
    if (subtipo === 'PERDIDA') {
      bgColor = '#EF4444'; // Red
      emoji = '🚨';
    } else {
      bgColor = '#10B981'; // Green
      emoji = '🔍';
    }

    if (especie === 'PERRO') emoji = '🐶';
    else if (especie === 'GATO') emoji = '🐱';
  } else if (tipoItem === 'REFUGIO') {
    bgColor = '#9333EA'; // Purple
    emoji = '🏡';
  } else if (tipoItem === 'VETERINARIA') {
    bgColor = '#0284C7'; // Blue
    emoji = '🏥';
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      border: 3px solid #ffffff;
      font-size: 20px;
      cursor: pointer;
      transition: transform 0.2s ease;
    " class="hover:scale-110">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-pin',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
};

interface MapaGeneralProps {
  elementos?: ElementoMapa[];
  reportes?: any[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  onSelectElemento?: (elemento: ElementoMapa) => void;
  onSelectReporte?: (reporte: any) => void;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function MapaGeneralLeaflet({
  elementos = [],
  reportes = [],
  centroInicial = [4.6097, -74.0817], // Bogotá por defecto
  zoomInicial = 12,
  onSelectElemento,
  onSelectReporte,
}: MapaGeneralProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Adaptador de compatibilidad para llamadas legacy que envían 'reportes'
  let listaFinal: ElementoMapa[] = elementos;
  if (listaFinal.length === 0 && reportes.length > 0) {
    listaFinal = reportes
      .filter((rep) => rep && rep.latitud && rep.longitud)
      .map((rep) => ({
        id: rep.id || String(Math.random()),
        tipoItem: 'MASCOTA',
        subtipo: rep.tipo === 'PERDIDA' ? 'PERDIDA' : 'HALLAZGO',
        especie: rep.especie,
        nombre: rep.nombreMascota || rep.titulo || 'Mascota',
        descripcion: rep.descripcion,
        ubicacion: rep.ubicacion || 'Sin ubicación',
        latitud: typeof rep.latitud === 'string' ? parseFloat(rep.latitud) : rep.latitud,
        longitud: typeof rep.longitud === 'string' ? parseFloat(rep.longitud) : rep.longitud,
        fotoUrl: rep.fotoUrl,
        reporteId: rep.id,
      }));
  }

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando mapa interactivo...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
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

        {listaFinal.map((elem) => {
          if (typeof elem.latitud !== 'number' || typeof elem.longitud !== 'number') return null;

          return (
            <Marker
              key={elem.id}
              position={[elem.latitud, elem.longitud]}
              icon={createCustomIcon(elem.tipoItem, elem.subtipo, elem.especie)}
              eventHandlers={{
                click: () => {
                  if (onSelectElemento) onSelectElemento(elem);
                  if (onSelectReporte) onSelectReporte(elem);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[240px]">
                  {elem.fotoUrl && (
                    <img
                      src={elem.fotoUrl}
                      alt={elem.nombre}
                      className="w-full h-28 object-cover rounded-xl mb-2 shadow-xs"
                    />
                  )}
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase text-white ${
                        elem.subtipo === 'PERDIDA'
                          ? 'bg-rose-500'
                          : elem.subtipo === 'HALLAZGO'
                          ? 'bg-emerald-500'
                          : elem.tipoItem === 'REFUGIO'
                          ? 'bg-purple-600'
                          : 'bg-sky-600'
                      }`}
                    >
                      {elem.subtipo}
                    </span>
                    {elem.especie && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {elem.especie}
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">
                    {elem.nombre}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium">
                    📍 {elem.ubicacion}
                  </p>

                  {elem.horario && (
                    <p className="text-[11px] text-slate-600 mb-2 font-semibold">
                      🕒 {elem.horario}
                    </p>
                  )}

                  {elem.tipoItem === 'MASCOTA' && elem.reporteId ? (
                    <Link
                      href={`/reportes/${elem.reporteId}`}
                      className="block text-center bg-[#5E7BC4] hover:bg-[#4F6FB8] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors shadow-xs"
                    >
                      Ver Detalle Completo →
                    </Link>
                  ) : elem.telefono ? (
                    <a
                      href={`tel:${elem.telefono}`}
                      className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors shadow-xs"
                    >
                      📞 Llamar ({elem.telefono})
                    </a>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

