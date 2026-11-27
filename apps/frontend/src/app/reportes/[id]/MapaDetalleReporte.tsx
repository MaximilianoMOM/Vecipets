'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates } from '@/lib/geocoding';

const defaultCenter = { lat: 6.2442, lng: -75.5812 };
const selectionIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  original?: Coordinates;
  originalLabel: string;
  items: { id: number; latitud: number; longitud: number; barrioSector: string }[];
  focused?: Coordinates;
  point?: Coordinates;
  onSelect?: (point: Coordinates) => void;
};

function MapView({ original, items, focused, point, onSelect }: Props) {
  const map = useMap();
  const center = focused ?? point;
  const lat = center?.lat;
  const lng = center?.lng;

  useMapEvents({
    click({ latlng }) {
      onSelect?.({ lat: latlng.lat, lng: latlng.lng });
    },
  });

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng], 15);
      return;
    }

    const bounds = L.latLngBounds(items.map(({ latitud, longitud }) => [latitud, longitud]));
    if (original) bounds.extend(original);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
  }, [map, lat, lng, items, original]);

  return null;
}

export default function MapaDetalleReporte(props: Props) {
  const { original, originalLabel, items, point, onSelect } = props;
  const selection = point ?? original ?? defaultCenter;

  return (
    <MapContainer center={original ?? defaultCenter} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapView {...props} />
      {items.map((item) => (
        <CircleMarker key={item.id} center={[item.latitud, item.longitud]} radius={8} bubblingMouseEvents={false}
          pathOptions={{ color: '#7c3aed', fillOpacity: 0.75 }}>
          <Popup>Avistamiento aproximado · {item.barrioSector}</Popup>
        </CircleMarker>
      ))}
      {original && (
        <CircleMarker center={original} radius={12} bubblingMouseEvents={false} pathOptions={{ color: '#dc2626', fillOpacity: 0.35 }}>
          <Popup>Ubicación original · {originalLabel}</Popup>
        </CircleMarker>
      )}
      {onSelect && (
        <Marker position={selection} icon={selectionIcon} draggable eventHandlers={{
          dragend(event) {
            const { lat, lng } = (event.target as L.Marker).getLatLng();
            onSelect({ lat, lng });
          },
        }}>
          <Popup>Punto del avistamiento</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
