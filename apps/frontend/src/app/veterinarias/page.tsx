'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Veterinaria {
  id: number;
  nombre: string;
  sector: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  horario: string;
  urgencias24h: boolean;
  servicios: string[];
  imagen: string;
}

export default function VeterinariasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroUrgencias, setFiltroUrgencias] = useState<boolean | null>(null);

  const veterinarias: Veterinaria[] = [
    {
      id: 1,
      nombre: 'VetCare 24 Horas',
      sector: 'El Poblado',
      ciudad: 'Medellín',
      direccion: 'Cra. 43 #10-22',
      telefono: '+57 300 123 4567',
      horario: 'Abierto 24 horas',
      urgencias24h: true,
      servicios: ['Urgencias', 'Cirugía', 'Hospitalización', 'Laboratorio'],
      imagen: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      nombre: 'Centro Médico Veterinario Huellas',
      sector: 'Laureles',
      ciudad: 'Medellín',
      direccion: 'Circular 73 #39-20',
      telefono: '+57 310 987 6543',
      horario: 'Lunes a Sábado: 8:00 a. m. – 7:00 p. m.',
      urgencias24h: false,
      servicios: ['Consulta general', 'Vacunación', 'Desparasitación', 'Odontología'],
      imagen: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      nombre: 'Urgencias Veterinarias del Norte',
      sector: 'Bello',
      ciudad: 'Antioquia',
      direccion: 'Calle 50 #45-12',
      telefono: '+57 312 456 7890',
      horario: 'Abierto 24 horas',
      urgencias24h: true,
      servicios: ['Urgencias 24h', 'Rayos X', 'Ecografía'],
      imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const veterinariasFiltradas = veterinarias.filter(v => {
    const coincideTexto = 
      v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.sector.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.direccion.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideUrgencias = filtroUrgencias === null || v.urgencias24h === filtroUrgencias;

    return coincideTexto && coincideUrgencias;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', color: '#1f2937' }}>
      
      {/* CABECERA DE LA SECCIÓN */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
          <span>🏥</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>RED DE SALUD ANIMAL</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          Veterinarias Aliadas
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Encuentra centros de atención médica, control de salud, vacunación y urgencias 24 horas cerca de ti.
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div style={{ background: '#ffffff', padding: '18px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre, sector o dirección..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: '260px', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '13px', outline: 'none' }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFiltroUrgencias(null)}
            style={{ padding: '0 16px', height: '44px', background: filtroUrgencias === null ? '#16a34a' : '#f9fafb', color: filtroUrgencias === null ? '#ffffff' : '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltroUrgencias(true)}
            style={{ padding: '0 16px', height: '44px', background: filtroUrgencias === true ? '#16a34a' : '#f9fafb', color: filtroUrgencias === true ? '#ffffff' : '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            🚨 Urgencias 24h
          </button>
        </div>
      </div>

      {/* LISTADO DE VETERINARIAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {veterinariasFiltradas.map((vet) => (
          <div key={vet.id} style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            
            {/* IMAGEN Y ETIQUETA DE URGENCIAS */}
            <div style={{ position: 'relative', height: '170px', background: '#f3f4f6' }}>
              <img src={vet.imagen} alt={vet.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: 700, 
                background: vet.urgencias24h ? '#fef2f2' : '#f0fdf4',
                color: vet.urgencias24h ? '#991b1b' : '#166534',
                border: `1px solid ${vet.urgencias24h ? '#fecaca' : '#bbf7d0'}`
              }}>
                {vet.urgencias24h ? '🚨 24 Horas' : '🟢 Horario Regular'}
              </span>
            </div>

            {/* CONTENIDO */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{vet.nombre}</h3>
              <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, margin: '0 0 12px' }}>📍 {vet.sector} ({vet.ciudad}) — {vet.direccion}</p>
              
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🕐</span> {vet.horario}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📞</span> <strong>{vet.telefono}</strong>
              </div>

              {/* SERVICIOS */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {vet.servicios.map((serv, idx) => (
                  <span key={idx} style={{ fontSize: '11px', background: '#f9fafb', color: '#4b5563', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500 }}>
                    {serv}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <Link 
                  href="/mapa" 
                  style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                >
                  Ver en Mapa
                </Link>
                <a 
                  href={`tel:${vet.telefono}`} 
                  style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#16a34a', color: '#ffffff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)' }}
                >
                  Llamar
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}