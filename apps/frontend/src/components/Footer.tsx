import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ 
      background: '#064e3b', // Verde esmeralda muy oscuro (casi negro) para contrastar
      color: '#ffffff', 
      position: 'relative', 
      overflow: 'hidden', 
      padding: '80px 20px 20px',
      marginTop: 'auto' // Empuja el footer al fondo
    }}>
      
      {/* 🐾 DECORACIÓN DE FONDO (Patitas con baja opacidad) */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '120px', opacity: 0.03, transform: 'rotate(-15deg)' }}>🐾</div>
      <div style={{ position: 'absolute', top: '40%', right: '10%', fontSize: '80px', opacity: 0.03, transform: 'rotate(25deg)' }}>🐾</div>
      <div style={{ position: 'absolute', bottom: '15%', left: '40%', fontSize: '100px', opacity: 0.03, transform: 'rotate(10deg)' }}>🐾</div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '60px', /* Mucho espacio entre columnas */
        position: 'relative',
        zIndex: 10,
        paddingBottom: '60px'
      }}>
        
        {/* COLUMNA 1: VECIPETS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Logo Blanco/Verde/Naranja */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo-vecipets.png"
              alt="VeciPets Logo"
              width={762}
              height={840}
              priority
              style={{ height: '48px', width: 'auto', objectFit: 'contain', backgroundColor: 'transparent' }}
            />
          </Link>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80' }}>
              Unidos por cada huella.
            </span>
            <p style={{ fontSize: '14px', color: '#bbf7d0', margin: 0, lineHeight: '1.6' }}>
              Una plataforma comunitaria dedicada a conectar personas para proteger, cuidar y encontrar a los animales de nuestra ciudad.
            </p>
          </div>

          {/* Íconos de redes sociales */}
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
            <Link href="/reportes" style={{ color: '#bbf7d0', textDecoration: 'none', fontSize: '14px' }}>Mascotas perdidas</Link>
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
        borderTop: '1px solid rgba(251, 146, 60, 0.3)', // Línea naranja sutil
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
  );
}