import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/navigation/Navbar';
import { Toast } from './components/Toast';
import { LoginModal } from './components/LoginModal';
import { TermsModal } from './components/TermsModal';
import { CatalogoView } from './views/CatalogoView';
import { CarritoView } from './views/CarritoView';
import { PedidoView } from './views/PedidoView';
import { AdministradorView } from './views/AdministradorView';
import { ShieldCheck, Scale, FileText, Lock, Laptop } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'catalogo' | 'pedidos' | 'admin'>('catalogo');
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const { esAdmin, estaAutenticado, openLoginModal } = useAuth();

  const handleProceedToCheckout = () => {
    if (!estaAutenticado) {
      openLoginModal();
      return;
    }
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
        onOpenTerms={() => setIsTermsModalOpen(true)}
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

      {/* Shopping Cart Drawer (HU-02) */}
      <CarritoView onProceedToCheckout={handleProceedToCheckout} />

      {/* Global Toast System */}
      <Toast />

      {/* Login Modal */}
      <LoginModal />

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Professional Footer */}
      <footer className="border-t border-white/10 bg-[#080b11] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                <Laptop size={18} />
              </div>
              <span className="font-heading font-extrabold text-lg text-white">TechStore Bolivia</span>
            </div>
            <p className="text-xs text-slate-400">
              Plataforma de comercio electrónico con arquitectura MVC en capas, cumplimiento legal estricto y auditoría de ciberseguridad.
            </p>
            <div className="text-[11px] text-slate-400">
              Tarija, Bolivia · Versión 2.0 (2026)
            </div>
          </div>

          {/* Legal references & Terms link */}
          <div className="text-center md:text-left space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cumplimiento Normativo
            </div>
            <ul className="text-xs space-y-1 text-slate-400">
              <li className="flex items-center gap-1.5 justify-center md:justify-start">
                <Scale size={13} className="text-cyan-400 shrink-0" />
                <span>Ley N° 164: Contratos de Comercio Electrónico</span>
              </li>
              <li className="flex items-center gap-1.5 justify-center md:justify-start">
                <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                <span>Ley N° 453: Defensa de los Derechos de Consumidores</span>
              </li>
              <li className="flex items-center gap-1.5 justify-center md:justify-start">
                <Lock size={13} className="text-purple-400 shrink-0" />
                <span>ASFI & Habeas Data: Cifrado y Auditoría Inmutable</span>
              </li>
            </ul>
          </div>

          {/* Direct Terms Button */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold shadow-sm transition-all"
            >
              <FileText size={15} />
              <span>Ver Términos y Condiciones</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center md:text-right">
              Todos los derechos reservados. TechStore MVP.
            </div>
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
