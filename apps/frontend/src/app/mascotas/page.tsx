'use client';

import React, { useState, useEffect } from 'react';
import { Mascota } from './types/mascota';
import MascotaDetalle from './components/mascota-detalle';
import { mascotasFrontendService } from '@/services/mascotasService';

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorConexion, setErrorConexion] = useState<string | null>(null);

  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  // 🔄 Cargar datos reales desde tu backend de NestJS al iniciar la página
  useEffect(() => {
    async function cargarMascotasBackend() {
      try {
        setCargando(true);
        const data = await mascotasFrontendService.obtenerMascotasReportadas();
        console.log("Datos recibidos del backend:", data);
        
        const mascotasFormateadas = data.map((item: any) => {
          const ultimoReporte = item.reportes?.[0] || {};
          const ubicacion = ultimoReporte.ubicacion || {};
          
          return {
            id: item.id,
            tipo: (ultimoReporte.tipo || 'perdida').toLowerCase(), 
            nombre: item.nombre || 'Sin nombre',
            especie: item.especie || 'Mascota',
            raza: item.raza || 'No especificada',
            color: item.color || 'No especificado',
            tamaño: 'Mediano', 
            sexo: 'No especificado',
            fecha: ultimoReporte.fechaAcontecimiento 
              ? ultimoReporte.fechaAcontecimiento.split('T')[0] 
              : item.createdAt.split('T')[0],
            sector: ubicacion.barrio || ubicacion.comuna || ubicacion.direccion || 'Medellín',
            ciudad: 'Medellín',
            descripcion: ultimoReporte.descripcion || item.caracteristicas || 'Sin descripción adicional.',
            // Si la foto es un link de ejemplo que no carga o es inválida, usamos una por defecto de respaldo
            imagen: item.fotoUrl && item.fotoUrl.startsWith('http') && !item.fotoUrl.includes('ejemplo.com')
              ? item.fotoUrl 
              : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
          };
        });

        setMascotas(mascotasFormateadas);
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        setErrorConexion('No se pudo conectar con el servidor backend (Puerto 4000). Verifica que esté encendido.');
      } finally {
        setCargando(false);
      }
    }

    cargarMascotasBackend();
  }, []);

  const mascotasFiltradas = mascotas.filter(m => {
    const coincideTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
    const coincideTexto = 
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.raza.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.sector.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFecha = fechaSeleccionada ? m.fecha === fechaSeleccionada : true;

    return coincideTipo && coincideTexto && coincideFecha;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
      
      {/* Alerta de error si el backend no responde */}
      {errorConexion && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '12px', color: '#991b1b', marginBottom: '20px', fontSize: '13px' }}>
          ⚠️ {errorConexion}
        </div>
      )}

      {mascotaSeleccionada !== null ? (
        <MascotaDetalle 
          mascota={mascotaSeleccionada} 
          onClose={() => setMascotaSeleccionada(null)} 
        />
      ) : (
        <>
          {/* HERO PRINCIPAL */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px' }}>🐾</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>Red Comunitaria</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                Mascotas en la Red (Base de Datos)
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Busca por nombre, raza, zona o selecciona una fecha específica en el calendario.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#" style={{ padding: '10px 16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                🗺️ Ver Mapa
              </a>
              <a href="#" style={{ padding: '10px 16px', background: '#16a34a', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                🚨 Reportar
              </a>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.04)', border: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="🔍 Buscar nombre, raza, sector..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <input 
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', boxSizing: 'border-box', color: '#4b5563' }}
              />
            </div>

            <div>
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', boxSizing: 'border-box', color: '#4b5563', cursor: 'pointer' }}
              >
                <option value="todos">Todas las mascotas</option>
                <option value="perdida">En búsqueda (Perdidas)</option>
                <option value="encontrada">Encontradas</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontWeight: 500 }}>
            Mostrando <strong>{mascotasFiltradas.length}</strong> {mascotasFiltradas.length === 1 ? 'resultado' : 'resultados'}
          </div>

          {/* LISTADO DE MASCOTAS O ESTADO DE CARGA */}
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6', marginTop: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Cargando registros desde la base de datos...</p>
            </div>
          ) : mascotasFiltradas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {mascotasFiltradas.map((mascota) => (
                <div key={mascota.id} style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                  
                  {/* IMAGEN Y BADGE */}
                  <div style={{ position: 'relative', height: '200px', background: '#f3f4f6' }}>
                    {mascota.imagen ? (
                      <img src={mascota.imagen} alt={mascota.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🐾</div>
                    )}
                    <span style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      background: mascota.tipo === 'perdida' ? '#fef2f2' : '#f0fdf4',
                      color: mascota.tipo === 'perdida' ? '#991b1b' : '#166534',
                      border: `1px solid ${mascota.tipo === 'perdida' ? '#fecaca' : '#bbf7d0'}`
                    }}>
                      {mascota.tipo === 'perdida' ? '🚨 En búsqueda' : '✨ Encontrada'}
                    </span>
                  </div>

                  {/* CONTENIDO DE LA TARJETA */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                      {mascota.nombre || "Sin nombre"}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, marginBottom: '14px' }}>
                      {mascota.especie} • {mascota.raza}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f9fafb', padding: '10px 12px', borderRadius: '12px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Zona</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{mascota.sector}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Ciudad</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{mascota.ciudad}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📅</span> {mascota.fecha}
                    </div>

                    <button 
                      onClick={() => setMascotaSeleccionada(mascota)}
                      style={{ 
                        marginTop: 'auto', 
                        width: '100%', 
                        height: '40px', 
                        borderRadius: '10px', 
                        background: '#f0fdf4', 
                        color: '#166534', 
                        border: '1px solid #bbf7d0', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      Ver detalles y ayudar &rarr;
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* ESTADO SIN RESULTADOS */
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6', marginTop: '20px' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🐾</div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No encontramos coincidencias</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>Prueba ajustando los filtros o el término de búsqueda.</p>
              <button 
                onClick={() => { setBusqueda(''); setFiltroTipo('todos'); setFechaSeleccionada(''); }}
                style={{ padding: '10px 20px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}