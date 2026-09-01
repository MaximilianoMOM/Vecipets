'use client';

import { useState } from 'react';
import './globals.css';
import Link from 'next/link';
import ModalRequiereRegistro from '@/components/ModalRequiereRegistro';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioLogueado] = useState(false); // Simulación de sesión

  const manejarClickRegistrar = (e: React.MouseEvent) => {
    if (!usuarioLogueado) {
      e.preventDefault(); // Evita que abra la página si no ha iniciado sesión
      setModalAbierto(true); // Muestra el modal de aviso
    }
  };

  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#f8fafc', fontFamily: 'system-ui, sans-serif', color: '#1f2937', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* NAVBAR GLOBAL DE VECIPETS */}
        <header style={{ 
          background: '#ffffff', 
          borderBottom: '1px solid #e5e7eb', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '14px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            
            {/* LOGO Y SLOGAN */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#f0fdf4', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '20px',
                border: '1px solid #bbf7d0'
              }}>
                🐾
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', display: 'block', lineHeight: '1.2' }}>
                  VeciPets
                </span>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                  Unidos por cada huella
                </span>
              </div>
            </Link>

            {/* ENLACES DE NAVEGACIÓN PÚBLICA */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { name: 'Inicio', href: '/' },
                { name: 'Mapa', href: '/mapa' },
                { name: 'Mascotas', href: '/mascotas' },
                { name: 'Veterinarias', href: '/veterinarias' },
                { name: 'Refugios', href: '/refugios' },
                { name: 'Consejos', href: '/consejos' },
                { name: 'Eventos', href: '/eventos' },
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: item.name === 'Mapa' ? '#166534' : '#4b5563',
                    background: item.name === 'Mapa' ? '#f0fdf4' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* ACCIONES DE USUARIO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              <Link 
                href="/mascotas/registrar"
                onClick={manejarClickRegistrar}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#166534',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  textDecoration: 'none'
                }}
              >
                + Registrar Mascota
              </Link>

              <Link 
                href="/perfil"
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none'
                }}
              >
                👤 Ver Perfil
              </Link>

              <Link 
                href="/login"
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4b5563',
                  textDecoration: 'none'
                }}
              >
                Iniciar Sesión
              </Link>

              <Link 
                href="/registro"
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: '#16a34a',
                  textDecoration: 'none',
                  boxShadow: '0 2px 5px rgba(22, 163, 74, 0.2)'
                }}
              >
                Registrarse
              </Link>
            </div>

          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* FOOTER GLOBAL MEJORADO */}
        <footer style={{ 
          background: '#064e3b', 
          color: '#ffffff', 
          position: 'relative', 
          overflow: 'hidden', 
          padding: '80px 20px 20px',
          marginTop: 'auto'
        }}>
          
          {/* DECORACIÓN DE FONDO (Patitas) */}
          <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '120px', opacity: 0.03, transform: 'rotate(-15deg)' }}>🐾</div>
          <div style={{ position: 'absolute', top: '40%', right: '10%', fontSize: '80px', opacity: 0.03, transform: 'rotate(25deg)' }}>🐾</div>
          <div style={{ position: 'absolute', bottom: '15%', left: '40%', fontSize: '100px', opacity: 0.03, transform: 'rotate(10deg)' }}>🐾</div>

          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '60px', 
            position: 'relative',
            zIndex: 10,
            paddingBottom: '60px'
          }}>
            
            {/* COLUMNA 1: VECIPETS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px' }}>🐾</span>
                <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#ffffff' }}>Veci</span>
                  <span style={{ color: '#4ade80' }}>Pets</span>
                  <span style={{ color: '#fb923c' }}>.</span>
                </span>
              </Link>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80' }}>
                  Unidos por cada huella.
                </span>
                <p style={{ fontSize: '14px', color: '#bbf7d0', margin: 0, lineHeight: '1.6' }}>
                  Una plataforma comunitaria dedicada a conectar personas para proteger, cuidar y encontrar a los animales de nuestra ciudad.
                </p>
              </div>

              {/* Redes sociales */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                {['F', 'I', 'X'].map((social, i) => (
                  <a key={i} href="#" style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', background: '#022c22', border: '1px solid #047857',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', textDecoration: 'none', fontWeight: 'bold'
                  }}>
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* COLUMNA 2: NAVEGACIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Navegación</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Inicio</Link>
                <Link href="/reportar" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Reportar mascota</Link>
                <Link href="/mascotas" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Mascotas perdidas</Link>
                <Link href="/veterinarias" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Veterinarias</Link>
                <Link href="/refugios" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Refugios</Link>
                <Link href="/consejos" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Consejos</Link>
              </nav>
            </div>

            {/* COLUMNA 3: INFORMACIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Información</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/nosotros" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Sobre nosotros</Link>
                <Link href="/terminos" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Términos y condiciones</Link>
                <Link href="/privacidad" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Política de privacidad</Link>
                <Link href="/faq" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Preguntas frecuentes</Link>
              </nav>
            </div>

            {/* COLUMNA 4: ¿NECESITAS AYUDA? */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fb923c', margin: 0 }}>¿Necesitas ayuda?</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/ayuda" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Centro de ayuda</Link>
                <Link href="/contacto" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Contáctanos</Link>
                <a href="mailto:soporte@vecipets.com" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>soporte@vecipets.com</a>
              </nav>
            </div>

          </div>

          {/* COPYRIGHT CON LÍNEA NARANJA SUTIL */}
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            borderTop: '1px solid rgba(251, 146, 60, 0.3)', 
            paddingTop: '24px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <span style={{ fontSize: '13px', color: '#6ee7b7' }}>
              © 2026 VeciPets. Todos los derechos reservados.
            </span>
          </div>

        </footer>

        {/* MODAL DE RESTRICCIÓN DE REGISTRO GLOBAL */}
        <ModalRequiereRegistro 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          accion="registrar una mascota o participar en la comunidad"
        />

      </body>
    </html>
  );
}