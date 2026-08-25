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
  // Stock real restante = stock del producto - unidades ya en carrito
  const stockRestante = producto.stock - cantidadEnCarrito;
  // Criterio HU-01 / Diccionario de Datos: estado 'Agotado' || stock === 0
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
      // Errores manejados por Toast en CartContext
    } finally {
      setAgregando(false);
    }
  };

  return (
    <article
      id={`producto-${producto.id_producto}`}
      className={`flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        estaAgotado
          ? 'border-white/5 bg-slate-900/40 opacity-75'
          : 'border-white/10 bg-slate-900/70 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5'
      }`}
    >
      {/* ── Imagen del producto ── */}
      <div className="relative w-full overflow-hidden bg-black/40" style={{ paddingTop: '62%' }}>
        <img
          src={
            producto.imagen ||
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
          }
          alt={producto.nombre}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Overlay semitransparente si está agotado */}
        {estaAgotado && (
          <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-slate-950/80 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-widest uppercase">
              Sin Stock
            </span>
          </div>
        )}

        {/* ── Badge de estado (Criterio HU-01: mostrar disponibilidad) ── */}
        <div className="absolute top-3 right-3">
          {estaAgotado ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
              Agotado
            </span>
          ) : stockBajo ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold animate-pulse">
              ¡Últimas {stockRestante}!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
              Disponible
            </span>
          )}
        </div>

        {/* Categoría */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/75 border border-white/10 text-slate-400 text-[11px] font-medium backdrop-blur-sm">
            {producto.categoria_nombre || 'Tecnología'}
          </span>
        </div>
      </div>

      {/* ── Información del producto ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white leading-snug mb-1">
            {producto.nombre}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {producto.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        {/* Precio y Stock (Criterio HU-01: precio y disponibilidad visibles en catálogo) */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Precio</span>
            <span className="text-xl font-extrabold text-cyan-400 font-heading">
              Bs. {producto.precio.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Stock</span>
            <span className={`text-sm font-bold flex items-center gap-1 justify-end ${estaAgotado ? 'text-rose-400' : 'text-slate-300'}`}>
              <Package size={13} />
              {estaAgotado ? '0 unid.' : `${producto.stock} unid.`}
            </span>
          </div>
        </div>

        {/* Indicador de unidades en carrito */}
        {cantidadEnCarrito > 0 && (
          <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
            <ShoppingCart size={11} />
            {cantidadEnCarrito} en tu carrito
          </div>
        )}

        {/* ── Controles de cantidad + Botón agregar (HU-02 integration) ── */}
        <div className="flex gap-2 items-center mt-auto pt-1">
          {!estaAgotado && stockRestante > 0 && (
            <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                disabled={cantidad <= 1}
                className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="px-2.5 text-sm font-bold text-white w-7 text-center">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.min(stockRestante, prev + 1))}
                disabled={cantidad >= stockRestante}
                className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          )}

          <button
            id={`btn-agregar-${producto.id_producto}`}
            onClick={handleAgregar}
            disabled={estaAgotado || stockRestante <= 0 || agregando}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              estaAgotado
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
                : agregadoReciente
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 hover:shadow-sm hover:shadow-cyan-500/20'
            }`}
          >
            {agregadoReciente ? (
              <>
                <Check size={15} />
                <span>¡Agregado!</span>
              </>
            ) : estaAgotado ? (
              <>
                <AlertCircle size={15} />
                <span>Agotado</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
