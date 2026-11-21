
import type { Metadata } from 'next';
import './globals.css';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'VeciPets',
  description: 'Plataforma de reportes de mascotas perdidas y encontradas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gray-50 flex flex-col"
      >
        <AuthProvider>
          <Header />

          <main className="flex-1 w-full">
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
