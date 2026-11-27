'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { etiquetaReporteMapa } from '@/lib/reportes-mapa';

// ==========================================
// INTERFACES
// ==========================================

export interface MapItem {
  id: string;
  name: string;

  category:
    | 'perro'
    | 'gato'
    | 'otro'
    | 'veterinaria'
    | 'refugio';

  status?: 'PERDIDA' | 'PERDIDO' | 'HALLAZGO';

  locationName: string;
  lat: number;
  lng: number;

  filter?: 'PERDIDA' | 'HALLAZGO' | 'veterinaria' | 'refugio';

  href?: string;
  photo?: string;
  date?: string;
  turbo?: boolean;
  address?: string;
  phone?: string;
  hours?: string;
  services?: string;
}

interface MapClientProps {
  items: MapItem[];
  selectedItem: MapItem | null;
  scrollWheelZoom?: boolean;
}

// ==========================================
// ESTADO DE LOS REPORTES
// ==========================================

function esPerdido(status: MapItem['status']) {
  return status === 'PERDIDA' || status === 'PERDIDO';
}

function obtenerEtiquetaEstado(status: MapItem['status']) {
  if (!status) return '';

  const estado = status === 'PERDIDO'
    ? 'PERDIDA'
    : status;

  return etiquetaReporteMapa[estado];
}

// ==========================================
// CENTRADO DEL MAPA
// ==========================================

function VistaMapa({
  selectedItem,
  items,
}: MapClientProps) {
  const map = useMap();
  const centrado = useRef(false);

  useEffect(() => {
    if (selectedItem) {
      centrado.current = true;

      map.flyTo(
        [selectedItem.lat, selectedItem.lng],
        16,
        { duration: 1.5 }
      );
    } else if (!centrado.current && items.length > 0) {
      centrado.current = true;

      map.fitBounds(
        items.map(({ lat, lng }) => [lat, lng]),
        {
          padding: [24, 24],
          maxZoom: 14,
        }
      );
    }
  }, [selectedItem, items, map]);

  return null;
}

// ==========================================
// UBICACIÓN ACTUAL DEL USUARIO
// ==========================================

function UserLocationControl({
  onLocate,
}: {
  onLocate: (coords: [number, number]) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(
        'La geolocalización no está soportada por tu navegador.'
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        map.flyTo(coords, 15, {
          duration: 1.5,
        });

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
    <div
      className="leaflet-top leaflet-right"
      style={{
        marginTop: '10px',
        marginRight: '10px',
        zIndex: 1000,
      }}
    >
      <div className="leaflet-control">
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading}
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold p-2.5 rounded-xl shadow-md border border-gray-200 flex items-center justify-center transition hover:scale-105"
          title="Mi ubicación actual"
          aria-label="Obtener mi ubicación actual"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ICONOS PERSONALIZADOS DEL MAPA
// ==========================================

const getCustomIcon = (
  category: MapItem['category'],
  status?: MapItem['status']
) => {
  let bgColor = 'bg-blue-600';
  let emoji = '📍';

  const perdido = esPerdido(status);

  if (
    category === 'perro' ||
    category === 'gato' ||
    category === 'otro'
  ) {
    bgColor = perdido
      ? 'bg-red-500'
      : 'bg-emerald-600';

    if (category === 'perro') {
      emoji = '🐶';
    } else if (category === 'gato') {
      emoji = '🐱';
    } else {
      emoji = '🐾';
    }
  } else if (category === 'veterinaria') {
    bgColor = 'bg-sky-600';
    emoji = '🏥';
  } else if (category === 'refugio') {
    bgColor = 'bg-violet-600';
    emoji = '🏠';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',

    html: `
      <div class="${bgColor}
        text-white rounded-full w-11 h-11
        flex items-center justify-center
        shadow-xl border-[3px] border-white
        text-lg cursor-pointer
        hover:scale-110 transition-transform">

        ${emoji}

      </div>
    `,

    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

// ==========================================
// ICONO DE UBICACIÓN DEL USUARIO
// ==========================================

const userIcon = L.divIcon({
  className: 'user-location-marker',

  html: `
    <div class="bg-indigo-600 text-white
      rounded-full w-9 h-9
      flex items-center justify-center
      shadow-2xl border-[3px] border-white
      animate-pulse">

      <div class="w-3 h-3 bg-white rounded-full"></div>

    </div>
  `,

  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function MapClient({
  items,
  selectedItem,
  scrollWheelZoom = true,
}: MapClientProps) {
  const medellinCenter: [number, number] = [
    6.2442,
    -75.5812,
  ];

  const [userCoords, setUserCoords] = useState<
    [number, number] | null
  >(null);

  return (
    <div className="relative w-full h-full rounded-[inherit] overflow-hidden z-0 isolate">

      <MapContainer
        center={medellinCenter}
        zoom={13}
        scrollWheelZoom={scrollWheelZoom}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 0,
        }}
      >
        {/* CAPA DEL MAPA */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CENTRADO DEL MAPA */}

        <VistaMapa
          items={items}
          selectedItem={selectedItem}
        />

        {/* CONTROL DE UBICACIÓN */}

        <UserLocationControl
          onLocate={setUserCoords}
        />

        {/* MARCADOR DEL USUARIO */}

        {userCoords && (
          <Marker
            position={userCoords}
            icon={userIcon}
          >
            <Popup>
              <span className="font-bold text-xs text-indigo-600">
                📍 Tu ubicación actual
              </span>
            </Popup>
          </Marker>
        )}

        {/* MARCADORES DE MASCOTAS Y ALIADOS */}

        {items.map((item) => {
          const perdido = esPerdido(item.status);

          const esAliado =
            item.category === 'veterinaria' ||
            item.category === 'refugio';

          const enlace =
            item.href ||
            (!esAliado
              ? `/reportes/${item.id}`
              : undefined);

          return (
            <Marker
              key={`${item.category}-${item.id}`}
              title={item.name}
              position={[item.lat, item.lng]}
              icon={getCustomIcon(
                item.category,
                item.status
              )}
            >
              <Popup>
                <div className="p-2 space-y-2 max-w-[200px]">

                  {/* ESTADO Y CATEGORÍA */}

                  <div className="flex items-center gap-1.5 flex-wrap">

                    {item.status && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          perdido
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {obtenerEtiquetaEstado(item.status)}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.category === 'veterinaria'
                          ? 'bg-sky-100 text-sky-700'
                          : item.category === 'refugio'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.category}
                    </span>

                  </div>

                  {/* NOMBRE Y UBICACIÓN */}

                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {item.name}
                    </h4>

                    <p className="text-xs text-gray-500 mt-1">
                      📍 {item.locationName}
                    </p>
                  </div>

                  {/* FOTOGRAFÍA */}

                  {item.photo && (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="max-h-28 w-full rounded-lg object-cover"
                    />
                  )}

                  {/* FECHA DEL REPORTE */}

                  {item.date && (
                    <p className="text-xs">
                      Fecha: {item.date}
                    </p>
                  )}

                  {/* ALERTA TURBO */}

                  {item.turbo && (
                    <p className="font-semibold text-amber-700">
                      ⚡ Alerta Turbo vigente
                    </p>
                  )}

                  {/* DIRECCIÓN */}

                  {item.address && (
                    <p className="text-xs">
                      Dirección: {item.address}
                    </p>
                  )}

                  {/* TELÉFONO */}

                  {item.phone && (
                    <p className="text-xs">
                      Teléfono: {item.phone}
                    </p>
                  )}

                  {/* HORARIOS */}

                  {item.hours && (
                    <p className="text-xs">
                      Horario: {item.hours}
                    </p>
                  )}

                  {/* SERVICIOS */}

                  {item.services && (
                    <p className="text-xs">
                      Servicios: {item.services}
                    </p>
                  )}

                  {/* BOTÓN PARA VER DETALLES */}

                  {enlace && (
                    <Link
                      href={enlace}
                      className="block w-full rounded-lg bg-indigo-50 py-1.5 text-center text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      {esAliado
                        ? 'Ver más'
                        : 'Ver reporte'}
                    </Link>
                  )}

                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}