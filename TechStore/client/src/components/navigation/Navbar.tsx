import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DatabaseStatusBadge } from '../DatabaseStatusBadge';
import { ShoppingCart, ShieldCheck, User, Store, Package, Laptop, LogIn, LogOut, FileText } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalogo' | 'pedidos' | 'admin';
  setCurrentTab: (tab: 'catalogo' | 'pedidos' | 'admin') => void;
  onOpenTerms: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenTerms }) => {
  const { usuarioActual, estaAutenticado, esAdmin, openLoginModal, logout } = useAuth();
  const { carrito, openCart } = useCart();

  const totalItemsEnCarrito = carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  const handleLogout = () => {
    logout();
    if (currentTab === 'admin' || currentTab === 'pedidos') {
      setCurrentTab('catalogo');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => setCurrentTab('catalogo')}
          className="flex items-center gap-3.5 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Laptop size={24} className="text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-heading">
              TechStore
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>Tarija, Bolivia</span>
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400">MVP 2026</span>
            </div>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-slate-900/60 border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setCurrentTab('catalogo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              currentTab === 'catalogo'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Store size={16} />
            <span>Catálogo</span>
          </button>

          <button
            onClick={() => {
              if (!estaAutenticado) {
                openLoginModal();
              } else {
                setCurrentTab('pedidos');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              currentTab === 'pedidos'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package size={16} />
            <span>Mis Pedidos</span>
          </button>

          {esAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Panel Admin</span>
            </button>
          )}

          <button
            onClick={onOpenTerms}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            title="Ver Términos y Condiciones Legales"
          >
            <FileText size={14} />
            <span>Términos</span>
          </button>
        </nav>

        {/* Right Section: Status, Auth State & Cart Trigger */}
        <div className="flex items-center gap-3">
          {/* Database Connection Badge */}
          <DatabaseStatusBadge />

          {/* Authentication State */}
          {estaAutenticado && usuarioActual ? (
            <div className="flex items-center gap-2 p-1 pl-3 pr-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  <User size={13} />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                    {usuarioActual.nombre}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold leading-tight uppercase">
                    {usuarioActual.rol}
                  </div>
                </div>
              </div>

              {/* Botón Rojo: Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 ml-1"
                title="Cerrar sesión de la cuenta activa"
              >
                <LogOut size={13} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <LogIn size={15} />
              <span>Iniciar Sesión</span>
            </button>
          )}

          {/* Cart Trigger Button (HU-02) */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow transition-all hover:scale-105 active:scale-95"
            title="Abrir Carrito de Compras"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Carrito</span>
            {totalItemsEnCarrito > 0 && (
              <span className="bg-rose-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-md">
                {totalItemsEnCarrito}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-4 border-t border-white/5 bg-slate-950/90">
        <button
          onClick={() => setCurrentTab('catalogo')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentTab === 'catalogo' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Store size={14} />
          <span>Catálogo</span>
        </button>
        <button
          onClick={() => {
            if (!estaAutenticado) {
              openLoginModal();
            } else {
              setCurrentTab('pedidos');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentTab === 'pedidos' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Package size={14} />
          <span>Pedidos</span>
        </button>
        {esAdmin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              currentTab === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'text-purple-400'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </button>
        )}
        <button
          onClick={onOpenTerms}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-cyan-300"
        >
          <FileText size={14} />
          <span>Términos</span>
        </button>
      </div>
    </header>
  );
};
