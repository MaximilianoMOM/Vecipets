'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Carga dinámica de Leaflet para evitar problemas de SSR en Next.js
const MapaGeneral = dynamic(() => import('@/components/MapaGeneral'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>Cargando mapa interactivo de la comunidad...</div>
});

export default function MapaGeneralPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'refugios' | 'veterinarias' | 'mascotas'>('todos');
  const [elementoSeleccionado, setElementoSeleccionado] = useState<any | null>(null);

  // 🔄 Estado único donde unificaremos los datos provenientes de mascotas, refugios y veterinarias
  const [puntosRed, setPuntosRed] = useState<Array<any>>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // 📥 SIMULACIÓN / CONEXIÓN CON TUS OTRAS CARPETAS:
  // Aquí es donde importas o consultas las funciones/APIs de tus carpetas de mascotas, refugios y veterinarias.
  useEffect(() => {
    const cargarDatosDeLaComunidad = async () => {
      try {
        // Ejemplo de cómo traerías la información de tus módulos:
        // const mascotas = await obtenerMascotasPerdidas();
        // const refugios = await obtenerRefugiosAliados();
        // const veterinarias = await obtenerVeterinarias();

        // Datos simulados estructurados exactamente como los devuelven tus carpetas:
        const mascotasFormateadas = [
          { id: 'masc-1', tipo: 'mascota', nombre: 'Bruno (Perro perdido)', ubicacion: 'El Poblado, Medellín', coords: [6.2150, -75.5750], descripcion: 'Reporte activo: Se busca desde hace 2 días.', etiqueta: '🚨 Mascota Perdida' }
        ];

        const refugiosFormateados = [
          { id: 'ref-1', tipo: 'refugio', nombre: 'Refugio Huellitas', ubicacion: 'Medellín, Antioquia', coords: [6.2442, -75.5812], descripcion: 'Espacio dedicado al cuidado y protección de animales.', etiqueta: '🏠 Refugio Aliado' },
          { id: 'ref-2', tipo: 'refugio', nombre: 'Patitas al Rescate', ubicacion: 'Bello, Antioquia', coords: [6.3340, -75.5562], descripcion: 'Bienestar animal y jornadas comunitarias.', etiqueta: '🏠 Refugio Aliado' }
        ];

        const veterinariasFormateadas = [
          { id: 'vet-1', tipo: 'veterinaria', nombre: 'VetCare 24 Horas', ubicacion: 'El Poblado, Medellín', coords: [6.2088, -75.5673], descripcion: 'Atención médica veterinaria de urgencias y general.', etiqueta: '🏥 Veterinaria 24h' }
        ];

        // 🔗 Unificamos todo en un solo arreglo general
        const todosLosPuntos = [
          ...mascotasFormateadas,
          ...refugiosFormateados,
          ...veterinariasFormateadas
        ];

        setPuntosRed(todosLosPuntos);
      } catch (error) {
        console.error('Error al cargar la información del mapa:', error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatosDeLaComunidad();
  }, []);

  // Filtrado lógico según la categoría seleccionada
  const puntosFiltrados = puntosRed.filter(p => {
    if (filtroCategoria === 'todos') return true;
    if (filtroCategoria === 'refugios') return p.tipo === 'refugio';
    if (filtroCategoria === 'veterinarias') return p.tipo === 'veterinaria';
    if (filtroCategoria === 'mascotas') return p.tipo === 'mascota';
    return true;
  });

  const manejarCambioFiltro = (categoria: 'todos' | 'refugios' | 'veterinarias' | 'mascotas') => {
    setFiltroCategoria(categoria);
    setElementoSeleccionado(null); 
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 20px', color: '#1f2937' }}>
      
      {/* CABECERA DEL APARTADO */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
          <span>🗺️</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>MAPA COMUNITARIO</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          Mapa general de la red VeciPets
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Visualiza de forma unificada mascotas perdidas, refugios y veterinarias de la comunidad.
        </p>
      </div>

      {/* FILTROS DE CATEGORÍA */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: '🌍 Todos los puntos' },
          { key: 'refugios', label: '🏠 Refugios' },
          { key: 'veterinarias', label: '🏥 Veterinarias' },
          { key: 'mascotas', label: '🚨 Mascotas perdidas' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => manejarCambioFiltro(f.key as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: filtroCategoria === f.key ? '#16a34a' : '#ffffff',
              color: filtroCategoria === f.key ? '#ffffff' : '#374151',
              border: filtroCategoria === f.key ? '1px solid #16a34a' : '1px solid #e5e7eb',
              boxShadow: filtroCategoria === f.key ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* CONTENEDOR DE MAPA Y PANEL LATERAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* MAPA INTERACTIVO */}
        <div style={{ height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', background: '#fff' }}>
          {cargandoDatos ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
              Sincronizando puntos de mascotas, refugios y veterinarias...
            </div>
          ) : (
            <MapaGeneral 
              puntos={puntosFiltrados} 
              elementoSeleccionado={elementoSeleccionado} 
              onSelectPunto={(p: any) => setElementoSeleccionado(p)} 
            />
          )}
        </div>

        {/* PANEL LATERAL DE INFORMACIÓN */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', height: '600px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
            Puntos en la zona ({puntosFiltrados.length})
          </h3>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {cargandoDatos ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '13px' }}>
                Cargando información...
              </div>
            ) : puntosFiltrados.length > 0 ? (
              puntosFiltrados.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setElementoSeleccionado(p)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: elementoSeleccionado?.id === p.id ? '2px solid #16a34a' : '1px solid #f3f4f6',
                    background: elementoSeleccionado?.id === p.id ? '#f0fdf4' : '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px' }}>
                    {p.etiqueta}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{p.nombre}</h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px' }}>📍 {p.ubicacion}</p>
                  <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: '1.4' }}>{p.descripcion}</p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '13px' }}>
                No hay elementos disponibles para mostrar en esta categoría.
              </div>
            )}
          </div>

          {elementoSeleccionado && (
            <button 
              onClick={() => setElementoSeleccionado(null)}
              style={{ marginTop: '16px', width: '100%', height: '38px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
            >
              Restablecer vista de mapa
            </button>
          )}
        </div>

      </div>

    </div>
  );
}