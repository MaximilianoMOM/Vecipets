'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function RecuperarPasswordPage() {
  const [paso, setPaso] = useState(1);

  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  // =========================
  // MANEJAR ERRORES
  // =========================

  const mostrarError = (err: any, mensajePorDefecto: string) => {
    console.error(err);

    let mensaje = mensajePorDefecto;

    if (err?.response?.data?.message) {
      const mensajeBackend = err.response.data.message;

      mensaje = Array.isArray(mensajeBackend)
        ? mensajeBackend.join(', ')
        : mensajeBackend;
    } else if (err?.message) {
      mensaje = err.message;
    }

    setError(mensaje);
  };

  // =========================
  // PASO 1
  // ENVIAR CORREO
  // =========================

  const handleEnviarCorreo = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
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
      await apiClient.post('/auth/forgot-password', {
        email: correoLimpio,
      });

      setEmail(correoLimpio);

      setMensajeExito(
        'Hemos enviado un código de verificación a tu correo electrónico. Revisa tu bandeja de entrada.',
      );

      setPaso(2);
    } catch (err: any) {
      mostrarError(
        err,
        'Ocurrió un error al intentar enviar el código. Inténtalo de nuevo.',
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // PASO 2
  // VERIFICAR CÓDIGO
  // =========================

  const handleVerificarCodigo = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError('');
    setMensajeExito('');

    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      setError('Por favor ingresa el código de verificación.');
      return;
    }

    if (!/^\d{6}$/.test(codigoLimpio)) {
      setError('El código debe tener exactamente 6 dígitos.');
      return;
    }

    setCargando(true);

    try {
      await apiClient.post('/auth/verify-reset-code', {
        email,
        codigo: codigoLimpio,
      });

      setMensajeExito(
        'Código verificado correctamente. Ahora puedes crear una nueva contraseña.',
      );

      setPaso(3);
    } catch (err: any) {
      mostrarError(
        err,
        'No fue posible verificar el código. Inténtalo nuevamente.',
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // PASO 3
  // CAMBIAR CONTRASEÑA
  // =========================

  const handleCambiarPassword = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError('');
    setMensajeExito('');

    if (!password) {
      setError('Por favor ingresa una nueva contraseña.');
      return;
    }

    if (password.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.',
      );
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        codigo,
        password,
      });

      setMensajeExito(
        'Tu contraseña ha sido actualizada correctamente.',
      );

      setPassword('');
      setConfirmarPassword('');
      setPaso(4);
    } catch (err: any) {
      mostrarError(
        err,
        'No fue posible cambiar la contraseña. Inténtalo nuevamente.',
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // VOLVER AL PASO ANTERIOR
  // =========================

  const volverPasoAnterior = () => {
    setError('');
    setMensajeExito('');

    if (paso === 2) {
      setCodigo('');
      setPaso(1);
    }

    if (paso === 3) {
      setPassword('');
      setConfirmarPassword('');
      setPaso(2);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f6f0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* =========================
          NAVBAR SUPERIOR
      ========================= */}

      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '28px' }}>🐶</span>

          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#f97316',
            }}
          >
            Veci
            <span style={{ color: '#111827' }}>
              Pets
            </span>
          </span>
        </div>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #d1d5db',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            textDecoration: 'none',
            color: '#374151',
            background: '#fff',
          }}
        >
          🏠 Volver al inicio
        </Link>
      </header>

      {/* =========================
          CONTENIDO CENTRAL
      ========================= */}

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow:
                '0 15px 35px rgba(0, 0, 0, 0.06)',
              border:
                '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            {/* =========================
                ENCABEZADO
            ========================= */}

            <div
              style={{
                textAlign: 'center',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  margin: '0 auto 12px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    '0 6px 16px rgba(0,0,0,0.06)',
                  border: '1px solid #edf2f7',
                }}
              >
                <span style={{ fontSize: '32px' }}>
                  {paso === 4 ? '✅' : '🔒'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 4px',
                }}
              >
                {paso === 1 &&
                  'Recuperar contraseña'}

                {paso === 2 &&
                  'Verificar código'}

                {paso === 3 &&
                  'Nueva contraseña'}

                {paso === 4 &&
                  '¡Contraseña actualizada!'}
              </h2>

              <div
                style={{
                  width: '32px',
                  height: '3px',
                  background: '#0d9488',
                  margin: '8px auto 8px',
                  borderRadius: '2px',
                }}
              ></div>

              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                {paso === 1 &&
                  'Ingresa tu correo y te enviaremos un código para recuperarla 🐾'}

                {paso === 2 &&
                  `Ingresa el código de 6 dígitos que enviamos a ${email}`}

                {paso === 3 &&
                  'Crea una nueva contraseña para tu cuenta.'}

                {paso === 4 &&
                  'Ya puedes iniciar sesión con tu nueva contraseña.'}
              </p>
            </div>

            {/* =========================
                MENSAJE DE ÉXITO
            ========================= */}

            {mensajeExito && paso !== 4 && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  color: '#166534',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                ✅ {mensajeExito}
              </div>
            )}

            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: '#991b1b',
                  fontSize: '13px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* =========================
                PASO 1
                CORREO
            ========================= */}

            {paso === 1 && (
              <form
                onSubmit={handleEnviarCorreo}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    Correo electrónico
                  </label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        fontSize: '15px',
                      }}
                    >
                      ✉️
                    </span>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="tucorreo@ejemplo.com"
                      style={{
                        height: '44px',
                        padding:
                          '0 14px 0 38px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        border:
                          '1px solid #d1d5db',
                        background: '#ffffff',
                        width: '100%',
                        boxSizing: 'border-box',
                        outline: 'none',
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
                    cursor: cargando
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: cargando ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow:
                      '0 4px 12px rgba(15, 81, 50, 0.2)',
                  }}
                >
                  <span>✉️</span>

                  {cargando
                    ? 'Enviando código...'
                    : 'Enviar código'}
                </button>
              </form>
            )}

            {/* =========================
                PASO 2
                CÓDIGO
            ========================= */}

            {paso === 2 && (
              <form
                onSubmit={handleVerificarCodigo}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    Código de verificación
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={codigo}
                    onChange={(e) =>
                      setCodigo(
                        e.target.value.replace(
                          /\D/g,
                          '',
                        ),
                      )
                    }
                    placeholder="Ejemplo: 504515"
                    style={{
                      height: '48px',
                      padding: '0 14px',
                      fontSize: '20px',
                      letterSpacing: '6px',
                      textAlign: 'center',
                      borderRadius: '10px',
                      border:
                        '1px solid #d1d5db',
                      background: '#ffffff',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />

                  <span
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      textAlign: 'center',
                    }}
                  >
                    El código es válido durante 10
                    minutos.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: '#0f5132',
                    color: 'white',
                    border: 'none',
                    cursor: cargando
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: cargando ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  🔐{' '}
                  {cargando
                    ? 'Verificando...'
                    : 'Verificar código'}
                </button>

                <button
                  type="button"
                  onClick={volverPasoAnterior}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#374151',
                    border:
                      '1px solid #d1d5db',
                    cursor: 'pointer',
                  }}
                >
                  ← Cambiar correo
                </button>
              </form>
            )}

            {/* =========================
                PASO 3
                NUEVA CONTRASEÑA
            ========================= */}

            {paso === 3 && (
              <form
                onSubmit={handleCambiarPassword}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    Nueva contraseña
                  </label>

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Ingresa tu nueva contraseña"
                    style={{
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '13px',
                      borderRadius: '10px',
                      border:
                        '1px solid #d1d5db',
                      background: '#ffffff',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    Confirmar contraseña
                  </label>

                  <input
                    type="password"
                    required
                    value={confirmarPassword}
                    onChange={(e) =>
                      setConfirmarPassword(
                        e.target.value,
                      )
                    }
                    placeholder="Repite tu nueva contraseña"
                    style={{
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '13px',
                      borderRadius: '10px',
                      border:
                        '1px solid #d1d5db',
                      background: '#ffffff',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                  }}
                >
                  La contraseña debe tener al menos
                  6 caracteres.
                </span>

                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: '#0f5132',
                    color: 'white',
                    border: 'none',
                    cursor: cargando
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: cargando ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  🔑{' '}
                  {cargando
                    ? 'Actualizando...'
                    : 'Cambiar contraseña'}
                </button>

                <button
                  type="button"
                  onClick={volverPasoAnterior}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#374151',
                    border:
                      '1px solid #d1d5db',
                    cursor: 'pointer',
                  }}
                >
                  ← Volver al código
                </button>
              </form>
            )}

            {/* =========================
                PASO 4
                ÉXITO
            ========================= */}

            {paso === 4 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    background: '#f0fdf4',
                    border:
                      '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#166534',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  ✅ Tu contraseña ha sido
                  actualizada correctamente.
                </div>

                <Link
                  href="/login"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: '#0f5132',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  🔐 Iniciar sesión
                </Link>
              </div>
            )}

            {/* =========================
                REGRESAR AL LOGIN
            ========================= */}

            {paso !== 4 && (
              <div
                style={{
                  marginTop: '20px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#4b5563',
                  }}
                >
                  ¿Recordaste tu contraseña?{' '}

                  <Link
                    href="/login"
                    style={{
                      color: '#0f5132',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Inicia sesión aquí ›
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer
        style={{
          background: '#072e1c',
          color: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          fontSize: '11px',
        }}
      >
        VeciPets · Unidos por cada huella 🐾
      </footer>
    </div>
  );
}