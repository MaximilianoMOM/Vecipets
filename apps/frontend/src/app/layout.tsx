import type { Metadata } from 'next';
import './globals.css';
import Header from './components/common/Header';
import Footer from './components/common/Footer'; // <-- Ajusta esta ruta si está en otra carpeta

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}