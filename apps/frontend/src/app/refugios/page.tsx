'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Refugio {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  actividadesCount: number;
  campanasCount: number;
  sobreNosotros: string;
  contacto: string;
  horarios: string;
  jornadas: Array<{ titulo: string; fecha: string; lugar: string; hora: string; tipo: string }>;
  campanas: Array<{ titulo: string; descripcion: string }>;
  imagen: string;
}

export default function RefugiosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'cerca'>('todos');
  const [refugioSeleccionado, setRefugioSeleccionado] = useState<Refugio | null>(null);

  const refugios: Refugio[] = [
    {
      id: 1,
      nombre: 'Refugio Huellitas',
      ubicacion: 'Medellín, Antioquia',
      descripcion: 'Un espacio dedicado al cuidado y protección de animales que necesitan una segunda oportunidad.',
      actividadesCount: 4,
      campanasCount: 2,
      sobreNosotros: 'Refugio Huellitas es una organización dedicada al cuidado y protección de animales, promoviendo acciones que contribuyen al bienestar animal y fortalecen la participación de la comunidad.',
      contacto: '+57 300 987 6543 • contacto@refugiohuellitas.org',
      horarios: 'Lunes a sábado\n8:00 a. m. – 5:00 p. m.',
      imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200',
      jornadas: [
        { titulo: 'Jornada de esterilización', fecha: '25 de mayo', lugar: 'Refugio Huellitas', hora: '8:00 a. m. – 2:00 p. m.', tipo: 'verde' },
        { titulo: 'Campaña de bienestar animal', fecha: '2 de junio', lugar: 'Medellín', hora: '9:00 a. m. – 1:00 p. m.', tipo: 'naranja' }
      ],
      campanas: [
        { titulo: '“Cuidemos sus huellas”', descripcion: 'Información sobre la campaña y cómo puede participar la comunidad.' }
      ]
    },
    {
      id: 2,
      nombre: 'Patitas al Rescate',
      ubicacion: 'Bello, Antioquia',
      descripcion: 'Trabajamos por el bienestar animal y promovemos jornadas y actividades para la comunidad.',
      actividadesCount: 3,
      campanasCount: 1,
      sobreNosotros: 'Patitas al Rescate impulsa espacios seguros de acogida temporal, educación y vinculación ciudadana para la protección de animales vulnerables.',
      contacto: '+57 311 456 7890 • hola@patitasalrescate.co',
      horarios: 'Lunes a viernes\n9:00 a. m. – 4:00 p. m.',
      imagen: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=1200',
      jornadas: [
        { titulo: 'Feria de adopción comunitaria', fecha: '10 de junio', lugar: 'Parque Principal de Bello', hora: '10:00 a. m. – 3:00 p. m.', tipo: 'verde' }
      ],
      campanas: [
        { titulo: '“Alimenta una esperanza”', descripcion: 'Recolección de alimento seco y húmedo para perros y gatos rescatados.' }
      ]
    }
  ];

  const refugiosFiltrados = refugios.filter(r => {
    const coincideTexto = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || r.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtroTipo === 'todos' || (filtroTipo === 'cerca' && r.ubicacion.includes('Medellín'));
    return coincideTexto && coincideFiltro;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', color: '#1f2937' }}>
      
      {refugioSeleccionado ? (
        /* VISTA DE DETALLE DE UN REFUGIO */
        <div>
          <button 
            onClick={() => setRefugioSeleccionado(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: '24px' }}
          >
            &larr; Volver a refugios
          </button>

          {/* PORTADA GRANDE */}
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '340px', marginBottom: '32px', background: '#111' }}>
            <img src={refugioSeleccionado.imagen} alt={refugioSeleccionado.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, width: 'fit-content', marginBottom: '10px' }}>
                🐾 REFUGIO
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>{refugioSeleccionado.nombre} 🐾</h1>
              <p style={{ fontSize: '14px', color: '#e5e7eb', margin: '0 0 16px' }}>📍 {refugioSeleccionado.ubicacion} — Un hogar de esperanza para nuestros amigos de cuatro patas.</p>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="#contacto" style={{ padding: '10px 18px', background: '#16a34a', color: '#ffffff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Contactar refugio
                </a>
                <a href="#ubicacion" style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Ver ubicación
                </a>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL REFUGIO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Sobre nosotros</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{refugioSeleccionado.sobreNosotros}</p>
            </div>

            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>📍 Ubicación</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>{refugioSeleccionado.ubicacion}</p>
              
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>📞 Contacto</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>{refugioSeleccionado.contacto}</p>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>🕐 Horarios</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, whiteSpace: 'pre-line' }}>{refugioSeleccionado.horarios}</p>
            </div>
          </div>

          {/* PRÓXIMAS JORNADAS */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>📅 Próximas jornadas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {refugioSeleccionado.jornadas.map((j, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{j.titulo}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>📅 {j.fecha}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>📍 {j.lugar}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px' }}>🕐 {j.hora}</p>
                  <button style={{ padding: '8px 14px', background: j.tipo === 'verde' ? '#f0fdf4' : '#fff7ed', color: j.tipo === 'verde' ? '#166534' : '#c2410c', border: `1px solid ${j.tipo === 'verde' ? '#bbf7d0' : '#ffedd5'}`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    {j.tipo === 'verde' ? '🟢 Ver detalles' : '🟠 Ver detalles'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CAMPAÑAS Y ACTIVIDADES */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>📢 Campañas y actividades</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {refugioSeleccionado.campanas.map((c, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'inline-block', marginBottom: '8px' }}>📢 Campaña activa</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{c.titulo}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px' }}>{c.descripcion}</p>
                  <button style={{ padding: '8px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    Conocer campaña
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* UBICACIÓN MAPA */}
          <div id="ubicacion" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>🗺️ Ubicación</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>¿Dónde estamos?<br/><strong>📍 {refugioSeleccionado.nombre}</strong><br/>{refugioSeleccionado.ubicacion}</p>
            <button style={{ padding: '10px 18px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Ver ruta
            </button>
          </div>

          {/* BLOQUE FINAL DE APOYO */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>¿Quieres apoyar a este refugio? 🐾</h3>
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>Tu participación puede ayudar a fortalecer las actividades y campañas de bienestar animal.</p>
            <button style={{ padding: '12px 24px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
              Quiero participar
            </button>
          </div>
        </div>
      ) : (
        /* VISTA PRINCIPAL (LISTADO Y BUSCADOR) */
        <>
          {/* HEADER SECCIÓN */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
              <span>🐾</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>REFUGIOS</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              Conoce nuestros refugios
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Espacios que trabajan cada día por el bienestar y protección de los animales.
            </p>
          </div>

          {/* BUSCADOR Y FILTROS */}
          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>🔎 Buscar refugio por nombre o ubicación</div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Buscar refugio..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, minWidth: '240px', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setFiltroTipo('todos')}
                  style={{ padding: '0 16px', height: '44px', background: filtroTipo === 'todos' ? '#16a34a' : '#f9fafb', color: filtroTipo === 'todos' ? '#ffffff' : '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFiltroTipo('cerca')}
                  style={{ padding: '0 16px', height: '44px', background: filtroTipo === 'cerca' ? '#16a34a' : '#f9fafb', color: filtroTipo === 'cerca' ? '#ffffff' : '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cerca de mí
                </button>
              </div>
            </div>
          </div>

          {/* TARJETAS DE REFUGIOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {refugiosFiltrados.map((refugio) => (
              <div key={refugio.id} style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', background: '#f3f4f6' }}>
                  <img src={refugio.imagen} alt={refugio.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>🐾 {refugio.nombre}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>📍 {refugio.ubicacion}</p>
                  <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 16px', lineHeight: '1.5' }}>{refugio.descripcion}</p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', background: '#f9fafb', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                    <span>Actividades: <strong>{refugio.actividadesCount} próximas</strong></span>
                    <span>Campañas: <strong>{refugio.campanasCount} activas</strong></span>
                  </div>

                  <button 
                    onClick={() => setRefugioSeleccionado(refugio)}
                    style={{ marginTop: 'auto', width: '100%', height: '40px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🟢 Ver refugio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}