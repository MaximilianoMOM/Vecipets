import type { Metadata } from 'next';
import './globals.css';
// Importa tu componente Navbar (ajusta la ruta según la ubicación de tu archivo)
import Header from './components/common/Header';

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
      </body>
    </html>
  );
}