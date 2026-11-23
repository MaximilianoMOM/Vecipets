'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface MapItem {
  id: string;
  name: string;
  category: 'perro' | 'gato' | 'veterinaria' | 'refugio';
  status?: 'PERDIDO' | 'HALLAZGO';
  locationName: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
}

interface MapClientProps {
  items: MapItem[];
  selectedItem: MapItem | null;
}

function MapFlyTo({ selectedItem }: { selectedItem: MapItem | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.lat, selectedItem.lng], 16, { duration: 1.5 });
    }
  }, [selectedItem, map]);

  return null;
}

function UserLocationControl({ onLocate }: { onLocate: (coords: [number, number]) => void }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        map.flyTo(coords, 15, { duration: 1.5 });
        onLocate(coords);
        setLoading(false);
      },
      () => {
        alert('No se pudo obtener tu ubicación.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px', zIndex: 1000 }}>
      <div className="leaflet-control">
        <button
          onClick={handleGetLocation}
          disabled={loading}
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold p-2.5 rounded-xl shadow-md border border-gray-200 flex items-center justify-center transition hover:scale-105"
          title="Mi ubicación actual"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Iconos temáticos de animales y lugares
const getCustomIcon = (category: string, status?: string) => {
  let bgColor = 'bg-blue-600';
  let emoji = '📍';
  let extraClasses = '';

  if (category === 'perro') {
    bgColor = status === 'PERDIDO' ? 'bg-red-500' : 'bg-emerald-600';
    emoji = '🐶';
    if (status === 'PERDIDO') extraClasses = 'animate-bounce shadow-red-500/50';
  } else if (category === 'gato') {
    bgColor = status === 'PERDIDO' ? 'bg-red-500' : 'bg-emerald-600';
    emoji = '🐱';
    if (status === 'PERDIDO') extraClasses = 'animate-bounce shadow-red-500/50';
  } else if (category === 'veterinaria') {
    bgColor = 'bg-sky-600';
    emoji = '🏥';
  } else if (category === 'refugio') {
    bgColor = 'bg-amber-600';
    emoji = '🏠';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="${bgColor} ${extraClasses} text-white rounded-full w-11 h-11 flex items-center justify-center shadow-xl border-[3px] border-white text-lg cursor-pointer hover:scale-110 transition-transform">
            ${emoji}
           </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div class="bg-indigo-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-2xl border-[3px] border-white animate-pulse">
          <div class="w-3 h-3 bg-white rounded-full"></div>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function MapClient({ items, selectedItem }: MapClientProps) {
  const medellinCenter: [number, number] = [6.2442, -75.5812];
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  return (
    <div className="relative w-full h-full rounded-[inherit] overflow-hidden z-0 isolate">
      <MapContainer
        center={medellinCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo selectedItem={selectedItem} />
        <UserLocationControl onLocate={(coords) => setUserCoords(coords)} />

        {userCoords && (
          <Marker position={userCoords} icon={userIcon}>
            <Popup>
              <span className="font-bold text-xs text-indigo-600">📍 Tu ubicación actual</span>
            </Popup>
          </Marker>
        )}

        {items.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]} 
            icon={getCustomIcon(item.category, item.status)}
          >
            <Popup>
              <div className="p-2 space-y-2 max-w-[200px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.status && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'PERDIDO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {item.status}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.category === 'veterinaria' ? 'bg-sky-100 text-sky-700' : item.category === 'refugio' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">📍 {item.locationName}</p>
                </div>
                <button 
                  onClick={() => alert(`Reporte seleccionado: ${item.name}`)}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition"
                >
                  Ver Información
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}