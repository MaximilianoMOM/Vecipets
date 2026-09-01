"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Estado global de ejemplo para la sesión (puedes conectarlo a tu proveedor de autenticación real)
  const [isLoggedIn] = useState(false); 

  // Rutas que requieren autenticación obligatoria
  const rutasPrivadas = ["/perfil", "/reportar", "/mis-reportes"];

  useEffect(() => {
    const esRutaProtegida = rutasPrivadas.some(ruta => pathname.startsWith(ruta));
    if (esRutaProtegida && !isLoggedIn) {
      router.push("/login");
    }
  }, [pathname, isLoggedIn, router]);

  const esPaginaAuth = pathname === "/login" || pathname === "/registro";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f4f7f6] font-sans text-[#102849]">
        
        {/* ==================================================== */}
        {/* HEADER GLOBAL VECIPETS                               */}
        {/* ==================================================== */}
        {!esPaginaAuth && (
          <header style={{ 
            background: 'white', 
            borderBottom: '1px solid #e2e8ec', 
            padding: '16px 32px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}>
            {/* Logo y Nombre oficial de VeciPets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#237d5d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'white' }}>🐾</div>
              <Link href="/" style={{ fontSize: '20px', fontWeight: '800', color: '#102849', textDecoration: 'none' }}>
                VeciPets
              </Link>
            </div>

            {/* Menú de navegación superior */}
            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#607086' }}>
              <Link href="/" style={{ textDecoration: 'none', color: '#102849' }}>Inicio</Link>
              <Link href="/alertas" style={{ textDecoration: 'none', color: '#607086' }}>Alertas</Link>
              <Link href="/mapa" style={{ textDecoration: 'none', color: '#607086' }}>Mapa</Link>
              <Link href="/veterinarias" style={{ textDecoration: 'none', color: '#607086' }}>Veterinarias</Link>
              <Link href="/refugios" style={{ textDecoration: 'none', color: '#607086' }}>Refugios</Link>
              {isLoggedIn && (
                <Link href="/reportar" style={{ textDecoration: 'none', color: '#144936', fontWeight: '700' }}>Reportar Mascota</Link>
              )}
            </nav>

            {/* Botones de Autenticación / Cuenta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isLoggedIn ? (
                <Link href="/perfil" style={{ fontSize: '14px', fontWeight: '700', color: '#144936', textDecoration: 'none', background: '#e6f4ea', padding: '8px 16px', borderRadius: '10px' }}>
                  👤 Mi Perfil
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    style={{ fontSize: '13px', fontWeight: '700', color: '#237d5d', textDecoration: 'none', border: '1px solid #237d5d', padding: '8px 16px', borderRadius: '10px' }}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/registro" 
                    style={{ fontSize: '13px', fontWeight: '700', color: 'white', background: '#144936', textDecoration: 'none', padding: '8px 16px', borderRadius: '10px' }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </header>
        )}

        {/* ==================================================== */}
        {/* CONTENIDO PRINCIPAL                                  */}
        {/* ==================================================== */}
        <main className="flex-grow">
          {children}
        </main>

      </body>
    </html>
  );
}