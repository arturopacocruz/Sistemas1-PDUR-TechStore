import React, { useState, useEffect } from 'react';
import type { Producto, Categoria, MetricasAdmin, Pedido, Usuario, LogAuditoria } from '../types';
import { api } from '../services/api';
import { ProductFormModal } from '../components/ProductFormModal';
import { QuickStockModal } from '../components/QuickStockModal';
import { UserFormModal } from '../components/UserFormModal';
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  RefreshCw,
  Package,
  AlertTriangle,
  TrendingUp,
  Sliders,
  Users,
  ShieldCheck,
  Power,
  Search,
  CheckCircle2
} from 'lucide-react';

export const AdministradorView: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [logsAuditoria, setLogsAuditoria] = useState<LogAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productoParaEditar, setProductoParaEditar] = useState<Producto | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [productoParaStock, setProductoParaStock] = useState<Producto | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'catalogo' | 'pedidos' | 'usuarios' | 'auditoria'>('catalogo');
  const [filtroAudit, setFiltroAudit] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const cargarDatosAdmin = async () => {
    try {
      setCargando(true);
      const [prodsData, catsData, metricasData, pedidosData, usersData, logsData] = await Promise.all([
        api.getProductosAdmin(),
        api.getCategorias(),
        api.getMetricas(),
        api.getPedidosAdmin(),
        api.getUsuarios(),
        api.getAuditLogs()
      ]);
      setProductos(prodsData);
      setCategorias(catsData);
      setMetricas(metricasData);
      setPedidos(pedidosData);
      setUsuarios(usersData);
      setLogsAuditoria(logsData);
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

  const handleToggleEstadoUsuario = async (u: Usuario) => {
    const nuevoEstado = u.estado === 'Inactivo' ? 'Activo' : 'Inactivo';
    const confirmMsg = u.estado === 'Inactivo' 
      ? `¿Desea reactivar la cuenta de "${u.nombre}"?`
      : `¿Seguro que desea desactivar la cuenta de "${u.nombre}"? El usuario no podrá iniciar sesión.`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await api.cambiarEstadoUsuario(u.id_usuario, nuevoEstado);
        await cargarDatosAdmin();
      } catch (err: any) {
        alert(err.message || 'Error al cambiar estado del usuario');
      }
    }
  };

  const getStatusBadge = (estado: string, stock: number) => {
    if (estado === 'Inactivo') {
      return <span className="badge badge-neutral">Inactivo (Oculto)</span>;
    }
    if (stock === 0 || estado === 'Agotado') {
      return <span className="badge badge-danger">Agotado (0 unid.)</span>;
    }
    if (stock <= 5) {
      return <span className="badge badge-warning">Bajo Stock ({stock})</span>;
    }
    return <span className="badge badge-success">Activo ({stock} unid.)</span>;
  };

  const getActionBadgeColor = (accion: string) => {
    if (accion.includes('FAILED') || accion.includes('BLOCKED') || accion.includes('REJECTED')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
    if (accion.includes('CREATE') || accion.includes('REGISTERED') || accion.includes('SUCCESS')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (accion.includes('UPDATE') || accion.includes('STATUS')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  };

  const logsFiltrados = logsAuditoria.filter(l => {
    if (!filtroAudit.trim()) return true;
    const q = filtroAudit.toLowerCase();
    return (
      l.accion.toLowerCase().includes(q) ||
      l.entidad_afectada.toLowerCase().includes(q) ||
      (l.ip_origen && l.ip_origen.toLowerCase().includes(q)) ||
      (l.id_entidad && l.id_entidad.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-warning font-mono">PANEL DE CONTROL</span>
            <span className="text-xs text-slate-400">Normativa ASFI / Ley N° 164</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
            Administración Central TechStore
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión integral de inventario, pedidos, usuarios y trazabilidad forense de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={cargarDatosAdmin}
            className="btn btn-secondary flex items-center gap-2 text-xs"
            title="Refrescar datos"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>

          {adminTab === 'catalogo' && (
            <button
              onClick={() => {
                setProductoParaEditar(null);
                setIsFormModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2 text-xs"
            >
              <Plus size={16} />
              <span>Nuevo Producto</span>
            </button>
          )}

          {adminTab === 'usuarios' && (
            <button
              onClick={() => {
                setUsuarioParaEditar(null);
                setIsUserModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2 text-xs"
            >
              <Plus size={16} />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {metricas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-heading">{metricas.totalProductos}</div>
              <div className="text-xs text-slate-400">Total Productos</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-heading">{metricas.activos}</div>
              <div className="text-xs text-slate-400">Productos Activos</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 font-heading">{metricas.bajoStock?.length || 0}</div>
              <div className="text-xs text-slate-400">Bajo Stock (&le;5)</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 font-heading">{usuarios.length}</div>
              <div className="text-xs text-slate-400">Usuarios Registrados</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Subtabs (4 Secciones) */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('catalogo')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            adminTab === 'catalogo'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package size={16} />
          <span>Gestión de Productos ({productos.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('pedidos')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            adminTab === 'pedidos'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={16} />
          <span>Gestión de Pedidos ({pedidos.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('usuarios')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            adminTab === 'usuarios'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={16} />
          <span>Gestión de Usuarios ({usuarios.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('auditoria')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            adminTab === 'auditoria'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Auditoría Forense ASFI ({logsAuditoria.length})</span>
        </button>
      </div>

      {/* ── TAB 1: PRODUCTOS ── */}
      {adminTab === 'catalogo' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
            <h3 className="text-base font-bold text-white font-heading">Inventario y Stock</h3>
            <span className="text-xs text-slate-400">{productos.length} items registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Producto</th>
                  <th className="py-3.5 px-4 font-semibold">Categoría</th>
                  <th className="py-3.5 px-4 font-semibold">Precio</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Estado</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productos.map(p => (
                  <tr key={p.id_producto} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imagen || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                          alt={p.nombre}
                          className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs">{p.nombre}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{p.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                        {p.categoria_nombre || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      Bs. {p.precio.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{p.stock}</span>
                        <button
                          onClick={() => {
                            setProductoParaStock(p);
                            setIsStockModalOpen(true);
                          }}
                          className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                          title="Ajustar Stock Rápido"
                        >
                          Ajustar
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(p.estado, p.stock)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setProductoParaEditar(p);
                            setIsFormModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 size={15} />
                        </button>

                        {p.estado === 'Inactivo' ? (
                          <button
                            onClick={() => handleReactivar(p.id_producto)}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            title="Reactivar producto en catálogo"
                          >
                            <Eye size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDesactivar(p.id_producto)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
                            title="Desactivar producto"
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

      {/* ── TAB 2: PEDIDOS ── */}
      {adminTab === 'pedidos' && (
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
              <Sliders size={40} className="mx-auto mb-3 opacity-40 text-slate-500" />
              <p>No se han registrado pedidos en el sistema.</p>
            </div>
          ) : (
            pedidos.map(ped => (
              <div key={ped.id_pedido} className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono text-cyan-400">{ped.numero_pedido}</span>
                    <span className="text-xs text-slate-400">Fecha: {ped.fecha}</span>
                    <span className="text-xs text-slate-400">Cliente: <strong className="text-slate-200">{ped.cliente_nombre}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-white font-mono">
                      Total: <span className="text-cyan-400">Bs. {ped.total.toFixed(2)}</span>
                    </div>

                    <select
                      value={ped.estado}
                      onChange={e => handleCambiarEstadoPedido(ped.id_pedido, e.target.value)}
                      className="select-field text-xs py-1.5 px-3 bg-slate-900 border border-white/15 rounded-lg text-white"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Preparando">Preparando</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </div>
                </div>

                {/* Billing Data if present */}
                {ped.nit_ci && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-center gap-4">
                    <span className="text-cyan-400 font-semibold uppercase">Facturación:</span>
                    <span>NIT/CI: <strong>{ped.nit_ci}</strong></span>
                    <span>Razón Social: <strong>{ped.razon_social || 'N/A'}</strong></span>
                  </div>
                )}

                {/* Items Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                  {ped.detalles?.map(det => (
                    <div key={det.id_detalle} className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/5">
                      <span>{det.cantidad}x {det.producto_nombre}</span>
                      <span className="font-mono text-slate-400">Bs. {det.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: USUARIOS ── */}
      {adminTab === 'usuarios' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Directorio de Cuentas de Usuario</h3>
              <p className="text-xs text-slate-400">Gestión de accesos, roles administrativos y estados de activación</p>
            </div>
            <span className="text-xs text-slate-400">{usuarios.length} cuentas registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Usuario</th>
                  <th className="py-3.5 px-4 font-semibold">Correo Electrónico</th>
                  <th className="py-3.5 px-4 font-semibold">Teléfono</th>
                  <th className="py-3.5 px-4 font-semibold">Rol</th>
                  <th className="py-3.5 px-4 font-semibold">Estado</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map(u => (
                  <tr key={u.id_usuario} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {u.nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.nombre}</div>
                          <div className="text-[11px] text-slate-500">ID #{u.id_usuario} &bull; Reg: {u.fecha_registro}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4 text-xs">{u.telefono || 'Sin teléfono'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        u.rol === 'ADMINISTRADOR'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        u.estado === 'Inactivo'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {u.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setUsuarioParaEditar(u);
                            setIsUserModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
                          title="Editar cuenta"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleToggleEstadoUsuario(u)}
                          className={`p-2 rounded-lg border transition-colors ${
                            u.estado === 'Inactivo'
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                          }`}
                          title={u.estado === 'Inactivo' ? 'Reactivar cuenta' : 'Desactivar cuenta'}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: AUDITORÍA ASFI ── */}
      {adminTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 md:p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <ShieldCheck size={18} className="text-cyan-400" />
                  <span>Bitácora de Auditoría Inalterable (Normativa ASFI / ISO 27001)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Registro criptográfico con sello SHA-256 HMAC y triggers SQL inmutables.
                </p>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por acción o IP..."
                  value={filtroAudit}
                  onChange={e => setFiltroAudit(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="uppercase bg-slate-950/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">ID Log</th>
                    <th className="py-3 px-3">Fecha / Hora (UTC)</th>
                    <th className="py-3 px-3">Acción Registrada</th>
                    <th className="py-3 px-3">Entidad / ID</th>
                    <th className="py-3 px-3">IP Origen</th>
                    <th className="py-3 px-3">Sello HMAC</th>
                    <th className="py-3 px-3 text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {logsFiltrados.map(log => {
                    const isExpanded = expandedLogId === log.id_log;
                    return (
                      <React.Fragment key={log.id_log}>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 text-slate-400">#{log.id_log}</td>
                          <td className="py-3 px-3 text-slate-300">{log.fecha_utc}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getActionBadgeColor(log.accion)}`}>
                              {log.accion}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {log.entidad_afectada} {log.id_entidad ? `(${log.id_entidad})` : ''}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{log.ip_origen}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Válido ({log.hash_integridad.substring(0, 8)}...)</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id_log)}
                              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/10 transition-colors font-sans"
                            >
                              {isExpanded ? 'Ocultar' : 'Ver JSON'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-950/80">
                            <td colSpan={7} className="p-4">
                              <div className="rounded-xl bg-black/60 p-3 border border-white/10 text-[11px] text-emerald-300 overflow-x-auto">
                                <div className="text-slate-400 mb-1 font-sans">Detalles de carga útil y agente:</div>
                                <pre>{JSON.stringify(log.detalles, null, 2)}</pre>
                                <div className="text-slate-500 mt-2 text-[10px] font-sans">
                                  User-Agent: {log.user_agent || 'N/A'} | Hash Completo: {log.hash_integridad}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
        isOpen={isStockModalOpen}
        producto={productoParaStock}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={cargarDatosAdmin}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        usuarioParaEditar={usuarioParaEditar}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={cargarDatosAdmin}
      />
    </div>
  );
};
