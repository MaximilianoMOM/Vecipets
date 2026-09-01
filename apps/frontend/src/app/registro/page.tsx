'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

type Rol = 'CIUDADANO' | 'REFUGIO' | 'VETERINARIA';

interface RegisterPayload {
  nombreCompleto: string;
  email: string;
  password: string;
  telefono: string;
  rol: Rol;
  nombreEntidad?: string;
  direccion?: string;
  redesSociales?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<Rol>('CIUDADANO');

  const [nombreEntidad, setNombreEntidad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [redesSociales, setRedesSociales] = useState('');

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] =
    useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const esEntidad = rol === 'REFUGIO' || rol === 'VETERINARIA';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // VALIDAR NOMBRE
    if (!nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }

    // VALIDAR ENTIDAD
    if (esEntidad && !nombreEntidad.trim()) {
      setError(
        'El nombre de la entidad / refugio / veterinaria es obligatorio'
      );
      return;
    }

    // VALIDAR CORREO
    if (!email.trim() || !email.includes('@')) {
      setError('El correo electrónico no es válido');
      return;
    }

    // VALIDAR CONTRASEÑA
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // CONFIRMAR CONTRASEÑA
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // VALIDAR TELÉFONO
    const telefonoLimpio = telefono.replace(/\D/g, '');

    if (!telefonoLimpio) {
      setError('El teléfono es obligatorio');
      return;
    }

    if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15) {
      setError('El número de teléfono no es válido');
      return;
    }

    // VALIDAR DIRECCIÓN PARA ENTIDADES
    if (esEntidad && !direccion.trim()) {
      setError(
        'La dirección física es obligatoria para refugios y veterinarias'
      );
      return;
    }

    setCargando(true);

    try {
      const payload: RegisterPayload = {
        nombreCompleto: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefonoLimpio,
        rol,
      };

      if (esEntidad) {
        payload.nombreEntidad = nombreEntidad.trim();
        payload.direccion = direccion.trim();

        if (redesSociales.trim()) {
          payload.redesSociales = redesSociales.trim();
        }
      }

      await apiClient.post('/auth/register', payload);

      setExito(true);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error al registrarse:', err);

      let mensaje =
        'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.';

      const errorAxios = err as {
        response?: {
          data?: {
            message?: string | string[];
          };
        };
        message?: string;
      };

      if (errorAxios?.response?.data?.message) {
        const mensajeBackend = errorAxios.response.data.message;

        mensaje = Array.isArray(mensajeBackend)
          ? mensajeBackend.join(', ')
          : mensajeBackend;
      } else if (errorAxios?.message) {
        mensaje = errorAxios.message;
      }

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          '#f8fafc url("/360_F_627255132_MoI31drEEK4SdyrNsC6tx53ooEUxhdsL.jpg") repeat',
        backgroundSize: '280px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* NAVBAR SUPERIOR */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
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
            Veci<span style={{ color: '#111827' }}>Pets</span>
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

      {/* CONTENIDO CENTRAL */}
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
            maxWidth: '460px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(4px)',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            {/* ENCABEZADO */}
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
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  border: '1px solid #edf2f7',
                }}
              >
                <span style={{ fontSize: '32px' }}>🐾</span>
              </div>

              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 4px',
                }}
              >
                Crea tu cuenta
              </h2>

              <div
                style={{
                  width: '32px',
                  height: '3px',
                  background: '#0d9488',
                  margin: '8px auto',
                  borderRadius: '2px',
                }}
              />

              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                Únete a nuestra red de protección animal en Medellín 💚
              </p>
            </div>

            {/* MENSAJE DE ÉXITO */}
            {exito ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 0',
                }}
              >
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '36px',
                      marginBottom: '8px',
                    }}
                  >
                    🎉
                  </div>

                  <h3
                    style={{
                      margin: '0 0 6px',
                      color: '#166534',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    ¡Registro exitoso!
                  </h3>

                  <p
                    style={{
                      margin: '0 0 12px',
                      color: '#15803d',
                      fontSize: '13px',
                    }}
                  >
                    Tu cuenta ha sido creada correctamente.
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* ERROR */}
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

                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* TIPO DE ROL */}
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
                      Tipo de cuenta (Rol){' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        👥
                      </span>

                      <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value as Rol)}
                        style={{
                          height: '44px',
                          padding: '0 14px 0 38px',
                          fontSize: '13px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          width: '100%',
                          boxSizing: 'border-box',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="CIUDADANO">
                          Ciudadano (Protector / Dueño)
                        </option>

                        <option value="REFUGIO">
                          Refugio / Fundación
                        </option>

                        <option value="VETERINARIA">
                          Veterinaria
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* CAMPOS PARA REFUGIO / VETERINARIA */}
                  {esEntidad && (
                    <>
                      {/* NOMBRE DE ENTIDAD */}
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
                          {rol === 'REFUGIO'
                            ? 'Nombre del Refugio / Fundación'
                            : 'Nombre de la Veterinaria'}{' '}
                          <span style={{ color: '#0d9488' }}>*</span>
                        </label>

                        <div style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '15px',
                            }}
                          >
                            🏢
                          </span>

                          <input
                            type="text"
                            required={esEntidad}
                            value={nombreEntidad}
                            onChange={(e) =>
                              setNombreEntidad(e.target.value)
                            }
                            placeholder={
                              rol === 'REFUGIO'
                                ? 'Ej. Fundación Huellitas de Amor'
                                : 'Ej. Veterinaria Mi Mascota'
                            }
                            style={{
                              height: '44px',
                              padding: '0 14px 0 38px',
                              fontSize: '13px',
                              borderRadius: '10px',
                              border: '1px solid #d1d5db',
                              background: '#ffffff',
                              width: '100%',
                              boxSizing: 'border-box',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* DIRECCIÓN */}
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
                          Dirección física{' '}
                          <span style={{ color: '#0d9488' }}>*</span>
                        </label>

                        <div style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '15px',
                            }}
                          >
                            📍
                          </span>

                          <input
                            type="text"
                            required={esEntidad}
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            placeholder="Ej. Calle 50 # 70-20, Medellín"
                            style={{
                              height: '44px',
                              padding: '0 14px 0 38px',
                              fontSize: '13px',
                              borderRadius: '10px',
                              border: '1px solid #d1d5db',
                              background: '#ffffff',
                              width: '100%',
                              boxSizing: 'border-box',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* REDES SOCIALES */}
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
                          Redes sociales o Sitio web (Opcional)
                        </label>

                        <div style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '15px',
                            }}
                          >
                            🌐
                          </span>

                          <input
                            type="text"
                            value={redesSociales}
                            onChange={(e) =>
                              setRedesSociales(e.target.value)
                            }
                            placeholder="Ej. @huellitasmedellin"
                            style={{
                              height: '44px',
                              padding: '0 14px 0 38px',
                              fontSize: '13px',
                              borderRadius: '10px',
                              border: '1px solid #d1d5db',
                              background: '#ffffff',
                              width: '100%',
                              boxSizing: 'border-box',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* NOMBRE COMPLETO */}
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
                      {esEntidad
                        ? 'Nombre del Representante / Contacto'
                        : 'Nombre completo'}{' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        👤
                      </span>

                      <input
                        type="text"
                        required
                        value={nombreCompleto}
                        onChange={(e) =>
                          setNombreCompleto(e.target.value)
                        }
                        placeholder={
                          esEntidad
                            ? 'Ej. Ana María Pérez'
                            : 'Ej. Ana María Pérez'
                        }
                        style={{
                          height: '44px',
                          padding: '0 14px 0 38px',
                          fontSize: '13px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          width: '100%',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* CORREO */}
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
                      Correo electrónico{' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        ✉️
                      </span>

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
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* TELÉFONO */}
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
                      Teléfono de contacto{' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        📞
                      </span>

                      <input
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej. 3001234567"
                        style={{
                          height: '44px',
                          padding: '0 14px 0 38px',
                          fontSize: '13px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          width: '100%',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* CONTRASEÑA */}
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
                      Contraseña{' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        🔒
                      </span>

                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        style={{
                          height: '44px',
                          padding: '0 40px 0 38px',
                          fontSize: '13px',
                          width: '100%',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarPassword(!mostrarPassword)
                        }
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: '0',
                          fontSize: '15px',
                          cursor: 'pointer',
                        }}
                        aria-label={
                          mostrarPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                      >
                        {mostrarPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRMAR CONTRASEÑA */}
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
                      Confirmar contraseña{' '}
                      <span style={{ color: '#0d9488' }}>*</span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '15px',
                        }}
                      >
                        🔐
                      </span>

                      <input
                        type={
                          mostrarConfirmarPassword ? 'text' : 'password'
                        }
                        required
                        minLength={8}
                        value={confirmarPassword}
                        onChange={(e) =>
                          setConfirmarPassword(e.target.value)
                        }
                        placeholder="Repite tu contraseña"
                        style={{
                          height: '44px',
                          padding: '0 40px 0 38px',
                          fontSize: '13px',
                          width: '100%',
                          borderRadius: '10px',
                          border:
                            confirmarPassword &&
                            confirmarPassword !== password
                              ? '1px solid #ef4444'
                              : '1px solid #d1d5db',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarConfirmarPassword(
                            !mostrarConfirmarPassword
                          )
                        }
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: '0',
                          fontSize: '15px',
                          cursor: 'pointer',
                        }}
                        aria-label={
                          mostrarConfirmarPassword
                            ? 'Ocultar confirmación de contraseña'
                            : 'Mostrar confirmación de contraseña'
                        }
                      >
                        {mostrarConfirmarPassword ? '👁️' : '🙈'}
                      </button>
                    </div>

                    {confirmarPassword &&
                      confirmarPassword !== password && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#dc2626',
                          }}
                        >
                          Las contraseñas no coinciden
                        </span>
                      )}
                  </div>

                  {/* BOTÓN CREAR CUENTA */}
                  <button
                    type="submit"
                    disabled={cargando}
                    style={{
                      width: '100%',
                      height: '46px',
                      marginTop: '8px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: '#0f5132',
                      color: 'white',
                      border: 'none',
                      cursor: cargando ? 'not-allowed' : 'pointer',
                      opacity: cargando ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow:
                        '0 4px 12px rgba(15, 81, 50, 0.2)',
                    }}
                  >
                    <span>🐾</span>

                    {cargando
                      ? 'Registrando cuenta...'
                      : 'Crear cuenta gratis'}
                  </button>
                </form>

                {/* ENLACE PARA VOLVER AL LOGIN */}
                <div
                  style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#4b5563',
                    }}
                  >
                    ¿Ya tienes una cuenta?{' '}
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
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
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