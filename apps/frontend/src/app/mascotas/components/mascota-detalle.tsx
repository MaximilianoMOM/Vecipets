"use client";

import React, { useState } from "react";
import { Mascota } from "../types/mascota";

type Props = {
  mascota: Mascota;
  onClose: () => void;
};

export default function MascotaDetalle({ mascota, onClose }: Props) {
  const imagenesList = mascota.imagen ? [mascota.imagen] : [];
  const [fotoActivaIndex, setFotoActivaIndex] = useState(0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, Arial, sans-serif' }}>
      
      {/* Botón Volver */}
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: '700', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
      >
        ← Volver a resultados
      </button>

      {/* GRID PRINCIPAL DE DETALLES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', marginBottom: '24px' }}>
        
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', height: '420px' }}>
            {imagenesList.length > 0 ? (
              <img 
                src={imagenesList[fotoActivaIndex]} 
                alt={mascota.nombre} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontSize: '48px' }}>
                🐾
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN CLAVE Y BOTÓN */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
              {mascota.nombre || "Mascota sin nombre"}
            </h1>
            <span style={{ 
              background: mascota.tipo === "perdida" ? '#fee2e2' : '#dcfce7', 
              color: mascota.tipo === "perdida" ? '#b91c1c' : '#15803d', 
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' 
            }}>
              {mascota.tipo === "perdida" ? "En búsqueda" : "Encontrada"}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            {mascota.raza} | {mascota.sexo} | {mascota.especie}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>📅 Fecha:</span>
              <span style={{ fontWeight: '600' }}>{mascota.fecha}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>📍 Lugar:</span>
              <span style={{ fontWeight: '600', textAlign: 'right' }}>{mascota.sector}, {mascota.ciudad}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>🎨 Color:</span>
              <span style={{ fontWeight: '600' }}>{mascota.color}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>📏 Tamaño:</span>
              <span style={{ fontWeight: '600' }}>{mascota.tamaño}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <span style={{ color: '#64748b' }}>⏳ Estado:</span>
              <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                {mascota.tipo === "perdida" ? "En búsqueda" : "Resguardado"}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>🆔 ID del reporte:</span>
              <span style={{ fontWeight: '600' }}>#{mascota.id}</span>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN (SOLO COMPARTIR) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: mascota.nombre, url: window.location.href });
                } else {
                  alert("Enlace copiado al portapapeles");
                }
              }}
              style={{ background: 'white', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              🔗 Compartir
            </button>
          </div>
        </div>

      </div>

      {/* SECCIONES INFERIORES: DESCRIPCIÓN Y REPORTANTE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Tarjeta Descripción */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            📄 Descripción
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
            {mascota.descripcion || "Sin descripción detallada."}
          </p>
        </div>

        {/* Tarjeta Información del Reportante */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            👤 Información del reportante
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Vecino colaborador</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Comunidad VeciPets</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}