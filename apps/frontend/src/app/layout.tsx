import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ReactNode } from 'react';

/** Root layout that wraps the entire Next.js app with the AuthProvider. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
