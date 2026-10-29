import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

// Define the shape of the user object returned by /auth/me
export type User = {
  id: string;
  email: string;
  role: 'citizen' | 'veterinary' | 'admin';
};

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
});

/**
 * AuthProvider wraps the whole application (or the protected segment) and
 * fetches the current session from the backend using `/auth/me`.
 * It also exposes a `logout` function that calls the backend logout endpoint
 * and redirects the user to the login page.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      // Si la petición falla (ej. 401) consideramos que no hay sesión.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    // Opcional: suscripción a cambios de sesión mediante websockets o polling.
  }, []);

  const logout = async () => {
    try {
      // El backend debe limpiar la cookie HttpOnly.
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Incluso si falla, procedemos a limpiar el estado local.
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook de conveniencia para acceder al contexto de autenticación */
export const useAuth = () => useContext(AuthContext);
