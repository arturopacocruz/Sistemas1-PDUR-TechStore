import React, { useState, useEffect } from 'react';
import type { Producto } from '../types';
import { api } from '../services/api';
import { X, Layers, AlertCircle, Plus, Minus, Check } from 'lucide-react';

interface QuickStockModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  producto,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [stock, setStock] = useState<number>(0);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (producto) {
      setStock(producto.stock);
      setError(null);
    }
  }, [producto, isOpen]);

  // UX: Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !producto) return null;

  const handleAdjust = (delta: number) => {
    setStock(prev => Math.max(0, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    try {
      setActualizando(true);
      setError(null);
      await api.actualizarStock(producto.id_producto, stock);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar stock.');
    } finally {
      setActualizando(false);
    }
  };

  // Preview de estado según stock
  const estadoPrevisto = stock === 0 ? 'Agotado' : 'Activo';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading">Ajuste Rápido de Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 mb-4">
          <img
            src={producto.imagen || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
            alt={producto.nombre}
            className="w-12 h-12 object-cover rounded-lg bg-black/40 border border-white/5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">{producto.nombre}</h4>
            <p className="text-xs text-slate-400">Stock actual en sistema: <strong className="text-cyan-400">{producto.stock} unid.</strong></p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Numeric Counter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nuevo Stock Disponible (unidades)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                disabled={stock <= 0}
                className="p-3 rounded-xl border border-white/10 bg-slate-900/80 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Restar 1"
              >
                <Minus size={18} />
              </button>

              <input
                type="number"
                min="0"
                step="1"
                required
                value={stock}
                onChange={e => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="flex-1 text-center py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white text-2xl font-bold font-heading focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="p-3 rounded-xl border border-white/10 bg-slate-900/80 text-white hover:bg-white/10 transition-colors"
                title="Sumar 1"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Quick Adjustment Shortcuts (UX Micro-interaction) */}
          <div className="flex justify-center gap-2 pt-1">
            {[-10, -5, +5, +10, +25].map(delta => (
              <button
                key={delta}
                type="button"
                onClick={() => handleAdjust(delta)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>

          {/* Status Transition Preview */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-400">
            <span>Estado automático resultante:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full ${
              estadoPrevisto === 'Agotado'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : stock <= 5
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {estadoPrevisto === 'Agotado' ? 'Agotado' : stock <= 5 ? `Bajo Stock (${stock})` : 'Activo (Disponible)'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-sm"
              disabled={actualizando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary text-sm font-semibold flex items-center gap-1.5"
              disabled={actualizando}
            >
              <Check size={16} />
              <span>{actualizando ? 'Guardando...' : 'Guardar Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
