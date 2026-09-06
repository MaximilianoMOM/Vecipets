
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authAPI } from '@/lib/api-client';

type Rol = 'CIUDADANO' | 'REFUGIO' | 'VETERINARIA';

export default function RegistroPage() {
  const router = useRouter();
  const { mostrarToast } = useToast();

  // ==========================================
  // DATOS BÁSICOS
  // ==========================================

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [rol, setRol] = useState<Rol>('CIUDADANO');

  // ==========================================
  // DATOS DE REFUGIO
  // ==========================================

  const [nombreRefugio, setNombreRefugio] = useState('');
  const [capacidadRefugio, setCapacidadRefugio] = useState('');
  const [horarioRefugio, setHorarioRefugio] = useState('');
  const [sitioWebRefugio, setSitioWebRefugio] = useState('');

  // ==========================================
  // DATOS DE VETERINARIA
  // ==========================================

  const [nombreVeterinaria, setNombreVeterinaria] = useState('');
  const [urgencias24h, setUrgencias24h] = useState(false);
  const [horarioVeterinaria, setHorarioVeterinaria] = useState('');

  // ==========================================
  // UBICACIÓN
  // ==========================================

  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [barrio, setBarrio] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  // ==========================================
  // ESTADOS
  // ==========================================

  const [cargando, setCargando] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // ==========================================
  // CAMBIAR ROL
  // ==========================================

  const cambiarRol = (nuevoRol: Rol) => {
    setRol(nuevoRol);

    if (nuevoRol === 'CIUDADANO') {
      setNombreRefugio('');
      setCapacidadRefugio('');
      setHorarioRefugio('');
      setSitioWebRefugio('');

      setNombreVeterinaria('');
      setUrgencias24h(false);
      setHorarioVeterinaria('');

      setDireccion('');
      setComuna('');
      setBarrio('');
      setLatitud('');
      setLongitud('');
    }

    if (nuevoRol === 'REFUGIO') {
      setNombreVeterinaria('');
      setUrgencias24h(false);
      setHorarioVeterinaria('');
    }

    if (nuevoRol === 'VETERINARIA') {
      setNombreRefugio('');
      setCapacidadRefugio('');
      setHorarioRefugio('');
      setSitioWebRefugio('');
    }
  };

  // ==========================================
  // ANIMACIÓN DE ERROR
  // ==========================================

  const mostrarError = () => {
    setErrorShake(true);

    setTimeout(() => {
      setErrorShake(false);
    }, 500);
  };

  // ==========================================
  // VALIDAR REGISTRO
  // ==========================================

  const validarFormulario = () => {
    if (
      !nombreCompleto.trim() ||
      !email.trim() ||
      !pass ||
      !telefono.trim() ||
      !confirmPass
    ) {
      mostrarError();

      mostrarToast(
        'Por favor completa todos los campos requeridos.',
        'advertencia',
      );

      return false;
    }

    if (pass.length < 8) {
      mostrarError();

      mostrarToast(
        'La contraseña debe tener al menos 8 caracteres.',
        'advertencia',
      );

      return false;
    }

    if (pass !== confirmPass) {
      mostrarError();

      mostrarToast(
        'Las contraseñas no coinciden.',
        'error',
      );

      return false;
    }

    // ==========================================
    // VALIDACIONES REFUGIO
    // ==========================================

    if (rol === 'REFUGIO') {
      if (
        !nombreRefugio.trim() ||
        !capacidadRefugio ||
        !horarioRefugio.trim() ||
        !direccion.trim() ||
        !comuna.trim() ||
        !barrio.trim() ||
        !latitud.trim() ||
        !longitud.trim()
      ) {
        mostrarError();

        mostrarToast(
          'Completa todos los datos requeridos del refugio y su ubicación.',
          'advertencia',
        );

        return false;
      }

      if (Number(capacidadRefugio) < 1) {
        mostrarError();

        mostrarToast(
          'La capacidad del refugio debe ser mayor a 0.',
          'advertencia',
        );

        return false;
      }

      if (
        Number.isNaN(Number(latitud)) ||
        Number.isNaN(Number(longitud))
      ) {
        mostrarError();

        mostrarToast(
          'La latitud y longitud deben ser números válidos.',
          'advertencia',
        );

        return false;
      }
    }

    // ==========================================
    // VALIDACIONES VETERINARIA
    // ==========================================

    if (rol === 'VETERINARIA') {
      if (
        !nombreVeterinaria.trim() ||
        !horarioVeterinaria.trim() ||
        !direccion.trim() ||
        !comuna.trim() ||
        !barrio.trim() ||
        !latitud.trim() ||
        !longitud.trim()
      ) {
        mostrarError();

        mostrarToast(
          'Completa todos los datos requeridos de la veterinaria y su ubicación.',
          'advertencia',
        );

        return false;
      }

      if (
        Number.isNaN(Number(latitud)) ||
        Number.isNaN(Number(longitud))
      ) {
        mostrarError();

        mostrarToast(
          'La latitud y longitud deben ser números válidos.',
          'advertencia',
        );

        return false;
      }
    }

    return true;
  };

  // ==========================================
  // ENVIAR FORMULARIO
  // ==========================================

  const manejarSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const datosRegistro: any = {
        nombreCompleto: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        password: pass,
        telefono: telefono.trim(),
        rol,
      };

      // ========================================
      // DATOS REFUGIO
      // ========================================

      if (rol === 'REFUGIO') {
        datosRegistro.nombreRefugio =
          nombreRefugio.trim();

        datosRegistro.capacidadRefugio =
          Number(capacidadRefugio);

        datosRegistro.horarioRefugio =
          horarioRefugio.trim();

        if (sitioWebRefugio.trim()) {
          datosRegistro.sitioWebRefugio =
            sitioWebRefugio.trim();
        }

        datosRegistro.direccion =
          direccion.trim();

        datosRegistro.comuna =
          comuna.trim();

        datosRegistro.barrio =
          barrio.trim();

        datosRegistro.latitud =
          latitud.trim();

        datosRegistro.longitud =
          longitud.trim();
      }

      // ========================================
      // DATOS VETERINARIA
      // ========================================

      if (rol === 'VETERINARIA') {
        datosRegistro.nombreVeterinaria =
          nombreVeterinaria.trim();

        datosRegistro.urgencias24h =
          urgencias24h;

        datosRegistro.horarioVeterinaria =
          horarioVeterinaria.trim();

        datosRegistro.direccion =
          direccion.trim();

        datosRegistro.comuna =
          comuna.trim();

        datosRegistro.barrio =
          barrio.trim();

        datosRegistro.latitud =
          latitud.trim();

        datosRegistro.longitud =
          longitud.trim();
      }

      const res =
        await authAPI.register(datosRegistro);

      // ========================================
      // CIUDADANO
      // ========================================

      if (rol === 'CIUDADANO') {
        const token =
          res.accessToken || res.token;

        if (token) {
          localStorage.setItem(
            'token',
            token,
          );

          localStorage.setItem(
            'vecipets_access_token',
            token,
          );
        }

        const userData =
          res.usuario || res.user;

        if (userData) {
          localStorage.setItem(
            'vecipets_user',
            JSON.stringify({
              id: userData.id,
              nombre:
                ('nombreCompleto' in userData
                  ? userData.nombreCompleto
                  : (userData as any).nombre) ||
                nombreCompleto,
              email: userData.email,
              telefono,
              rol,
            }),
          );
        }

        mostrarToast(
          '¡Cuenta creada exitosamente! Bienvenido a VeciPets. 🐾',
          'exito',
        );

        router.push('/perfil');

        return;
      }

      // ========================================
      // REFUGIO / VETERINARIA
      // ========================================

      mostrarToast(
        rol === 'REFUGIO'
          ? '¡Solicitud enviada! Tu refugio será revisado por un administrador. 🏠'
          : '¡Solicitud enviada! Tu veterinaria será revisada por un administrador. 🏥',
        'exito',
      );

      // No guardamos token porque todavía está pendiente
      localStorage.removeItem('token');

      localStorage.removeItem(
        'vecipets_access_token',
      );

      router.push('/login');
    } catch (err: any) {
      console.error(
        'Error al registrar usuario:',
        err,
      );

      mostrarError();

      let mensaje =
        'Error al crear la cuenta. Inténtalo nuevamente.';

      if (Array.isArray(err?.message)) {
        mensaje = err.message.join(', ');
      } else if (err?.message) {
        mensaje = err.message;
      }

      mostrarToast(
        mensaje,
        'error',
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div
        className={`w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-slate-100 ${
          errorShake
            ? 'animate-shake border-rose-400'
            : ''
        }`}
      >
        {/* ====================================
            ENCABEZADO
        ==================================== */}

        <div className="text-center mb-8 space-y-2">
          <div className="w-14 h-14 bg-[#EEF2FC] rounded-2xl flex items-center justify-center text-3xl mx-auto border border-[#5E7BC4]/20">
            {rol === 'CIUDADANO'
              ? '🐾'
              : rol === 'REFUGIO'
                ? '🏠'
                : '🏥'}
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Crear Cuenta en VeciPets
          </h1>

          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Únete a la comunidad que ayuda a proteger
            y encontrar a nuestros compañeros de cuatro
            patas.
          </p>
        </div>

        <form
          onSubmit={manejarSubmit}
          className="space-y-6"
        >
          {/* ====================================
              DATOS PERSONALES
          ==================================== */}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#EEF2FC] flex items-center justify-center">
                👤
              </span>

              <div>
                <h2 className="text-sm font-black text-slate-800">
                  Datos personales
                </h2>

                <p className="text-[11px] text-slate-400">
                  Información básica de tu cuenta
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo *
                </label>

                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) =>
                    setNombreCompleto(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Ana María Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico *
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono *
                  </label>

                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(
                        e.target.value,
                      )
                    }
                    placeholder="+57 300 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================
              TIPO DE USUARIO
          ==================================== */}

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              ¿Cómo deseas registrarte? *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  cambiarRol('CIUDADANO')
                }
                className={`p-4 rounded-2xl border text-left transition-all ${
                  rol === 'CIUDADANO'
                    ? 'border-[#5E7BC4] bg-[#EEF2FC] shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="text-2xl mb-2">
                  👤
                </div>

                <div className="text-sm font-black text-slate-800">
                  Ciudadano
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Vecino de la comunidad
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarRol('REFUGIO')
                }
                className={`p-4 rounded-2xl border text-left transition-all ${
                  rol === 'REFUGIO'
                    ? 'border-[#5E7BC4] bg-[#EEF2FC] shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="text-2xl mb-2">
                  🏠
                </div>

                <div className="text-sm font-black text-slate-800">
                  Refugio
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Organización animal
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarRol('VETERINARIA')
                }
                className={`p-4 rounded-2xl border text-left transition-all ${
                  rol === 'VETERINARIA'
                    ? 'border-[#5E7BC4] bg-[#EEF2FC] shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="text-2xl mb-2">
                  🏥
                </div>

                <div className="text-sm font-black text-slate-800">
                  Veterinaria
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Clínica veterinaria
                </div>
              </button>
            </div>
          </div>

          {/* ====================================
              REFUGIO
          ==================================== */}

          {rol === 'REFUGIO' && (
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex gap-3">
                  <span className="text-xl">
                    🏠
                  </span>

                  <div>
                    <h3 className="text-sm font-black text-amber-900">
                      Información del refugio
                    </h3>

                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Estos datos serán revisados por
                      un administrador antes de aprobar
                      la cuenta.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Refugio *
                </label>

                <input
                  type="text"
                  value={nombreRefugio}
                  onChange={(e) =>
                    setNombreRefugio(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Refugio Patitas Felices"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Capacidad *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacidadRefugio}
                    onChange={(e) =>
                      setCapacidadRefugio(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. 30"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Horario *
                  </label>

                  <input
                    type="text"
                    value={horarioRefugio}
                    onChange={(e) =>
                      setHorarioRefugio(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Lun-Vie 8:00-17:00"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sitio Web
                  <span className="text-slate-400 normal-case ml-1">
                    (opcional)
                  </span>
                </label>

                <input
                  type="url"
                  value={sitioWebRefugio}
                  onChange={(e) =>
                    setSitioWebRefugio(
                      e.target.value,
                    )
                  }
                  placeholder="https://www.ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                />
              </div>

              {/* UBICACIÓN */}

              <div className="pt-2">
                <h3 className="text-sm font-black text-slate-800 mb-3">
                  📍 Ubicación del refugio
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) =>
                      setDireccion(
                        e.target.value,
                      )
                    }
                    placeholder="Dirección *"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={comuna}
                      onChange={(e) =>
                        setComuna(
                          e.target.value,
                        )
                      }
                      placeholder="Comuna *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />

                    <input
                      type="text"
                      value={barrio}
                      onChange={(e) =>
                        setBarrio(
                          e.target.value,
                        )
                      }
                      placeholder="Barrio *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={latitud}
                      onChange={(e) =>
                        setLatitud(
                          e.target.value,
                        )
                      }
                      placeholder="Latitud *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />

                    <input
                      type="text"
                      value={longitud}
                      onChange={(e) =>
                        setLongitud(
                          e.target.value,
                        )
                      }
                      placeholder="Longitud *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================
              VETERINARIA
          ==================================== */}

          {rol === 'VETERINARIA' && (
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex gap-3">
                  <span className="text-xl">
                    🏥
                  </span>

                  <div>
                    <h3 className="text-sm font-black text-blue-900">
                      Información de la veterinaria
                    </h3>

                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Estos datos serán revisados por
                      un administrador antes de aprobar
                      la cuenta.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre de la Veterinaria *
                </label>

                <input
                  type="text"
                  value={nombreVeterinaria}
                  onChange={(e) =>
                    setNombreVeterinaria(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Clínica Veterinaria San Martín"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Horario de atención *
                </label>

                <input
                  type="text"
                  value={horarioVeterinaria}
                  onChange={(e) =>
                    setHorarioVeterinaria(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Lun-Sáb 8:00-18:00"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                />
              </div>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-white transition-all">
                <input
                  type="checkbox"
                  checked={urgencias24h}
                  onChange={(e) =>
                    setUrgencias24h(
                      e.target.checked,
                    )
                  }
                  className="w-5 h-5 accent-[#5E7BC4]"
                />

                <div>
                  <span className="block text-sm font-bold text-slate-800">
                    🚑 Atención de urgencias 24 horas
                  </span>

                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Marca esta opción si la clínica
                    atiende emergencias durante todo
                    el día.
                  </span>
                </div>
              </label>

              {/* UBICACIÓN */}

              <div className="pt-2">
                <h3 className="text-sm font-black text-slate-800 mb-3">
                  📍 Ubicación de la veterinaria
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) =>
                      setDireccion(
                        e.target.value,
                      )
                    }
                    placeholder="Dirección *"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={comuna}
                      onChange={(e) =>
                        setComuna(
                          e.target.value,
                        )
                      }
                      placeholder="Comuna *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />

                    <input
                      type="text"
                      value={barrio}
                      onChange={(e) =>
                        setBarrio(
                          e.target.value,
                        )
                      }
                      placeholder="Barrio *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={latitud}
                      onChange={(e) =>
                        setLatitud(
                          e.target.value,
                        )
                      }
                      placeholder="Latitud *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />

                    <input
                      type="text"
                      value={longitud}
                      onChange={(e) =>
                        setLongitud(
                          e.target.value,
                        )
                      }
                      placeholder="Longitud *"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================
              CONTRASEÑA
          ==================================== */}

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#EEF2FC] flex items-center justify-center">
                🔐
              </span>

              <div>
                <h2 className="text-sm font-black text-slate-800">
                  Seguridad
                </h2>

                <p className="text-[11px] text-slate-400">
                  Protege el acceso a tu cuenta
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña *
                </label>

                <input
                  type="password"
                  value={pass}
                  onChange={(e) =>
                    setPass(e.target.value)
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña *
                </label>

                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) =>
                    setConfirmPass(
                      e.target.value,
                    )
                  }
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#5E7BC4] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* ====================================
              INFORMACIÓN DE APROBACIÓN
          ==================================== */}

          {rol !== 'CIUDADANO' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <span className="text-xl">
                  🔔
                </span>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Revisión del administrador
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Al completar el registro, tu
                    solicitud quedará pendiente de
                    aprobación. Un administrador de
                    VeciPets revisará la información
                    antes de habilitar tu cuenta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ====================================
              BOTÓN
          ==================================== */}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#5E7BC4] hover:bg-[#4F6FB8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            {cargando ? (
              <span>
                Enviando solicitud...
              </span>
            ) : rol === 'CIUDADANO' ? (
              <span>
                Crear mi cuenta ✨
              </span>
            ) : (
              <span>
                Enviar solicitud para revisión 📋
              </span>
            )}
          </button>
        </form>

        {/* ======================================
            LOGIN
        ====================================== */}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
          ¿Ya posees una cuenta registrada?{' '}

          <Link
            href="/login"
            className="text-[#5E7BC4] hover:underline font-bold"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

