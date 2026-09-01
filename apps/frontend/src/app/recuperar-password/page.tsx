'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    const correoLimpio = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoLimpio) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!emailRegex.test(correoLimpio)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    setCargando(true);

    try {
      // Petición al backend para solicitar la recuperación de contraseña
      await apiClient.post('/auth/forgot-password', {
        email: correoLimpio,
      });

      setMensajeExito(
        'Hemos enviado las instrucciones a tu correo electrónico para restablecer tu contraseña. Revisa tu bandeja de entrada.'
      );
      setEmail('');
    } catch (err: any) {
      console.error('Error al solicitar recuperación:', err);
      let mensaje = 'Ocurrió un error al intentar enviar el correo. Inténtalo de nuevo.';

      if (err?.response?.data?.message) {
        const mensajeBackend = err.response.data.message;
        mensaje = Array.isArray(mensajeBackend) ? mensajeBackend.join(', ') : mensajeBackend;
      } else if (err?.message) {
        mensaje = err.message;
      }

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f0', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* NAVBAR SUPERIOR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🐶</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#f97316' }}>Veci<span style={{ color: '#111827' }}>Pets</span></span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #d1d5db', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', color: '#374151', background: '#fff' }}>
          🏠 Volver al inicio
        </Link>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div 
            style={{ 
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                margin: '0 auto 12px', 
                background: '#ffffff', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                border: '1px solid #edf2f7'
              }}>
                <span style={{ fontSize: '32px' }}>🔒</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                Recuperar contraseña
              </h2>
              <div style={{ width: '32px', height: '3px', background: '#0d9488', margin: '8px auto 8px', borderRadius: '2px' }}></div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Ingresa tu correo y te enviaremos los pasos para recuperarla 🐾
              </p>
            </div>

            {/* MENSAJE DE ÉXITO */}
            {mensajeExito && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#166534', fontSize: '13px', lineHeight: '1.5' }}>
                ✅ {mensajeExito}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>✉️</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    style={{ 
                      height: '44px', 
                      padding: '0 14px 0 38px', 
                      fontSize: '13px', 
                      borderRadius: '10px', 
                      border: '1px solid #d1d5db', 
                      background: '#ffffff',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                style={{ 
                  width: '100%', 
                  height: '46px', 
                  marginTop: '4px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: '#0f5132',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: cargando ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 81, 50, 0.2)'
                }}
              >
                <span>✉️</span> {cargando ? 'Enviando instrucciones...' : 'Enviar instrucciones'}
              </button>
            </form>

            {/* REGRESAR AL LOGIN */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" style={{ color: '#0f5132', textDecoration: 'none', fontWeight: 700 }}>
                  Inicia sesión aquí ›
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BÁSICO */}
      <footer style={{ background: '#072e1c', color: '#ffffff', padding: '20px', textAlign: 'center', fontSize: '11px' }}>
        VeciPets · Unidos por cada huella 🐾
      </footer>
    </div>
  );
}