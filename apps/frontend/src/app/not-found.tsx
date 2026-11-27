
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-50">
      <h1 className="text-7xl font-extrabold text-primary">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold text-slate-800">
        ¡Ups! Página no encontrada
      </h2>

      <p className="mt-3 text-slate-600">
        La página que buscas no existe o fue movida.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
