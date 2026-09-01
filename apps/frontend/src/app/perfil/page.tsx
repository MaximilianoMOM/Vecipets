'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificamos el token de autenticación en localStorage
    const token = localStorage.getItem('vecipets_access_token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Cargamos los datos del usuario logueado (o simulamos con la estructura provista)
    const storedUser = localStorage.getItem('vecipets_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Si el objeto almacenado es un array (como el JSON que enviaste), tomamos el primer elemento
        const userObject = Array.isArray(parsed) ? parsed[0] : parsed;
        setUserData(userObject);
      } catch (err) {
        console.error('Error al parsear el usuario:', err);
      }
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', color: '#64748b', fontWeight: '600' }}>
        Cargando perfil desde la base de datos...
      </div>
    );
  }

  // Datos por defecto si aún no hay sesión completa cargada
  const name = userData?.nombreCompleto || 'Juan Perez';
  const email = userData?.email || 'juan@example.com';
  const telefono = userData?.telefono || '3001234567';
  const roleName = userData?.role?.nombre || 'CIUDADANO';
  const totalMascotas = userData?.mascotas?.length || 0;
  const totalReportes = userData?.reportes?.length || 0;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f6', fontFamily: 'Arial, sans-serif', color: '#1e293b' }}>
      
      {/* 1. NAVBAR SUPERIOR */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '24px' }}>🐾</div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', display: 'block', lineHeight: 1 }}>Veci<span style={{ color: '#0d9488' }}>Pets</span></span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Unidos por cada huella</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Inicio</Link>
          <Link href="/mascotas" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Alertas</Link>
          <Link href="/registrar-mascota" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Reportar</Link>
          <Link href="/mapa" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Mapa</Link>
          <Link href="/perfil" style={{ fontSize: '14px', fontWeight: '700', color: '#0d9488', textDecoration: 'none' }}>👤 Mi Perfil</Link>
        </div>

        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* 2. CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* COLUMNA IZQUIERDA: MENÚ LATERAL */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            {[
              { icon: '👤', label: 'Mi perfil', active: true },
              { icon: '🐶', label: 'Mis mascotas' },
              { icon: '📄', label: 'Mis reportes' },
              { icon: '📅', label: 'Recordatorios' },
              { icon: '⚙️', label: 'Información personal' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: item.active ? '#d1fae5' : 'transparent',
                  color: item.active ? '#065f46' : '#475569',
                  fontWeight: item.active ? '700' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '4px'
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* COLUMNA DERECHA: PERFIL DINÁMICO DESDE LA BD */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tarjeta de Información del Usuario */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', border: '3px solid #ccfbf1' }}>
                {initial}
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{name}</h1>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                    {roleName}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                  <div>📍 Medellín, Antioquia</div>
                  <div>✉️ {email}</div>
                  <div>📞 {telefono}</div>
                  <div style={{ color: '#10b981', fontWeight: '700' }}>✔ Estado: {userData?.estado || 'APROBADO'}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Estadísticas vinculadas a la Base de Datos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{totalMascotas}</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Mascotas registradas en la base de datos</div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{totalReportes}</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Reportes generados en la red comunitaria</div>
            </div>
          </div>

          {/* Sección de Mascotas Asociadas */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Mis mascotas vinculadas</h3>
            {totalMascotas > 0 ? (
              userData.mascotas.map((m: any, idx: number) => (
                <div key={m.id || idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                  🐾 Mascota ID: <strong>{m.id}</strong> (Registrada correctamente)
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No tienes mascotas registradas todavía.</p>
            )}
          </div>

        </main>

      </div>

    </div>
  );
}