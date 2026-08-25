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
      // HU-01: solo mostrar categorías activas en el filtro (Diccionario de Datos: categoria.estado)
      setCategorias(catsData.filter((c) => c.estado === 'Activa'));
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo');
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial y cuando cambia la categoría seleccionada
  useEffect(() => {
    cargarDatos(busqueda, categoriaSeleccionada);
  }, [categoriaSeleccionada]); // eslint-disable-line react-hooks/exhaustive-deps

  // Criterio HU-01: búsqueda con debounce de 350ms (no recarga en cada tecla)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/8 p-8 mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(6,182,212,0.15)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 mb-4">
            <Sparkles size={13} />
            Tienda Oficial · Tarija, Bolivia
          </span>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3 font-heading">
            Tecnología de última generación
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              con entrega inmediata
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Explora nuestro catálogo de hardware, laptops y periféricos con stock verificado en
            tiempo real y soporte local.
          </p>
        </div>
      </section>

      {/* ── Controles de Búsqueda y Filtro (HU-01) ── */}
      <div className="mb-8 space-y-4">

        {/* Barra de búsqueda */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1" style={{ minWidth: '260px', maxWidth: '500px' }}>
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              ref={inputRef}
              id="hu01-busqueda"
              type="text"
              placeholder="Buscar por nombre (ej. Lenovo, Galaxy, Mouse)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-slate-900/70 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {tieneFiltriosActivos && (
              <button
                onClick={handleLimpiarFiltros}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <X size={13} />
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => cargarDatos(busqueda, categoriaSeleccionada)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
              title="Actualizar catálogo"
            >
              <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtro por categoría (Criterio HU-01) */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
            <Tag size={13} />
            Categoría:
          </span>
          <button
            id="hu01-cat-todas"
            onClick={() => setCategoriaSeleccionada(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              categoriaSeleccionada === null
                ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            <Layers size={12} />
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              id={`hu01-cat-${cat.id_categoria}`}
              onClick={() => setCategoriaSeleccionada(cat.id_categoria)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                categoriaSeleccionada === cat.id_categoria
                  ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Resultado count */}
        {!cargando && !error && (
          <div className="text-xs text-slate-500">
            {productos.length > 0 ? (
              <>
                <span className="text-slate-300 font-semibold">{productos.length}</span>{' '}
                {productos.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                {tieneFiltriosActivos && (
                  <span className="text-slate-500">
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
        /* Estado de carga */
        <div className="text-center py-24 text-slate-400">
          <RefreshCw size={38} className="animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-base font-semibold text-slate-300">Cargando catálogo en tiempo real...</p>
          <p className="text-sm text-slate-500 mt-1">Verificando stock disponible</p>
        </div>
      ) : error ? (
        /* Error de conexión */
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8">
            <AlertCircle size={42} className="mx-auto mb-4 text-rose-400" />
            <h3 className="text-lg font-bold text-white mb-2">Error al conectar con la tienda</h3>
            <p className="text-sm text-slate-400 mb-5">{error}</p>
            <button
              onClick={() => cargarDatos(busqueda, categoriaSeleccionada)}
              className="btn btn-primary"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : productos.length === 0 ? (
        /* Criterio HU-01: Estado vacío amigable */
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-8">
            <Search size={48} className="mx-auto mb-4 text-slate-600" />
            <h2 className="text-xl font-bold text-white mb-2">No se encontraron productos</h2>
            <p className="text-sm text-slate-400 mb-6">
              No hay artículos que coincidan con{' '}
              {busqueda ? `"${busqueda}"` : 'los filtros seleccionados'}.
              Intenta con otro término o categoría.
            </p>
            <button onClick={handleLimpiarFiltros} className="btn btn-secondary">
              Restablecer filtros
            </button>
          </div>
        </div>
      ) : (
        /* Grid de productos */
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {productos.map((prod) => (
            <ProductCard key={prod.id_producto} producto={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
