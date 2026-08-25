import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        {/* Brand / Logo */}
        <div
          onClick={() => setCurrentTab('catalogo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Laptop size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TechStore
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Tarija · Bolivia MVP
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentTab('catalogo')}
            className={`btn ${currentTab === 'catalogo' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Store size={16} />
            <span>Catálogo</span>
          </button>

          <button
            onClick={() => setCurrentTab('pedidos')}
            className={`btn ${currentTab === 'pedidos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Package size={16} />
            <span>Mis Pedidos</span>
          </button>

          {esAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`btn ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{
                background: currentTab === 'admin' ? 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' : undefined,
                borderColor: currentTab === 'admin' ? '#d946ef' : undefined
              }}
            >
              <ShieldCheck size={16} />
              <span>Panel Admin (HU-04)</span>
            </button>
          )}
        </nav>

        {/* Right Section: Role Switcher & Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* User selector for easy testing */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <User size={15} color="var(--accent-cyan)" />
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
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {usuariosDisponibles.map(user => (
                <option key={user.id_usuario} value={user.id_usuario} style={{ background: '#1e293b', color: '#fff' }}>
                  {user.nombre} ({user.rol})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Drawer Trigger Button (HU-02) */}
          <button
            onClick={openCart}
            className="btn btn-primary"
            style={{
              position: 'relative',
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)'
            }}
            title="Abrir Carrito de Compras"
          >
            <ShoppingCart size={18} />
            <span style={{ fontWeight: 700 }}>Carrito</span>
            {totalItemsEnCarrito > 0 && (
              <span
                style={{
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  marginLeft: '4px',
                  boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)'
                }}
              >
                {totalItemsEnCarrito}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
