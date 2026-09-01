'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Configuración del ícono por defecto de Leaflet para que no se rompa la imagen en Next.js
const iconoPersonalizado = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Componente auxiliar interno para mover la cámara del mapa al hacer clic en un elemento lateral
function CambiarCentroMapa({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15, { animate: true });
    }
  }, [coords, map]);
  return null;
}

interface MapaGeneralProps {
  puntos: Array<{
    id: string;
    nombre: string;
    ubicacion: string;
    coords: [number, number];
    descripcion: string;
    etiqueta: string;
  }>;
  elementoSeleccionado: any;
  onSelectPunto: (p: any) => void;
}

export default function MapaGeneral({ puntos, elementoSeleccionado, onSelectPunto }: MapaGeneralProps) {
  const centroInicial: [number, number] = [6.2442, -75.5812]; // Coordenadas por defecto (Medellín)

  return (
    <MapContainer 
      center={elementoSeleccionado ? elementoSeleccionado.coords : centroInicial} 
      zoom={13} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Si el usuario selecciona un punto en el panel, mueve el mapa hacia él */}
      {elementoSeleccionado && <CambiarCentroMapa coords={elementoSeleccionado.coords} />}

      {/* Renderizado de los marcadores en el mapa */}
      {puntos.map((punto) => (
        <Marker 
          key={punto.id} 
          position={punto.coords} 
          icon={iconoPersonalizado}
          eventHandlers={{
            click: () => onSelectPunto(punto)
          }}
        >
          <Popup>
            <div style={{ maxWidth: '200px', fontFamily: 'system-ui, sans-serif' }}>
              <strong style={{ fontSize: '13px', color: '#111827' }}>{punto.nombre}</strong>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0' }}>{punto.descripcion}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}