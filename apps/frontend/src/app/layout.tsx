import type { Metadata } from 'next';
import './globals.css';
import ToastProviderWrapper from '@/components/providers/ToastProviderWrapper';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'VeciPets | Plataforma Comunitaria de Mascotas Reportadas',
  description:
    'Red comunitaria para reportar mascotas perdidas, encontradas y en adopción. Unidos por cada huella.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#292A2F] font-sans antialiased" suppressHydrationWarning>
        <ToastProviderWrapper>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProviderWrapper>
      </body>
    </html>
  );
}