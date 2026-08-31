import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  usuarioActual: Usuario | null;
  estaAutenticado: boolean;
  esAdmin: boolean;
  cargando: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (datos: { nombre: string; email: string; telefono?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Cargar usuario persistido en localStorage al inicializar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('techstore_user');
      if (savedUser) {
        setUsuarioActual(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error al recuperar sesión previa', e);
      localStorage.removeItem('techstore_user');
      localStorage.removeItem('techstore_token');
    } finally {
      setCargando(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUsuarioActual(res.usuario);
    localStorage.setItem('techstore_user', JSON.stringify(res.usuario));
    localStorage.setItem('techstore_token', res.token);
    setIsLoginModalOpen(false);
  };

  const register = async (datos: { nombre: string; email: string; telefono?: string; password: string }) => {
    const res = await api.registro(datos);
    setUsuarioActual(res.usuario);
    localStorage.setItem('techstore_user', JSON.stringify(res.usuario));
    localStorage.setItem('techstore_token', res.token);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('techstore_user');
    localStorage.removeItem('techstore_token');
  };

  const estaAutenticado = usuarioActual !== null;
  const esAdmin = usuarioActual?.rol === 'ADMINISTRADOR';

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        estaAutenticado,
        esAdmin,
        cargando,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
