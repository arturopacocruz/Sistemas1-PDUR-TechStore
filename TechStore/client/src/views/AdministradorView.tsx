import React, { useState, useEffect } from 'react';
import type { Producto, Categoria, MetricasAdmin, Pedido } from '../types';
import { api } from '../services/api';
import { ProductFormModal } from '../components/ProductFormModal';
import { QuickStockModal } from '../components/QuickStockModal';
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  RefreshCw,
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Sliders
} from 'lucide-react';

export const AdministradorView: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [, setCargando] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productoParaEditar, setProductoParaEditar] = useState<Producto | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [productoParaStock, setProductoParaStock] = useState<Producto | null>(null);

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'catalogo' | 'pedidos'>('catalogo');

  const cargarDatosAdmin = async () => {
    try {
      setCargando(true);
      const [prodsData, catsData, metricasData, pedidosData] = await Promise.all([
        api.getProductosAdmin(),
        api.getCategorias(),
        api.getMetricas(),
        api.getPedidosAdmin()
      ]);
      setProductos(prodsData);
      setCategorias(catsData);
      setMetricas(metricasData);
      setPedidos(pedidosData);
    } catch (err) {
      console.error('Error al cargar panel de administración', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  const handleDesactivar = async (idProducto: number) => {
    if (window.confirm('¿Seguro que deseas desactivar este producto? Dejará de ser visible en el catálogo de clientes pero se mantendrá en el historial.')) {
      try {
        await api.desactivarProducto(idProducto);
        await cargarDatosAdmin();
      } catch (err: any) {
        alert(err.message || 'Error al desactivar');
      }
    }
  };

  const handleReactivar = async (idProducto: number) => {
    try {
      await api.reactivarProducto(idProducto);
      await cargarDatosAdmin();
    } catch (err: any) {
      alert(err.message || 'Error al reactivar');
    }
  };

  const handleCambiarEstadoPedido = async (idPedido: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/pedidos/${idPedido}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarDatosAdmin();
      }
    } catch (err) {
      console.error('Error al actualizar estado', err);
    }
  };

  const getStatusBadge = (estado: string, stock: number) => {
    if (estado === 'Inactivo') {
      return <span className="badge badge-neutral">Inactivo (Oculto)</span>;
    }
    if (stock === 0 || estado === 'Agotado') {
      return <span className="badge badge-danger">Agotado (0 unid.)</span>;
    }
    if (stock <= 10) {
      return <span className="badge badge-warning">Bajo Stock ({stock} unid.)</span>;
    }
    return <span className="badge badge-success">Activo ({stock} unid.)</span>;
  };

  return (
    <div className="page-container">
      {/* Admin Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '36px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-warning">Modo Administrador</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>HU-04: Gestión de Catálogo e Inventario</span>
          </div>
          <h1 style={{ fontSize: '2.5rem' }}>Panel de Control & Reportes</h1>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={cargarDatosAdmin} className="btn btn-secondary btn-sm" title="Refrescar">
            <RefreshCw size={16} />
            <span>Refrescar</span>
          </button>
          <button
            onClick={() => {
              setProductoParaEditar(null);
              setIsFormModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Reporte Visual HU-04) */}
      {metricas && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          <div className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Productos</span>
              <Package size={22} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{metricas.totalProductos}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {metricas.activos} activos · {metricas.inactivos} inactivos
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unidades en Inventario</span>
              <Layers size={22} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{metricas.totalStock}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Stock total registrado en tienda
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bajo Stock / Agotados</span>
              <AlertTriangle size={22} color={metricas.agotados > 0 ? 'var(--danger)' : 'var(--warning)'} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: metricas.agotados > 0 ? '#f87171' : '#fbbf24', fontFamily: 'var(--font-heading)' }}>
              {metricas.agotados + metricas.bajoStock.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {metricas.agotados} agotados · {metricas.bajoStock.length} por reabastecer
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pedidos Realizados</span>
              <TrendingUp size={22} color="var(--success)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{pedidos.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Total transacciones del MVP
            </div>
          </div>
        </div>
      )}

      {/* Sub-nav switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <button
          onClick={() => setAdminTab('catalogo')}
          className={`btn btn-sm ${adminTab === 'catalogo' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Package size={16} />
          <span>Gestión de Productos ({productos.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('pedidos')}
          className={`btn btn-sm ${adminTab === 'pedidos' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Sliders size={16} />
          <span>Gestión de Pedidos ({pedidos.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT (HU-04) */}
      {adminTab === 'catalogo' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>ID</th>
                  <th style={{ padding: '14px 18px' }}>Producto</th>
                  <th style={{ padding: '14px 18px' }}>Categoría</th>
                  <th style={{ padding: '14px 18px' }}>Precio</th>
                  <th style={{ padding: '14px 18px' }}>Stock</th>
                  <th style={{ padding: '14px 18px' }}>Estado</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr
                    key={prod.id_producto}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s',
                      opacity: prod.estado === 'Inactivo' ? 0.6 : 1
                    }}
                  >
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      #{prod.id_producto}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.imagen || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                          alt={prod.nombre}
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prod.nombre}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {prod.descripcion?.slice(0, 45)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-neutral">{prod.categoria_nombre}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      Bs. {prod.precio.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700 }}>{prod.stock}</span>
                        <button
                          onClick={() => {
                            setProductoParaStock(prod);
                            setIsStockModalOpen(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '4px', height: '24px', width: '24px' }}
                          title="Ajuste rápido de inventario"
                        >
                          <Sliders size={12} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {getStatusBadge(prod.estado, prod.stock)}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setProductoParaEditar(prod);
                            setIsFormModalOpen(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          title="Editar producto"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Soft-Delete or Reactivate (HU-04) */}
                        {prod.estado === 'Inactivo' ? (
                          <button
                            onClick={() => handleReactivar(prod.id_producto)}
                            className="btn btn-secondary btn-icon"
                            style={{ color: 'var(--success)' }}
                            title="Reactivar producto en catálogo"
                          >
                            <Eye size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDesactivar(prod.id_producto)}
                            className="btn btn-danger btn-icon"
                            title="Desactivar producto (Soft-Delete)"
                          >
                            <EyeOff size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {adminTab === 'pedidos' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>N° Pedido</th>
                  <th style={{ padding: '14px 18px' }}>Cliente</th>
                  <th style={{ padding: '14px 18px' }}>Fecha</th>
                  <th style={{ padding: '14px 18px' }}>Total</th>
                  <th style={{ padding: '14px 18px' }}>Estado</th>
                  <th style={{ padding: '14px 18px' }}>Cambiar Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(ped => (
                  <tr key={ped.id_pedido} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {ped.numero_pedido}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{ped.cliente_nombre}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ped.cliente_email}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {ped.fecha}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      Bs. {ped.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-success">{ped.estado}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <select
                        value={ped.estado}
                        onChange={e => handleCambiarEstadoPedido(ped.id_pedido, e.target.value)}
                        className="select-field"
                        style={{ padding: '4px 10px', fontSize: '0.85rem', width: 'auto' }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Preparando">Preparando</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={cargarDatosAdmin}
        productoParaEditar={productoParaEditar}
        categorias={categorias}
      />

      <QuickStockModal
        producto={productoParaStock}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={cargarDatosAdmin}
      />
    </div>
  );
};
