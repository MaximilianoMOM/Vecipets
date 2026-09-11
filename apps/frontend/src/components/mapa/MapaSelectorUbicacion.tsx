'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { GeoSearchControl, EsriProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

interface Props {
  latInicial?: number;
  lngInicial?: number;
  latitud?: number;
  longitud?: number;
  onSelectLocation?: (lat: number, lng: number, direccionCalculada?: string) => void;
  onUbicacionChange?: (lat: number, lng: number, direccionCalculada?: string) => void;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
      map.invalidateSize();
    }
  }, [lat, lng, map]);
  return null;
}

function LeafletSearchControl({
  onSelectResult,
}: {
  onSelectResult: (lat: number, lng: number, label: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const provider = new EsriProvider({
      params: {
        location: '-75.5812,6.2442',
        maxLocations: 5,
      },
    });

    const searchControl = (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: '📍 Buscar dirección como en Google Maps...',
      keepResult: true,
    });

    map.addControl(searchControl);

    const handleShowLocation = (result: any) => {
      if (result && result.location) {
        const lat = parseFloat(result.location.y);
        const lng = parseFloat(result.location.x);
        const label = result.location.label || result.label || '';
        if (!isNaN(lat) && !isNaN(lng)) {
          onSelectResult(lat, lng, label);
        }
      }
    };

    map.on('geosearch/showlocation', handleShowLocation);

    return () => {
      map.off('geosearch/showlocation', handleShowLocation);
      try {
        map.removeControl(searchControl);
      } catch (e) {}
    };
  }, [map, onSelectResult]);

  return null;
}

function MarcadorInteractivo({
  posicion,
  onSelect,
  icon,
}: {
  posicion: [number, number];
  onSelect: (lat: number, lng: number) => void;
  icon: any;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!icon || !posicion || isNaN(posicion[0]) || isNaN(posicion[1])) return null;

  return (
    <Marker key={`${posicion[0]}-${posicion[1]}`} position={posicion} icon={icon}>
      <Popup>
        <div className="text-xs font-bold text-[#292A2F] p-1 text-center">
          📍 Ubicación exacta
          <br />
          <span className="text-[10px] text-[#53627A] font-normal">
            ({posicion[0].toFixed(5)}, {posicion[1].toFixed(5)})
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapaSelectorUbicacion({
  latInicial,
  lngInicial,
  latitud = 6.2442,
  longitud = -75.5812,
  onSelectLocation,
  onUbicacionChange,
}: Props) {
  const finalLat = latInicial ?? latitud ?? 6.2442;
  const finalLng = lngInicial ?? longitud ?? -75.5812;

  const handleNotify = (lat: number, lng: number, dir?: string) => {
    if (onSelectLocation) onSelectLocation(lat, lng, dir);
    if (onUbicacionChange) onUbicacionChange(lat, lng, dir);
  };

  const [posicion, setPosicion] = useState<[number, number]>([finalLat, finalLng]);
  const [icon, setIcon] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (finalLat && finalLng && !isNaN(finalLat) && !isNaN(finalLng)) {
      setPosicion([finalLat, finalLng]);
    }
  }, [finalLat, finalLng]);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((L) => {
      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            background-color: #5E7BC4;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 16px rgba(0,0,0,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
              line-height: 1;
            ">📍</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });
      setIcon(customIcon);
    });
  }, []);

  const handleSelect = async (lat: number, lng: number) => {
    setPosicion([lat, lng]);
    handleNotify(lat, lng);

    try {
      const res = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address && data.address.Match_addr) {
          handleNotify(lat, lng, data.address.Match_addr);
          return;
        }
      }
    } catch (err) {
      console.warn('Reverse geocode Esri error:', err);
    }

    try {
      const resNom = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (resNom.ok) {
        const data = await resNom.json();
        if (data && data.display_name) {
          handleNotify(lat, lng, data.display_name);
        }
      }
    } catch (e) {
      console.warn('Reverse geocode Nominatim error:', e);
    }
  };

  const handleSearchSelect = (lat: number, lng: number, label: string) => {
    setPosicion([lat, lng]);
    handleNotify(lat, lng, label);
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#EEF2FC] flex items-center justify-center text-[#53627A] text-xs font-semibold">
        Cargando mapa con geocodificador estilo Google Maps...
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 min-h-[320px] relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/90">
      <MapContainer
        center={[finalLat, finalLng]}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={posicion[0]} lng={posicion[1]} />
        <LeafletSearchControl onSelectResult={handleSearchSelect} />
        <MarcadorInteractivo posicion={posicion} onSelect={handleSelect} icon={icon} />
      </MapContainer>

      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-md border border-slate-100 flex items-center justify-between pointer-events-none">
        <span>📍 Toca el mapa para ajustar la ubicación</span>
        <span className="text-[#5E7BC4] font-bold bg-[#EEF2FC] px-2 py-0.5 rounded-md text-[11px]">
          {posicion[0].toFixed(4)}, {posicion[1].toFixed(4)}
        </span>
      </div>
    </div>
  );
}
