import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  usuarioActual: Usuario | null;
  usuariosDisponibles: Usuario[];
  cambiarUsuario: (idUsuario: number) => void;
  esAdmin: boolean;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api.getUsuarios();
        setUsuarios(data);
        if (data.length > 0) {
          setUsuarioActual(data[0]); // Default to user 1 (Arturo Cruz - CLIENTE)
        }
      } catch (err) {
        console.error('Error cargando usuarios', err);
      } finally {
        setCargando(false);
      }
    }
    loadUsers();
  }, []);

  const cambiarUsuario = (idUsuario: number) => {
    const user = usuarios.find(u => u.id_usuario === idUsuario);
    if (user) {
      setUsuarioActual(user);
    }
  };

  const esAdmin = usuarioActual?.rol === 'ADMINISTRADOR';

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        usuariosDisponibles: usuarios,
        cambiarUsuario,
        esAdmin,
        cargando
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
