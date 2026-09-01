'use client';

import Link from 'next/link';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  accion: string;
}

export default function ModalRequiereRegistro({ isOpen, onClose, accion }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '32px',
        borderRadius: '24px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f3f4f6',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
        
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
          ¡Regístrate para ayudar!
        </h3>
        
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.5' }}>
          Para <strong>{accion}</strong> necesitas tener una cuenta activa en VeciPets y unirte a nuestra red de apoyo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link 
            href="/registro"
            style={{
              padding: '12px',
              background: '#16a34a',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
            }}
          >
            Crear cuenta
          </Link>

          <Link 
            href="/login"
            style={{
              padding: '12px',
              background: '#f9fafb',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 500
            }}
          >
            Cancelar / Volver a explorar
          </button>
        </div>
      </div>
    </div>
  );
}