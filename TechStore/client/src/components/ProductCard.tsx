import React, { useState } from 'react';
import type { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Check, AlertCircle, Plus, Minus, Package } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  const { agregarProducto, carrito } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [agregadoReciente, setAgregadoReciente] = useState(false);

  const itemEnCarrito = carrito?.items?.find((it) => it.id_producto === producto.id_producto);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const stockRestante = producto.stock - cantidadEnCarrito;
  const estaAgotado = producto.stock === 0 || producto.estado === 'Agotado';
  const stockBajo = !estaAgotado && stockRestante <= 5;

  const handleAgregar = async () => {
    if (estaAgotado || stockRestante <= 0) return;
    try {
      setAgregando(true);
      await agregarProducto(producto.id_producto, cantidad);
      setAgregadoReciente(true);
      setTimeout(() => setAgregadoReciente(false), 1800);
      setCantidad(1);
    } catch {
      // Errores manejados por Toast
    } finally {
      setAgregando(false);
    }
  };

  return (
    <article
      id={`producto-${producto.id_producto}`}
      className={`flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${
        estaAgotado
          ? 'border-white/5 bg-slate-900/40 opacity-75'
          : 'border-white/10 bg-slate-900/80 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1'
      }`}
    >
      {/* ── Imagen del producto ── */}
      <div className="relative w-full overflow-hidden bg-black/50" style={{ paddingTop: '64%' }}>
        <img
          src={
            producto.imagen ||
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
          }
          alt={producto.nombre}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {estaAgotado && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-slate-950/90 border border-rose-500/40 text-rose-400 text-xs font-extrabold tracking-widest uppercase">
              Sin Stock
            </span>
          </div>
        )}

        {/* ── Badge de estado ── */}
        <div className="absolute top-3.5 right-3.5">
          {estaAgotado ? (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-sm">
              Agotado
            </span>
          ) : stockBajo ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse shadow-sm">
              ¡Últimas {stockRestante}!
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
              Disponible
            </span>
          )}
        </div>

        {/* Categoría */}
        <div className="absolute bottom-3 left-3.5">
          <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 text-xs font-semibold backdrop-blur-md">
            {producto.categoria_nombre || 'Tecnología'}
          </span>
        </div>
      </div>

      {/* ── Información del producto ── */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white leading-snug font-heading">
            {producto.nombre}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {producto.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        {/* Precio y Stock */}
        <div className="flex items-end justify-between pt-2 border-t border-white/5">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
              Precio Unitario
            </span>
            <span className="text-2xl font-extrabold text-cyan-400 font-heading">
              Bs. {producto.precio.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
              Stock
            </span>
            <span className={`text-sm font-bold flex items-center gap-1.5 justify-end ${estaAgotado ? 'text-rose-400' : 'text-slate-300'}`}>
              <Package size={14} />
              {estaAgotado ? '0 unidades' : `${producto.stock} unidades`}
            </span>
          </div>
        </div>

        {/* Indicador de unidades en carrito */}
        {cantidadEnCarrito > 0 && (
          <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
            <ShoppingCart size={13} />
            <span>{cantidadEnCarrito} en tu carrito</span>
          </div>
        )}

        {/* ── Controles de cantidad + Botón agregar ── */}
        <div className="flex gap-3 items-center mt-auto pt-2">
          {!estaAgotado && stockRestante > 0 && (
            <div className="flex items-center rounded-xl border border-white/15 bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                disabled={cantidad <= 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-3 text-sm font-bold text-white w-8 text-center">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.min(stockRestante, prev + 1))}
                disabled={cantidad >= stockRestante}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          <button
            id={`btn-agregar-${producto.id_producto}`}
            onClick={handleAgregar}
            disabled={estaAgotado || stockRestante <= 0 || agregando}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
              estaAgotado
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
                : agregadoReciente
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {agregadoReciente ? (
              <>
                <Check size={16} />
                <span>¡Agregado!</span>
              </>
            ) : estaAgotado ? (
              <>
                <AlertCircle size={16} />
                <span>Agotado</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
