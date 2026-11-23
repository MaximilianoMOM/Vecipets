'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from './api-client';
import { useRouter } from 'next/navigation';


export type User = {
  id: number;
  nombre: string;
  correo: string;
  rol: 'CIUDADANO' | 'ADMINISTRADOR' | 'REFUGIO' | 'VETERINARIA';
  estadoAprobacion: string;
  correoVerificado: boolean;
};

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<User>('/usuarios/me');
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const logout = async () => {
    try {
      await apiClient.post('/usuarios/logout');
    } catch {
      // Se limpia el estado local aunque falle la petición.
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
