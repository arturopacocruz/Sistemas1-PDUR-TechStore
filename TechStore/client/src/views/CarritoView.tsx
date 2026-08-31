import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, X, AlertCircle, LogIn, Lock } from 'lucide-react';

interface CarritoViewProps {
  onProceedToCheckout: () => void;
}

export const CarritoView: React.FC<CarritoViewProps> = ({ onProceedToCheckout }) => {
  const {
    carrito,
    isCartOpen,
    closeCart,
    modificarCantidad,
    eliminarProducto,
    vaciarCarrito,
    cargando
  } = useCart();

  const { estaAutenticado, openLoginModal } = useAuth();
  const [inputErrors, setInputErrors] = useState<{ [idProducto: number]: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const items = carrito?.items || [];
  const total = carrito?.total || 0;
  const tieneItems = items.length > 0;

  const handleCantidadChange = async (idProducto: number, nuevaCantidad: number, stockMax: number) => {
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
      await eliminarProducto(idProducto);
      setInputErrors(prev => {
        const copy = { ...prev };
        delete copy[idProducto];
        return copy;
      });
      return;
    }

    if (nuevaCantidad > stockMax) {
      setInputErrors(prev => ({
        ...prev,
        [idProducto]: `Cantidad no disponible (Stock máximo: ${stockMax})`
      }));
      return;
    }

    setInputErrors(prev => {
      const copy = { ...prev };
      delete copy[idProducto];
      return copy;
    });

    await modificarCantidad(idProducto, nuevaCantidad);
  };

  const handleCheckoutClick = () => {
    if (!estaAutenticado) {
      setAuthError('Debes iniciar sesión o registrar una cuenta para procesar tu pedido.');
      openLoginModal();
      return;
    }
    setAuthError(null);
    closeCart();
    onProceedToCheckout();
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div className="cart-drawer-overlay" onClick={closeCart} />

      {/* Slide-in Drawer (HU-02) */}
      <aside className="cart-drawer">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={22} className="text-cyan-400" />
            <h2 className="text-lg font-bold font-heading text-white">Carrito de Compras</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
              HU-02
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {authError && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
              <Lock size={15} className="shrink-0 text-amber-400" />
              <span>{authError}</span>
            </div>
          )}

          {!tieneItems ? (
            <div className="text-center py-16 px-4 text-slate-400">
              <ShoppingBag size={52} className="mx-auto mb-4 text-slate-600 opacity-40" />
              <h3 className="text-lg font-bold mb-2 text-slate-200">Tu carrito está vacío</h3>
              <p className="text-sm mb-6 text-slate-400">
                Explora el catálogo y agrega productos para iniciar tu pedido.
              </p>
              <button onClick={closeCart} className="btn btn-primary">
                Ver Catálogo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {items.map(item => {
                const stockMax = item.producto?.stock || 0;
                const errorMsg = inputErrors[item.id_producto];

                return (
                  <div
                    key={item.id_item}
                    className="p-3.5 rounded-xl border border-white/10 bg-slate-900/70 hover:border-cyan-500/30 transition-all flex flex-col gap-2.5 shadow-sm"
                  >
                    <div className="flex gap-3 items-center">
                      {/* Product Thumbnail */}
                      <img
                        src={item.producto?.imagen || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80'}
                        alt={item.producto?.nombre}
                        className="w-16 h-16 object-cover rounded-lg bg-black/40 border border-white/5 shrink-0"
                      />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate mb-0.5">
                          {item.producto?.nombre}
                        </h4>
                        <div className="text-xs text-slate-400 mb-1">
                          Precio Unitario: <span className="text-slate-200 font-medium">Bs. {item.precio_unitario.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Stock Disponible: {stockMax} unid.
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => eliminarProducto(item.id_producto)}
                        className="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors shrink-0"
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Error alert if quantity exceeds stock */}
                    {errorMsg && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-md border border-rose-500/20">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Quantity & Subtotal Row (HU-02) */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => handleCantidadChange(item.id_producto, item.cantidad - 1, stockMax)}
                          className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={cargando}
                          title="Disminuir cantidad"
                        >
                          <Minus size={13} />
                        </button>

                        <input
                          type="number"
                          min="1"
                          max={stockMax}
                          value={item.cantidad}
                          onChange={e => handleCantidadChange(item.id_producto, parseInt(e.target.value, 10), stockMax)}
                          className="w-12 text-center bg-transparent text-white text-xs font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          onClick={() => handleCantidadChange(item.id_producto, item.cantidad + 1, stockMax)}
                          className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={cargando || item.cantidad >= stockMax}
                          title={item.cantidad >= stockMax ? 'Cantidad máxima disponible' : 'Aumentar cantidad'}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Subtotal:</span>
                        <span className="text-sm font-bold text-cyan-400 font-heading">
                          Bs. {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear Cart Button */}
              <div className="text-right pt-2">
                <button
                  onClick={vaciarCarrito}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors hover:underline"
                >
                  Vaciar carrito completo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout Trigger */}
        {tieneItems && (
          <div className="p-5 border-t border-white/10 bg-slate-950/95 space-y-3">
            {!estaAutenticado && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Lock size={14} />
                  <span>Requiere inicio de sesión</span>
                </div>
                <button
                  onClick={openLoginModal}
                  className="text-[11px] font-bold text-white underline hover:text-amber-200"
                >
                  Ingresar
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Total a Pagar</span>
                <span className="text-[11px] text-slate-500">Cálculo en tiempo real</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-heading tracking-tight">
                Bs. {total.toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-cyan-500/25"
            >
              <span>{estaAutenticado ? 'Proceder al Checkout (HU-03)' : 'Iniciar Sesión para Comprar'}</span>
              {estaAutenticado ? <ArrowRight size={16} /> : <LogIn size={16} />}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
