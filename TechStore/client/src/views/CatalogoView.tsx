import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Producto, Categoria } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Search, RefreshCw, Layers, Sparkles, AlertCircle, X, Tag } from 'lucide-react';

export const CatalogoView: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cargarDatos = useCallback(async (q?: string, cat?: number | null) => {
    try {
      setCargando(true);
      setError(null);
      const [prodsData, catsData] = await Promise.all([
        api.getProductos({
          q: q?.trim() || undefined,
          categoria: cat ?? undefined,
        }),
        api.getCategorias(),
      ]);
      setProductos(prodsData);
      setCategorias(catsData.filter((c) => c.estado === 'Activa'));
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos(busqueda, categoriaSeleccionada);
  }, [categoriaSeleccionada]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = setTimeout(() => {
      cargarDatos(busqueda, categoriaSeleccionada);
    }, 350);
    return () => clearTimeout(handler);
  }, [busqueda]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada(null);
    inputRef.current?.focus();
  };

  const tieneFiltriosActivos = busqueda.trim() !== '' || categoriaSeleccionada !== null;

  return (
    <div className="page-container">

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-10 md:p-14 mb-12 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(6,182,212,0.18)_0%,_transparent_65%)] pointer-events-none" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
            <Sparkles size={14} />
            <span>Tienda Oficial · Tarija, Bolivia</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-heading">
            Tecnología de última generación
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              con entrega inmediata
            </span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed pt-1">
            Explora nuestro catálogo de hardware, laptops y periféricos con stock verificado en
            tiempo real, facturación electrónica y garantía oficial.
          </p>
        </div>
      </section>

      {/* ── Controles de Búsqueda y Filtro (HU-01) ── */}
      <div className="mb-12 space-y-6">

        {/* Barra de búsqueda */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1" style={{ minWidth: '280px', maxWidth: '520px' }}>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              id="hu01-busqueda"
              type="text"
              placeholder="Buscar por nombre (ej. Lenovo, Galaxy, Mouse)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-11 py-3 rounded-2xl border border-white/15 bg-slate-900/80 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {tieneFiltriosActivos && (
              <button
                onClick={handleLimpiarFiltros}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <X size={14} />
                <span>Limpiar filtros</span>
              </button>
            )}
            <button
              onClick={() => cargarDatos(busqueda, categoriaSeleccionada)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/15 bg-slate-900/80 text-slate-200 hover:bg-white/10 transition-colors shadow-sm"
              title="Actualizar catálogo"
            >
              <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Filtro por categoría (Criterio HU-01) */}
        <div className="flex gap-2.5 flex-wrap items-center pt-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            <Tag size={13} className="text-cyan-400" />
            Categoría:
          </span>
          <button
            id="hu01-cat-todas"
            onClick={() => setCategoriaSeleccionada(null)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              categoriaSeleccionada === null
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Todas</span>
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              id={`hu01-cat-${cat.id_categoria}`}
              onClick={() => setCategoriaSeleccionada(cat.id_categoria)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                categoriaSeleccionada === cat.id_categoria
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Resultado count */}
        {!cargando && !error && (
          <div className="text-xs text-slate-400 pt-1">
            {productos.length > 0 ? (
              <>
                <span className="text-white font-bold">{productos.length}</span>{' '}
                {productos.length === 1 ? 'producto disponible' : 'productos disponibles'}
                {tieneFiltriosActivos && (
                  <span className="text-slate-400">
                    {busqueda && ` · búsqueda "${busqueda}"`}
                    {categoriaSeleccionada && ` · ${categorias.find(c => c.id_categoria === categoriaSeleccionada)?.nombre || ''}`}
                  </span>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Grid de Catálogo ── */}
      {cargando ? (
        <div className="text-center py-28 text-slate-400">
          <RefreshCw size={42} className="animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-lg font-bold text-white font-heading">Cargando catálogo en tiempo real...</p>
          <p className="text-sm text-slate-400 mt-2">Verificando inventario disponible</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 max-w-lg mx-auto">
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 space-y-4">
            <AlertCircle size={48} className="mx-auto text-rose-400" />
            <h3 className="text-xl font-bold text-white font-heading">Error al conectar con la tienda</h3>
            <p className="text-sm text-slate-300">{error}</p>
            <button
              onClick={() => cargarDatos(busqueda, categoriaSeleccionada)}
              className="btn btn-primary mt-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-24 max-w-lg mx-auto">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 space-y-4">
            <Search size={52} className="mx-auto text-slate-500" />
            <h2 className="text-2xl font-bold text-white font-heading">No se encontraron productos</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              No hay artículos que coincidan con{' '}
              {busqueda ? `"${busqueda}"` : 'los filtros seleccionados'}.
              Intenta con otro término o categoría.
            </p>
            <button onClick={handleLimpiarFiltros} className="btn btn-secondary mt-2">
              Restablecer filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
          {productos.map((prod) => (
            <ProductCard key={prod.id_producto} producto={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
