'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const locationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #5E7BC4;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(94, 123, 196, 0.4);
      border: 3px solid #ffffff;
      font-size: 20px;
      cursor: grab;
    ">
      📍
    </div>
  `,
  className: 'custom-selector-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapaSelectorProps {
  latitud: number;
  longitud: number;
  onUbicacionChange: (lat: number, lng: number, direccion?: string) => void;
}

// Componente para integrar la barra de búsqueda Nominatim con leaflet-geosearch
function SearchControl({ onSelect }: { onSelect: (lat: number, lng: number, label: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      marker: { icon: locationIcon, draggable: true },
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Buscar dirección o ciudad...',
      keepResult: true,
    });

    map.addControl(searchControl);

    const handleLocationFound = (result: any) => {
      if (result && result.location) {
        onSelect(result.location.y, result.location.x, result.location.label);
      }
    };

    map.on('geosearch/showlocation', handleLocationFound);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handleLocationFound);
    };
  }, [map, onSelect]);

  return null;
}

function LocationMarker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        onChange(latLng.lat, latLng.lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={locationIcon}
    />
  );
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export default function MapaSelectorUbicacion({
  latitud,
  longitud,
  onUbicacionChange,
}: MapaSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const position: [number, number] = [
    latitud || 4.6097,
    longitud || -74.0817,
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
        Cargando selector de mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-80 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={position} />
        <SearchControl
          onSelect={(lat, lng, label) => {
            onUbicacionChange(lat, lng, label);
          }}
        />
        <LocationMarker
          position={position}
          onChange={(newLat, newLng) => {
            onUbicacionChange(newLat, newLng);
          }}
        />
      </MapContainer>
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-md border border-slate-100 flex items-center justify-between">
        <span>📍 Haz clic o arrastra el marcador para fijar la ubicación</span>
        <span className="text-[#5E7BC4]">
          {latitud.toFixed(4)}, {longitud.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
