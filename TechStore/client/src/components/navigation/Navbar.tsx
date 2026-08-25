import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DatabaseStatusBadge } from '../DatabaseStatusBadge';
import { ShoppingCart, ShieldCheck, User, Store, Package, Laptop } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalogo' | 'pedidos' | 'admin';
  setCurrentTab: (tab: 'catalogo' | 'pedidos' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { usuarioActual, usuariosDisponibles, cambiarUsuario, esAdmin } = useAuth();
  const { carrito, openCart } = useCart();

  const totalItemsEnCarrito = carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0d14]/85 backdrop-blur-xl border-b border-white/10">
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
            onClick={() => setCurrentTab('pedidos')}
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
              <span>Panel Admin (HU-04)</span>
            </button>
          )}
        </nav>

        {/* Right Section: Status, Role Switcher & Cart Trigger */}
        <div className="flex items-center gap-3">
          {/* Database Connection Badge */}
          <DatabaseStatusBadge />

          {/* User selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
            <User size={15} className="text-cyan-400" />
            <select
              value={usuarioActual?.id_usuario || ''}
              onChange={e => {
                const newId = Number(e.target.value);
                cambiarUsuario(newId);
                const user = usuariosDisponibles.find(u => u.id_usuario === newId);
                if (user?.rol === 'ADMINISTRADOR') {
                  setCurrentTab('admin');
                } else if (currentTab === 'admin') {
                  setCurrentTab('catalogo');
                }
              }}
              className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {usuariosDisponibles.map(user => (
                <option key={user.id_usuario} value={user.id_usuario} className="bg-slate-900 text-white">
                  {user.nombre} ({user.rol})
                </option>
              ))}
            </select>
          </div>

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
      <div className="md:hidden flex items-center justify-around py-2 px-4 border-t border-white/5 bg-slate-950/80">
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
          onClick={() => setCurrentTab('pedidos')}
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
      </div>
    </header>
  );
};
