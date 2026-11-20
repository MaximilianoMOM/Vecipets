'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-expect-error - Propiedades privadas de Leaflet para limpiar el icono por defecto
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapaInteractivo() {
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
                center={[6.2442, -75.5812]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[6.2442, -75.5812]}>
                    <Popup>
                        ¡Vecipets activo en Medellín! 🐾
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}