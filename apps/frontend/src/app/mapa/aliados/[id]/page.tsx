'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type Aliado = {
  nombre: string;
  tipo: 'veterinaria' | 'refugio';
  direccion: string;
  municipio: string;
  contacto?: string;
  servicios?: string;
  horarios?: string;
  descripcion?: string;
  jornadas: Array<{ id: number; titulo: string; fechaTexto: string; horaTexto: string }>;
};

export default function AliadoPage() {
  const { id } = useParams<{ id: string }>();
  const [aliado, setAliado] = useState<Aliado>();
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.get<Aliado>('/mapa/aliados/' + id, { signal: controller.signal })
      .then(({ data }) => setAliado(data))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [id]);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Link href="/mapa" className="font-semibold text-emerald-800 underline">Volver al mapa</Link>
      {!aliado ? <p role="status">{error ? 'El aliado no está disponible.' : 'Cargando datos del aliado…'}</p> : (
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <p className="capitalize text-sm text-slate-600">{aliado.tipo}</p>
          <h1 className="text-2xl font-bold">{aliado.nombre}</h1>
          <p>{aliado.direccion}, {aliado.municipio}</p>
          <dl className="space-y-2 whitespace-pre-line">
            {([['Contacto', aliado.contacto], ['Horarios', aliado.horarios], ['Servicios', aliado.servicios]] as const)
              .filter(([, value]) => value).map(([label, value]) => (
                <div key={label}><dt className="font-semibold">{label}</dt><dd>{value}</dd></div>
              ))}
          </dl>
          {aliado.descripcion && <p className="whitespace-pre-line">{aliado.descripcion}</p>}
          {aliado.jornadas.length > 0 && <section>
            <h2 className="font-bold">Jornadas disponibles</h2>
            <ul className="space-y-2">
              {aliado.jornadas.map((jornada) => (
                <li key={jornada.id}>{jornada.titulo} · {jornada.fechaTexto} · {jornada.horaTexto}</li>
              ))}
            </ul>
          </section>}
        </article>
      )}
    </main>
  );
}
