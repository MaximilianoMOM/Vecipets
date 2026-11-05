import type { Metadata } from 'next';
import Header from './components/landing/Header';
import Footer from './components/landing/Footer';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'VeciPets - Bienestar y Red Comunitaria de Mascotas',
  description: 'Plataforma comunitaria de mascotas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans">
        <AuthProvider>
          {/* Header único para toda la app */}
          <Header />

          {/* Contenido dinámico de las páginas */}
          <main className="flex-1">{children}</main>

          {/* Footer único para toda la app */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
