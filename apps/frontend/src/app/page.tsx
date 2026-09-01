'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ModalRequiereRegistro from '@/components/ModalRequiereRegistro';

export default function HomePage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioLogueado] = useState(false); // Simulación de sesión

  const manejarAccionProtegida = (e: React.MouseEvent) => {
    if (!usuarioLogueado) {
      e.preventDefault();
      setModalAbierto(true);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', color: '#1f2937' }}>
      
      {/* 1. SECCIÓN PRINCIPAL (HERO INFORMATIVO) */}
      <section style={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
        border: '1px solid #bbf7d0', 
        borderRadius: '32px', 
        padding: '56px 40px', 
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '20px',
        boxShadow: '0 10px 30px rgba(22, 163, 74, 0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '160px', opacity: 0.04, pointerEvents: 'none' }}>🐾</div>

        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: '#ffffff', 
          padding: '6px 16px', 
          borderRadius: '20px', 
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}>
          <span>🌟</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', letterSpacing: '0.5px' }}>
            ¿QUÉ ES VECIPETS?
          </span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', margin: 0, lineHeight: '1.2', maxWidth: '750px' }}>
          La red de apoyo y protección animal para nuestra comunidad.
        </h1>

        <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, maxWidth: '650px', lineHeight: '1.6' }}>
          <strong>VeciPets</strong> es una plataforma colaborativa diseñada para unir a vecinos, refugios y centros veterinarios. Nuestro objetivo es actuar con rapidez ante emergencias, facilitar la búsqueda de mascotas perdidas y conectar hogares solidarios con animales que necesitan una segunda oportunidad.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', zIndex: 1 }}>
          <Link 
            href="/mapa"
            style={{ 
              padding: '14px 24px', 
              background: '#16a34a', 
              color: '#ffffff', 
              borderRadius: '14px', 
              fontSize: '14px', 
              fontWeight: 700, 
              textDecoration: 'none', 
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🗺️ Ir al Mapa Interactivo
          </Link>

          <Link 
            href="/mascotas/registrar"
            onClick={manejarAccionProtegida}
            style={{ 
              padding: '14px 24px', 
              background: '#ffffff', 
              color: '#166534', 
              border: '1px solid #bbf7d0', 
              borderRadius: '14px', 
              fontSize: '14px', 
              fontWeight: 700, 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}
          >
            🚨 Reportar Mascota Perdida
          </Link>
        </div>
      </section>

      {/* 2. PILARES INFORMATIVOS (¿Qué integramos?) */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
            Los tres pilares de nuestra red
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Conectamos los recursos esenciales del sector animal en un solo lugar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>
              🐶
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Mascotas y Adopciones</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
              Publica reportes inmediatos si tu mascota se extravió o difunde avisos de animales rescatados que buscan un hogar responsable.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <div style={{ width: '44px', height: '44px', background: '#fdf2f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>
              🏥
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Veterinarias Aliadas</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
              Encuentra centros médicos veterinarios de confianza cerca de tu ubicación, incluyendo servicios de urgencias disponibles.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>
              🏡
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Refugios y Rescate</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
              Apoya la labor de fundaciones locales, conoce sus hogares de paso y entérate de cómo colaborar con donaciones o voluntariado.
            </p>
          </div>

        </div>
      </section>

      {/* 3. SECCIÓN DE VALORES / CÓMO CONTRIBUIR */}
      <section style={{ 
        background: '#f8fafc', 
        borderRadius: '24px', 
        padding: '32px', 
        border: '1px solid #e2e8f0', 
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
          💡 ¿Por qué unirse a VeciPets?
        </h2>
        <p style={{ fontSize: '14px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
          La solidaridad vecinal salva vidas. Al registrarte y participar, ayudas a reducir el tiempo de respuesta ante casos de pérdida animal, fortaleces la red de protección local y promueves una cultura de tenencia responsable y empatía en tu comunidad.
        </p>
      </section>

      {/* MODAL DE RESTRICCIÓN DE REGISTRO */}
      <ModalRequiereRegistro 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        accion="registrar una mascota y unirte a la red comunitaria"
      />

    </div>
  );
}