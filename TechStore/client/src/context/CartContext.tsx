import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Carrito } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  carrito: Carrito | null;
  cargando: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  agregarProducto: (idProducto: number, cantidad?: number) => Promise<void>;
  modificarCantidad: (idProducto: number, cantidad: number) => Promise<void>;
  eliminarProducto: (idProducto: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  refrescarCarrito: () => Promise<void>;
  toastMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuarioActual } = useAuth();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  const refrescarCarrito = useCallback(async () => {
    if (!usuarioActual) return;
    try {
      setCargando(true);
      const data = await api.getCarrito(usuarioActual.id_usuario);
      setCarrito(data);
    } catch (err: any) {
      console.error('Error al cargar carrito', err);
    } finally {
      setCargando(false);
    }
  }, [usuarioActual]);

  useEffect(() => {
    if (usuarioActual) {
      refrescarCarrito();
    }
  }, [usuarioActual, refrescarCarrito]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const agregarProducto = async (idProducto: number, cantidad: number = 1) => {
    if (!usuarioActual) return;
    try {
      setCargando(true);
      const res = await api.agregarAlCarrito(idProducto, cantidad, usuarioActual.id_usuario);
      setCarrito(res.carrito);
      showToast('success', res.message || 'Producto agregado al carrito');
    } catch (err: any) {
      showToast('error', err.message || 'No se pudo agregar el producto');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const modificarCantidad = async (idProducto: number, cantidad: number) => {
    if (!usuarioActual) return;
    try {
      setCargando(true);
      const res = await api.modificarCantidadCarrito(idProducto, cantidad, usuarioActual.id_usuario);
      setCarrito(res.carrito);
      showToast('info', 'Cantidad actualizada');
    } catch (err: any) {
      showToast('error', err.message || 'No se pudo modificar la cantidad');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (idProducto: number) => {
    if (!usuarioActual) return;
    try {
      setCargando(true);
      const res = await api.eliminarDelCarrito(idProducto, usuarioActual.id_usuario);
      setCarrito(res.carrito);
      showToast('info', 'Producto eliminado del carrito');
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar producto');
    } finally {
      setCargando(false);
    }
  };

  const vaciarCarrito = async () => {
    if (!usuarioActual) return;
    try {
      setCargando(true);
      const res = await api.vaciarCarrito(usuarioActual.id_usuario);
      setCarrito(res.carrito);
      showToast('info', 'Carrito vaciado');
    } catch (err: any) {
      showToast('error', err.message || 'Error al vaciar carrito');
    } finally {
      setCargando(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        carrito,
        cargando,
        isCartOpen,
        openCart,
        closeCart,
        agregarProducto,
        modificarCantidad,
        eliminarProducto,
        vaciarCarrito,
        refrescarCarrito,
        toastMessage,
        clearToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
