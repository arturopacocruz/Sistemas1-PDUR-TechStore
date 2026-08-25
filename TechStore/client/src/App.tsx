import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/navigation/Navbar';
import { Toast } from './components/Toast';
import { CatalogoView } from './views/CatalogoView';
import { CarritoView } from './views/CarritoView';
import { PedidoView } from './views/PedidoView';
import { AdministradorView } from './views/AdministradorView';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'catalogo' | 'pedidos' | 'admin'>('catalogo');
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false);
  const { esAdmin } = useAuth();

  const handleProceedToCheckout = () => {
    setIsCheckoutFlow(true);
    setCurrentTab('pedidos');
  };

  const handleBackToCatalog = () => {
    setIsCheckoutFlow(false);
    setCurrentTab('catalogo');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          setIsCheckoutFlow(false);
          setCurrentTab(tab);
        }}
      />

      {/* Main Views Container */}
      <main style={{ flex: 1 }}>
        {currentTab === 'catalogo' && <CatalogoView />}

        {currentTab === 'pedidos' && (
          <PedidoView
            onBackToCatalog={handleBackToCatalog}
            isCheckoutMode={isCheckoutFlow}
          />
        )}

        {currentTab === 'admin' && esAdmin && <AdministradorView />}
      </main>

      {/* Slide-in Shopping Cart Drawer (HU-02) */}
      <CarritoView onProceedToCheckout={handleProceedToCheckout} />

      {/* Global Toast System */}
      <Toast />

      {/* Modern Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(10, 13, 20, 0.95)',
          padding: '32px 24px',
          marginTop: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TechStore Bolivia MVP
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Arquitectura MVC en Capas · Tarija, Bolivia (Agosto 2026)
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Cumplimiento normativo Ley N° 164 (Comercio Electrónico) y Ley N° 453 (Defensa al Consumidor).<br />
            Integridad relacional garantizada en 8 tablas 3FN.
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
