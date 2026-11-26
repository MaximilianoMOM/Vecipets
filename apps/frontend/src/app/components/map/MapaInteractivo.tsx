'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

export interface SeleccionMapa {
  lat: number;
  lng: number;
  direccion?: string;
}

export interface MapaInteractivoProps {
  lat?: number;
  lng?: number;
  etiqueta?: string;
  mostrarMarcador?: boolean;
  onSeleccionarUbicacion?: (seleccion: SeleccionMapa) => void;
}

function CentradorMapa({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      map.setView([lat, lng], zoom, { animate: true });
    }
  }, [lat, lng, map, zoom]);

  return null;
}

function SelectorClicMapa({
  onSeleccionar,
}: {
  onSeleccionar?: (seleccion: SeleccionMapa) => void;
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

export default function MapaInteractivo({
  lat = 6.2442,
  lng = -75.5812,
  etiqueta = '¡Vecipets activo en Medellín! 🐾',
  mostrarMarcador = true,
  onSeleccionarUbicacion,
}: MapaInteractivoProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Cargando mapa de la comunidad...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[inherit] z-0 isolate">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0 cursor-crosshair"
      >
        <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
<CentradorMapa lat={lat} lng={lng} zoom={mostrarMarcador ? 15 : 13} />
<SelectorClicMapa onSeleccionar={onSeleccionarUbicacion} />
{mostrarMarcador && <Marker position={[lat, lng]}>
  <Popup>{etiqueta}</Popup>
</Marker>}
      </MapContainer>
    </div>
  );
}
