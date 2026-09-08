'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapaGeneralDynamic } from '@/components/mapa/MapDynamicWrapper';
import { ElementoMapa } from '@/components/mapa/MapaGeneralLeaflet';
import { reportesAPI, refugiosAPI, veterinariasAPI, Reporte, Refugio } from '@/lib/api-client';

export default function MapaPage() {
  const [elementos, setElementos] = useState<ElementoMapa[]>([]);
  const [elementoSeleccionado, setElementoSeleccionado] = useState<ElementoMapa | null>(null);
  const [centroMapa, setCentroMapa] = useState<[number, number]>([4.6500, -74.0600]); // Coordenadas centrales de Bogotá
  const [cargando, setCargando] = useState(true);

  // =========================================================
  // ESTADOS DE FILTRO
  // =========================================================
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<'TODOS' | 'PERDIDA' | 'HALLAZGO' | 'REFUGIO' | 'VETERINARIA'>('TODOS');
  const [filtroEspecie, setFiltroEspecie] = useState<'TODOS' | 'PERRO' | 'GATO' | 'OTRO'>('TODOS');

  // =========================================================
  // MOCK DE RESPALDO SI EL BACKEND ESTÁ OFFLINE O SIN DATOS
  // =========================================================
  const mockElementos: ElementoMapa[] = [
    {
      id: 'm1',
      tipoItem: 'MASCOTA',
      subtipo: 'PERDIDA',
      especie: 'PERRO',
      nombre: 'Bruno - Beagle Extraviado',
      descripcion: 'Visto por última vez cerca al parque central con collar rojo.',
      ubicacion: 'Parque El Virrey, Bogotá',
      latitud: 4.6735,
      longitud: -74.0561,
      fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      reporteId: '1',
    },
    {
      id: 'm2',
      tipoItem: 'MASCOTA',
      subtipo: 'HALLAZGO',
      especie: 'GATO',
      nombre: 'Luna - Gata Encontrada',
      descripcion: 'Rescatada en parqueadero cubierto, muy dócil.',
      ubicacion: 'Barrio Palermo, Bogotá',
      latitud: 4.6300,
      longitud: -74.0700,
      fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      reporteId: '2',
    },
    {
      id: 'm3',
      tipoItem: 'MASCOTA',
      subtipo: 'PERDIDA',
      especie: 'PERRO',
      nombre: 'Toby - Golden Retriever',
      descripcion: 'Se asustó con los pólvoras y salió corriendo.',
      ubicacion: 'Calle 127 #15-40, Bogotá',
      latitud: 4.7020,
      longitud: -74.0410,
      fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      reporteId: '3',
    },
    {
      id: 'r1',
      tipoItem: 'REFUGIO',
      subtipo: 'REFUGIO',
      nombre: 'Refugio Huellitas de Amor',
      descripcion: 'Albergue y centro de adopciones de mascotas rescatadas.',
      ubicacion: 'Av. Las Palmas #45-12, Bogotá',
      latitud: 4.6500,
      longitud: -74.0800,
      telefono: '+57 312 456 7890',
      horario: 'Lun a Sáb: 8:00 AM - 5:00 PM',
      servicios: ['Adopciones', 'Rescate', 'Hogar de Paso'],
      fotoUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'v1',
      tipoItem: 'VETERINARIA',
      subtipo: 'VETERINARIA',
      nombre: 'Clínica Veterinaria San Francisco 24h',
      descripcion: 'Atención de emergencias 24 horas y cirugías.',
      ubicacion: 'Calle 100 #19-60, Bogotá',
      latitud: 4.6850,
      longitud: -74.0520,
      telefono: '+57 300 987 6543',
      horario: 'Urgencias 24 Horas',
      servicios: ['Urgencias 24h', 'Cirugía', 'Ecografía'],
      fotoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // =========================================================
  // CARGAR DATOS REALES DE BACKEND
  // =========================================================
  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      const listaCombinada: ElementoMapa[] = [];

      try {
        // 1. Cargar Reportes
        const reportes: Reporte[] = await reportesAPI.getReportes();
        if (Array.isArray(reportes)) {
          reportes.forEach((rep) => {
            if (rep.latitud && rep.longitud) {
              listaCombinada.push({
                id: `rep-${rep.id}`,
                tipoItem: 'MASCOTA',
                subtipo: rep.tipo === 'PERDIDA' ? 'PERDIDA' : 'HALLAZGO',
                especie: rep.especie,
                nombre: rep.nombreMascota || rep.titulo,
                descripcion: rep.descripcion,
                ubicacion: rep.ubicacion,
                latitud: typeof rep.latitud === 'string' ? parseFloat(rep.latitud) : rep.latitud,
                longitud: typeof rep.longitud === 'string' ? parseFloat(rep.longitud) : rep.longitud,
                fotoUrl: rep.fotoUrl,
                reporteId: rep.id,
              });
            }
          });
        }
      } catch (err) {
        console.warn('Backend indisponible para reportes, usando respaldo local.');
      }

      try {
        // 2. Cargar Refugios
        const refugios: Refugio[] = await refugiosAPI.getRefugios();
        if (Array.isArray(refugios)) {
          refugios.forEach((ref) => {
            if (ref.latitud && ref.longitud) {
              listaCombinada.push({
                id: `ref-${ref.id}`,
                tipoItem: ref.tipo === 'REFUGIO' ? 'REFUGIO' : 'VETERINARIA',
                subtipo: ref.tipo === 'REFUGIO' ? 'REFUGIO' : 'VETERINARIA',
                nombre: ref.nombre,
                ubicacion: ref.direccion,
                latitud: typeof ref.latitud === 'string' ? parseFloat(ref.latitud) : ref.latitud,
                longitud: typeof ref.longitud === 'string' ? parseFloat(ref.longitud) : ref.longitud,
                telefono: ref.telefono,
                horario: ref.horario,
                servicios: ref.servicios,
                fotoUrl: ref.imagenUrl,
              });
            }
          });
        }
      } catch (err) {
        console.warn('Backend indisponible para refugios.');
      }

      // Si no hubo respuesta del servidor, usamos los datos mock completos
      if (listaCombinada.length === 0) {
        setElementos(mockElementos);
      } else {
        setElementos(listaCombinada);
        setCentroMapa([listaCombinada[0].latitud, listaCombinada[0].longitud]);
      }

      setCargando(false);
    };

    cargarTodo();
  }, []);

  // =========================================================
  // LÓGICA DE FILTRADO EN TIEMPO REAL
  // =========================================================
  const elementosFiltrados = elementos.filter((item) => {
    // Categoría
    if (categoria === 'PERDIDA' && item.subtipo !== 'PERDIDA') return false;
    if (categoria === 'HALLAZGO' && item.subtipo !== 'HALLAZGO') return false;
    if (categoria === 'REFUGIO' && item.tipoItem !== 'REFUGIO') return false;
    if (categoria === 'VETERINARIA' && item.tipoItem !== 'VETERINARIA') return false;

    // Especie (solo aplica si es mascota o si no se especificó)
    if (filtroEspecie !== 'TODOS' && item.tipoItem === 'MASCOTA') {
      if (item.especie !== filtroEspecie) return false;
    }

    // Buscador libre
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const coincideNombre = item.nombre.toLowerCase().includes(q);
      const coincideUbicacion = item.ubicacion.toLowerCase().includes(q);
      const coincideDesc = item.descripcion?.toLowerCase().includes(q);
      if (!coincideNombre && !coincideUbicacion && !coincideDesc) return false;
    }

    return true;
  });

  // Contadores
  const numPerdidas = elementos.filter((e) => e.subtipo === 'PERDIDA').length;
  const numHallazgos = elementos.filter((e) => e.subtipo === 'HALLAZGO').length;
  const numRefugios = elementos.filter((e) => e.tipoItem === 'REFUGIO').length;
  const numVeterinarias = elementos.filter((e) => e.tipoItem === 'VETERINARIA').length;

  const seleccionarElemento = (item: ElementoMapa) => {
    setElementoSeleccionado(item);
    if (item.latitud && item.longitud) {
      setCentroMapa([item.latitud, item.longitud]);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-slate-100">
      
      {/* =====================================================
          PANEL LATERAL INTERACTIVO
      ===================================================== */}
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-lg shrink-0">
        
        {/* ENCABEZADO Y CONTROLES DE FILTRO */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <span>Explorador en Vivo</span>
            </h1>
            <span className="text-xs font-extrabold text-[#5E7BC4] bg-[#EEF2FC] px-2.5 py-1 rounded-full">
              {elementosFiltrados.length} ubicaciones
            </span>
          </div>

          {/* CAMPO DE BÚSQUEDA */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar mascota, barrio, refugio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#5E7BC4] transition-all shadow-2xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* BOTONES DE CATEGORÍAS */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: 'TODOS', label: 'Todos', count: elementos.length, color: 'bg-slate-800' },
              { id: 'PERDIDA', label: '🚨 Perdidas', count: numPerdidas, color: 'bg-rose-500' },
              { id: 'HALLAZGO', label: '🔍 Encontradas', count: numHallazgos, color: 'bg-emerald-600' },
              { id: 'REFUGIO', label: '🏡 Refugios', count: numRefugios, color: 'bg-purple-600' },
              { id: 'VETERINARIA', label: '🏥 Clínicas', count: numVeterinarias, color: 'bg-sky-600' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  categoria === cat.id
                    ? `${cat.color} text-white shadow-xs`
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full ${
                  categoria === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* FILTRO DE ESPECIE */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
            <span className="text-[11px] text-slate-400 font-bold">Especie:</span>
            {[
              { id: 'TODOS', label: 'Todas' },
              { id: 'PERRO', label: '🐶 Perros' },
              { id: 'GATO', label: '🐱 Gatos' },
              { id: 'OTRO', label: '🐾 Otros' },
            ].map((esp) => (
              <button
                key={esp.id}
                onClick={() => setFiltroEspecie(esp.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                  filtroEspecie === esp.id
                    ? 'bg-[#5E7BC4] text-white font-extrabold'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {esp.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE RESULTADOS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : elementosFiltrados.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <span className="text-4xl block">🔎</span>
              <p className="text-sm font-bold text-slate-800">No hay coincidencias</p>
              <p className="text-xs text-slate-500">Prueba cambiando los filtros o la búsqueda.</p>
              <button
                onClick={() => {
                  setBusqueda('');
                  setCategoria('TODOS');
                  setFiltroEspecie('TODOS');
                }}
                className="mt-2 text-xs font-extrabold text-[#5E7BC4] underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            elementosFiltrados.map((item) => {
              const esSeleccionado = elementoSeleccionado?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => seleccionarElemento(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    esSeleccionado
                      ? 'bg-[#EEF2FC] border-[#5E7BC4] shadow-sm ring-1 ring-[#5E7BC4]'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {item.fotoUrl ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.nombre}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                      {item.tipoItem === 'REFUGIO' ? '🏡' : item.tipoItem === 'VETERINARIA' ? '🏥' : '🐾'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase text-white ${
                          item.subtipo === 'PERDIDA'
                            ? 'bg-rose-500'
                            : item.subtipo === 'HALLAZGO'
                            ? 'bg-emerald-600'
                            : item.tipoItem === 'REFUGIO'
                            ? 'bg-purple-600'
                            : 'bg-sky-600'
                        }`}
                      >
                        {item.subtipo}
                      </span>
                      {item.especie && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                          {item.especie}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {item.nombre}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      📍 {item.ubicacion}
                    </p>

                    {item.tipoItem === 'MASCOTA' && item.reporteId ? (
                      <Link
                        href={`/reportes/${item.reporteId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-extrabold text-[#5E7BC4] hover:underline mt-1 block"
                      >
                        Ver reporte completo →
                      </Link>
                    ) : item.telefono ? (
                      <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                        📞 {item.telefono}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* =====================================================
          ÁREA DE MAPA A PANTALLA COMPLETA
      ===================================================== */}
      <div className="flex-1 h-full relative">
        <MapaGeneralDynamic
          elementos={elementosFiltrados}
          centroInicial={centroMapa}
          zoomInicial={13}
          onSelectElemento={(item) => seleccionarElemento(item)}
        />
      </div>

    </div>
  );
}