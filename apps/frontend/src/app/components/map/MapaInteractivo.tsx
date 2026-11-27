'use client';

import { useEffect, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ==========================================
// CONFIGURACIÓN DE ICONOS DE LEAFLET
// ==========================================

// @ts-expect-error - Propiedades privadas de Leaflet para limpiar el icono por defecto
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==========================================
// INTERFACES
// ==========================================

export interface SeleccionMapa {
  lat: number;
  lng: number;
  direccion?: string;
}

export interface MapaInteractivoProps {
  lat?: number;
  lng?: number;
  etiqueta?: string;
  hideMarker?: boolean;
  mostrarMarcador?: boolean;

  markers?: {
    lat: number;
    lng: number;
    label: string;
    color: string;
  }[];

  onSeleccionarUbicacion?: (
    seleccion: SeleccionMapa
  ) => void;
}

// ==========================================
// CENTRADO Y ZOOM DEL MAPA
// ==========================================

function CentradorMapa({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      map.setView([lat, lng], zoom, {
        animate: true,
      });
    }
  }, [lat, lng, map, zoom]);

  return null;
}

// ==========================================
// SELECCIÓN DE UBICACIÓN MEDIANTE CLIC
// ==========================================

function SelectorClicMapa({
  onSeleccionar,
}: {
  onSeleccionar?: (
    seleccion: SeleccionMapa
  ) => void;
}) {
  useMapEvents({
    click(e) {
      if (onSeleccionar) {
        onSeleccionar({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }
    },
  });

  return null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function MapaInteractivo({
  lat = 6.2442,
  lng = -75.5812,
  etiqueta = '¡Vecipets activo en Medellín! 🐾',
  mostrarMarcador = true,
  hideMarker = false,
  markers = [],
  onSeleccionarUbicacion,
}: MapaInteractivoProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Control compatible con ambas ramas
  const marcadorVisible = mostrarMarcador && !hideMarker;

  const zoomMapa = marcadorVisible ? 15 : 13;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================
  // ESTADO DE CARGA
  // ==========================================

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Cargando mapa de la comunidad...
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO DEL MAPA
  // ==========================================

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[inherit] z-0 isolate">
      <MapContainer
        center={[lat, lng]}
        zoom={zoomMapa}
        scrollWheelZoom={true}
        className="h-full w-full z-0 cursor-crosshair"
      >
        {/* Capa de OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Centrado y zoom dinámico */}
        <CentradorMapa
          lat={lat}
          lng={lng}
          zoom={zoomMapa}
        />

        {/* Selección de ubicación mediante clic */}
        <SelectorClicMapa
          onSeleccionar={onSeleccionarUbicacion}
        />

        {/* Marcador principal arrastrable */}
        {marcadorVisible && (
          <Marker
            position={[lat, lng]}
            draggable={!!onSeleccionarUbicacion}
            eventHandlers={{
              dragend(event) {
                const posicion = event.target.getLatLng();

                onSeleccionarUbicacion?.({
                  lat: posicion.lat,
                  lng: posicion.lng,
                });
              },
            }}
          >
            <Popup>{etiqueta}</Popup>
          </Marker>
        )}

        {/* Marcadores adicionales de colores */}
        {markers.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.lat, point.lng]}
            radius={9}
            pathOptions={{
              color: point.color,
              fillColor: point.color,
              fillOpacity: 0.75,
            }}
          >
            <Popup>{point.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}