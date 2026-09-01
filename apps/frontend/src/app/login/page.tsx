'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

type Usuario = {
  id?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  role?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [usuarioExitoso, setUsuarioExitoso] = useState<Usuario | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

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

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setCargando(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: correoLimpio,
        password,
      });

      const res = response.data;
      const token = res?.token || res?.access_token || res?.accessToken;

      if (!token) {
        throw new Error('No se recibió el token de autenticación.');
      }

      const usuario: Usuario =
        res?.usuario || res?.user || res?.data?.usuario || res?.data?.user;

      if (!usuario) {
        throw new Error('No se recibió la información del usuario.');
      }

      const rolUsuario = (usuario.rol || usuario.role || 'CIUDADANO').toUpperCase();
      const rolesValidos = ['CIUDADANO', 'ADMINISTRADOR', 'REFUGIO', 'VETERINARIA'];

      if (!rolesValidos.includes(rolUsuario)) {
        throw new Error('El usuario tiene un rol no válido.');
      }

      localStorage.setItem('vecipets_access_token', token);

      const usuarioGuardado = {
        ...usuario,
        rol: rolUsuario,
      };

      localStorage.setItem('vecipets_usuario', JSON.stringify(usuarioGuardado));
      setUsuarioExitoso(usuarioGuardado);

      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
          return;
        }

        switch (rolUsuario) {
          case 'CIUDADANO':
            router.push('/perfil');
            break;
          case 'ADMINISTRADOR':
            router.push('/admin');
            break;
          case 'REFUGIO':
            router.push('/refugios');
            break;
          case 'VETERINARIA':
            router.push('/veterinaria');
            break;
          default:
            router.push('/perfil');
        }
      }, 1400);

    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      let mensaje = 'Correo o contraseña incorrectos. Verifica tus credenciales.';

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

  const nombreMostrar = usuarioExitoso?.nombre
    ? `${usuarioExitoso.nombre} ${usuarioExitoso.apellido || ''}`.trim()
    : usuarioExitoso?.email || 'Usuario';

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
      <div 
        style={{ 
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6'
        }}
      >
        {/* ENCABEZADO ESTILO REGISTRO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px' }}>🐾</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>VeciPets Comunidad</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
            ¡Bienvenido de nuevo!
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Ingresa tus datos para continuar ayudando a las mascotas.
          </p>
        </div>

        {usuarioExitoso ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ margin: '0 0 6px', color: '#166534', fontSize: '18px', fontWeight: 700 }}>
                ¡Bienvenido, {nombreMostrar}!
              </h3>
              <p style={{ margin: '0 0 12px', color: '#15803d', fontSize: '13px' }}>
                Sesión iniciada correctamente.
              </p>
              <div style={{ display: 'inline-block', background: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {usuarioExitoso.rol}
              </div>
              <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Cargando tu panel principal...
              </p>
            </div>
          </div>
        ) : (
          <div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* CORREO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>✉️</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                    style={{ 
                      height: '46px', 
                      padding: '0 16px 0 42px', 
                      fontSize: '14px', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb', 
                      background: '#f9fafb',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* CONTRASEÑA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Contraseña
                  </label>
                  <Link
                    href="/recuperar-password"
                    style={{ fontSize: '12px', color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>🔒</span>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ 
                      height: '46px', 
                      padding: '0 44px 0 42px', 
                      fontSize: '14px', 
                      width: '100%', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb', 
                      background: '#f9fafb',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: '0',
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    {mostrarPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* BOTÓN INICIAR SESIÓN */}
              <button
                type="submit"
                disabled={cargando}
                style={{ 
                  width: '100%', 
                  height: '48px', 
                  marginTop: '8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: cargando ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                  transition: 'background 0.2s'
                }}
              >
                <span>🚀</span> {cargando ? 'Verificando...' : 'Iniciar sesión'}
              </button>
            </form>

            {/* SEPARADOR */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#9ca3af', fontSize: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }}></div>
              <span style={{ padding: '0 12px' }}>o continúa con</span>
              <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }}></div>
            </div>

            {/* BOTONES SOCIALES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button style={{ height: '40px', border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🌐</span> Google
              </button>
              <button style={{ height: '40px', border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>f</span> Facebook
              </button>
              <button style={{ height: '40px', border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}></span> Apple
              </button>
            </div>

            {/* REGISTRO */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>
                ¿No tienes cuenta?{' '}
                <Link href="/registro" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700 }}>
                  Regístrate aquí ›
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Suspense fallback={<div style={{ color: '#4b5563' }}>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}