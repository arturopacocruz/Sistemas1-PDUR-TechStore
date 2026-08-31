import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import type { Pedido, DireccionEntrega } from '../types';
import {
  CheckCircle2, MapPin, ArrowLeft, AlertCircle,
  ShoppingBag, Phone, Home, User, RefreshCw, ClipboardList,
  ChevronDown, ChevronUp, Lock
} from 'lucide-react';

interface PedidoViewProps {
  onBackToCatalog: () => void;
  isCheckoutMode?: boolean;
}

// Estados del pedido con su color y texto según DD §4.7
const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Pendiente:  { label: 'Pendiente',  color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30' },
  Confirmado: { label: 'Confirmado', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  Preparando: { label: 'En preparación', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  Entregado:  { label: 'Entregado',  color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    border: 'border-cyan-500/30' },
  Rechazado:  { label: 'Rechazado',  color: 'text-rose-400',    bg: 'bg-rose-500/15',    border: 'border-rose-500/30' },
};

type FormField = keyof Pick<DireccionEntrega, 'nombre_receptor' | 'telefono' | 'ciudad' | 'direccion'>;

const INITIAL_FORM: DireccionEntrega = {
  nombre_receptor: '',
  direccion: '',
  ciudad: 'Tarija',
  telefono: '',
};

// Validación local por campo (espejo del DD §4.6 DIRECCION_ENTREGA)
function validarCampo(field: FormField, value: string): string | null {
  const val = value.trim();
  switch (field) {
    case 'nombre_receptor':
      if (!val) return 'El nombre del receptor es obligatorio.';
      if (val.length > 100) return 'Máximo 100 caracteres.';
      return null;
    case 'direccion':
      if (!val) return 'La dirección física de entrega es obligatoria.';
      if (val.length > 255) return 'Máximo 255 caracteres.';
      return null;
    case 'ciudad':
      if (!val) return 'La ciudad de entrega es obligatoria.';
      if (val.length > 100) return 'Máximo 100 caracteres.';
      return null;
    case 'telefono':
      if (!val) return 'El teléfono de contacto es obligatorio.';
      if (val.length > 20) return 'Máximo 20 caracteres.';
      return null;
    default:
      return null;
  }
}

export const PedidoView: React.FC<PedidoViewProps> = ({ onBackToCatalog, isCheckoutMode = false }) => {
  const { usuarioActual } = useAuth();
  const { carrito, refrescarCarrito } = useCart();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);
  const [mostrarCheckout, setMostrarCheckout] = useState(isCheckoutMode);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);

  // Estado del formulario: valores + errores por campo (HU-03 UC4)
  const [formData, setFormData] = useState<DireccionEntrega>(() => ({
    ...INITIAL_FORM,
    nombre_receptor: usuarioActual?.nombre || '',
    telefono: usuarioActual?.telefono || '',
  }));
  const [formErrors, setFormErrors] = useState<Partial<Record<FormField, string>>>({});
  const [camposTocados, setCamposTocados] = useState<Partial<Record<FormField, boolean>>>({});

  useEffect(() => {
    if (usuarioActual) {
      cargarPedidosUsuario();
      setFormData(prev => ({
        ...prev,
        nombre_receptor: prev.nombre_receptor || usuarioActual.nombre,
        telefono: prev.telefono || usuarioActual.telefono || '',
      }));
    }
  }, [usuarioActual]);

  const cargarPedidosUsuario = async () => {
    if (!usuarioActual) return;
    try {
      setCargandoPedidos(true);
      const data = await api.getPedidosUsuario(usuarioActual.id_usuario);
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos', err);
    } finally {
      setCargandoPedidos(false);
    }
  };

  // Validar campo al salir del input (onBlur)
  const handleBlur = (field: FormField) => {
    setCamposTocados(prev => ({ ...prev, [field]: true }));
    const err = validarCampo(field, formData[field] as string);
    setFormErrors(prev => ({ ...prev, [field]: err ?? undefined }));
  };

  const handleChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Re-validar sólo si el campo ya fue tocado
    if (camposTocados[field]) {
      const err = validarCampo(field, value);
      setFormErrors(prev => ({ ...prev, [field]: err ?? undefined }));
    }
  };

  // Validar todos los campos antes del submit
  const validarFormulario = (): boolean => {
    const campos: FormField[] = ['nombre_receptor', 'telefono', 'ciudad', 'direccion'];
    const nuevosErrores: Partial<Record<FormField, string>> = {};
    let valido = true;
    for (const campo of campos) {
      const err = validarCampo(campo, formData[campo] as string);
      if (err) { nuevosErrores[campo] = err; valido = false; }
    }
    setFormErrors(nuevosErrores);
    setCamposTocados({ nombre_receptor: true, telefono: true, ciudad: true, direccion: true });
    return valido;
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioActual) return;

    // 1. Validación local completa (espejo del DD)
    if (!validarFormulario()) return;

    // 2. Verificar carrito no vacío (HU-03 Criterio 1)
    const items = carrito?.items || [];
    if (items.length === 0) {
      setErrorCheckout('El carrito está vacío. Agregue productos antes de realizar el pedido.');
      return;
    }

    try {
      setProcesando(true);
      setErrorCheckout(null);
      const res = await api.checkout(usuarioActual.id_usuario, formData);
      setPedidoConfirmado(res.pedido);
      await refrescarCarrito();
      await cargarPedidosUsuario();
      setMostrarCheckout(false);
      // Reset form for next use
      setFormData({ ...INITIAL_FORM, nombre_receptor: usuarioActual.nombre, telefono: usuarioActual.telefono || '' });
      setFormErrors({});
      setCamposTocados({});
    } catch (err: any) {
      setErrorCheckout(err.message || 'Error al procesar el pedido.');
    } finally {
      setProcesando(false);
    }
  };

  const getBadgeEstado = (estado: string) => {
    const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG['Pendiente'];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
        {cfg.label}
      </span>
    );
  };

  const items = carrito?.items || [];
  const total = carrito?.total || 0;

  // ── 1. Pantalla de Confirmación (HU-03 UC9) ──────────────────────────────
  if (pedidoConfirmado) {
    return (
      <div className="page-container" style={{ maxWidth: '780px' }}>
        <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/80 p-10 md:p-12 text-center shadow-xl shadow-emerald-500/5 space-y-6">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={44} className="text-emerald-400" />
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Pedido Registrado con Éxito
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading">¡Gracias por tu compra!</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Tu pedido fue confirmado y el inventario fue descontado en tiempo real.
            Recibirás tus productos en Tarija según la dirección indicada.
          </p>

          {/* Número de pedido autogenerado (HU-03 UC8) */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Número de Identificación del Pedido</p>
            <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-heading tracking-widest mb-2">
              {pedidoConfirmado.numero_pedido}
            </p>
            <p className="text-xs text-slate-400">
              Fecha: {pedidoConfirmado.fecha} · Total: <span className="text-white font-bold text-sm">Bs. {pedidoConfirmado.total.toFixed(2)}</span>
            </p>
          </div>

          {/* Dirección de entrega */}
          {pedidoConfirmado.direccion && (
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-left text-sm space-y-1">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <MapPin size={14} />
                Dirección de Entrega Registrada
              </p>
              <p className="text-white font-bold text-base">{pedidoConfirmado.direccion.nombre_receptor}</p>
              <p className="text-slate-300">{pedidoConfirmado.direccion.direccion}, {pedidoConfirmado.direccion.ciudad}</p>
              <p className="text-slate-400">Tel: {pedidoConfirmado.direccion.telefono}</p>
            </div>
          )}

          {/* Detalle de productos del pedido */}
          {pedidoConfirmado.detalles && pedidoConfirmado.detalles.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-800/40 divide-y divide-white/5 text-left text-sm overflow-hidden">
              {pedidoConfirmado.detalles.map(det => (
                <div key={det.id_detalle} className="flex justify-between items-center px-5 py-3">
                  <span className="text-slate-200 font-medium">{det.producto_nombre} <span className="text-slate-400 text-xs font-bold">×{det.cantidad}</span></span>
                  <span className="text-cyan-300 font-bold">Bs. {det.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Cumplimiento Ley N° 164 */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-950/70 rounded-xl px-4 py-3 border border-white/5">
            <Lock size={14} className="text-cyan-400 shrink-0" />
            <span>Cumplimiento <strong className="text-slate-200">Ley N° 164</strong>: Este pedido constituye un comprobante de compraventa electrónico con validez legal en Bolivia.</span>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button onClick={() => setPedidoConfirmado(null)} className="btn btn-secondary">
              Ver Historial de Pedidos
            </button>
            <button onClick={onBackToCatalog} className="btn btn-primary">
              Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Formulario de Checkout (HU-03 UC3 + UC4) ──────────────────────────
  if (mostrarCheckout) {
    return (
      <div className="page-container" style={{ maxWidth: '1100px' }}>
        <button
          onClick={() => setMostrarCheckout(false)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-8 px-3 py-1.5 rounded-lg hover:bg-white/5 w-fit"
        >
          <ArrowLeft size={16} />
          <span>Volver al Carrito</span>
        </button>

        {/* HU-03: Carrito vacío no puede hacer checkout (Criterio 1) */}
        {items.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-8">
              <ShoppingBag size={48} className="mx-auto mb-4 text-slate-600" />
              <h2 className="text-xl font-bold text-white mb-2">Carrito vacío</h2>
              <p className="text-slate-400 text-sm mb-6">No puedes realizar un pedido con el carrito vacío.</p>
              <button onClick={onBackToCatalog} className="btn btn-primary">Ir al Catálogo</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>

            {/* ── Formulario de datos de entrega (HU-03 UC3) ── */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-md">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6 font-heading">
                <MapPin size={22} className="text-cyan-400" />
                <span>Datos de Entrega</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 font-mono">HU-03</span>
              </h2>

              {/* Error global */}
              {errorCheckout && (
                <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 mb-6 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorCheckout}</span>
                </div>
              )}

              <form onSubmit={handleSubmitCheckout} noValidate className="space-y-5">

                {/* Nombre receptor */}
                <div className="space-y-2">
                  <label htmlFor="hu03-nombre" className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <User size={13} className="text-cyan-400" />
                    <span>Nombre de quien recibe *</span>
                  </label>
                  <input
                    id="hu03-nombre"
                    type="text"
                    maxLength={100}
                    placeholder="Ej. Arturo Cruz"
                    value={formData.nombre_receptor}
                    onChange={e => handleChange('nombre_receptor', e.target.value)}
                    onBlur={() => handleBlur('nombre_receptor')}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-white placeholder-slate-500 bg-slate-950/60 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.nombre_receptor
                        ? 'border-rose-500/60 focus:ring-rose-500/30'
                        : 'border-white/15 focus:border-cyan-500 focus:ring-cyan-500/20'
                    }`}
                  />
                  {formErrors.nombre_receptor && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1.5">
                      <AlertCircle size={12} /><span>{formErrors.nombre_receptor}</span>
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label htmlFor="hu03-telefono" className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Phone size={13} className="text-cyan-400" />
                    <span>Teléfono de contacto *</span>
                  </label>
                  <input
                    id="hu03-telefono"
                    type="tel"
                    maxLength={20}
                    placeholder="Ej. 70000001"
                    value={formData.telefono}
                    onChange={e => handleChange('telefono', e.target.value)}
                    onBlur={() => handleBlur('telefono')}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-white placeholder-slate-500 bg-slate-950/60 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.telefono
                        ? 'border-rose-500/60 focus:ring-rose-500/30'
                        : 'border-white/15 focus:border-cyan-500 focus:ring-cyan-500/20'
                    }`}
                  />
                  {formErrors.telefono && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1.5">
                      <AlertCircle size={12} /><span>{formErrors.telefono}</span>
                    </p>
                  )}
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <label htmlFor="hu03-ciudad" className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <MapPin size={13} className="text-cyan-400" />
                    <span>Ciudad *</span>
                  </label>
                  <input
                    id="hu03-ciudad"
                    type="text"
                    maxLength={100}
                    placeholder="Ej. Tarija"
                    value={formData.ciudad}
                    onChange={e => handleChange('ciudad', e.target.value)}
                    onBlur={() => handleBlur('ciudad')}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-white placeholder-slate-500 bg-slate-950/60 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.ciudad
                        ? 'border-rose-500/60 focus:ring-rose-500/30'
                        : 'border-white/15 focus:border-cyan-500 focus:ring-cyan-500/20'
                    }`}
                  />
                  {formErrors.ciudad && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1.5">
                      <AlertCircle size={12} /><span>{formErrors.ciudad}</span>
                    </p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <label htmlFor="hu03-direccion" className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Home size={13} className="text-cyan-400" />
                    <span>Dirección física exacta *</span>
                  </label>
                  <textarea
                    id="hu03-direccion"
                    maxLength={255}
                    rows={3}
                    placeholder="Ej. Av. Las Américas #450, frente a la plaza principal..."
                    value={formData.direccion}
                    onChange={e => handleChange('direccion', e.target.value)}
                    onBlur={() => handleBlur('direccion')}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-white placeholder-slate-500 bg-slate-950/60 focus:outline-none focus:ring-2 transition-all resize-none ${
                      formErrors.direccion
                        ? 'border-rose-500/60 focus:ring-rose-500/30'
                        : 'border-white/15 focus:border-cyan-500 focus:ring-cyan-500/20'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {formErrors.direccion
                      ? <p className="text-rose-400 text-xs flex items-center gap-1.5"><AlertCircle size={12} /><span>{formErrors.direccion}</span></p>
                      : <span />
                    }
                    <span className="text-xs text-slate-400">{formData.direccion.length}/255</span>
                  </div>
                </div>

                {/* Botón de confirmación */}
                <button
                  type="submit"
                  id="hu03-confirmar"
                  disabled={procesando}
                  className="w-full btn btn-primary py-3.5 text-base font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                >
                  {procesando ? (
                    <><RefreshCw size={16} className="animate-spin" /><span>Verificando stock y procesando...</span></>
                  ) : (
                    <><CheckCircle2 size={16} /><span>Confirmar Pedido · Bs. {total.toFixed(2)}</span></>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center pt-2">
                  <Lock size={13} className="text-cyan-400 shrink-0" />
                  <span>Ley N° 164: La confirmación genera un comprobante electrónico con validez legal.</span>
                </div>
              </form>
            </div>

            {/* ── Resumen de la orden ── */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 h-fit shadow-md space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5 font-heading">
                <ShoppingBag size={20} className="text-cyan-400" />
                <span>Resumen de la Orden</span>
              </h3>
              <div className="space-y-4 divide-y divide-white/5">
                {items.map(item => (
                  <div key={item.id_item} className="flex justify-between items-center pt-3 first:pt-0">
                    <div>
                      <p className="text-sm font-bold text-white leading-snug">{item.producto?.nombre}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.cantidad} × Bs. {item.precio_unitario.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-400 shrink-0 ml-4">Bs. {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-base font-bold text-slate-300">Total Final</span>
                <span className="text-3xl font-extrabold text-white font-heading">Bs. {total.toFixed(2)}</span>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 text-xs text-slate-300 leading-relaxed">
                El inventario de los productos se descuenta en el momento exacto de confirmación del pedido.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 3. Historial de Pedidos del Usuario ───────────────────────────────────
  return (
    <div className="page-container" style={{ maxWidth: '960px' }}>
      <div className="flex flex-wrap justify-between items-center gap-6 mb-10 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white font-heading">Mis Pedidos</h1>
          <p className="text-slate-400 text-sm">
            Historial de compras de <strong className="text-white">{usuarioActual?.nombre}</strong>
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={() => setMostrarCheckout(true)} className="btn btn-primary">
            <ShoppingBag size={16} />
            Completar Pedido Actual ({items.length})
          </button>
        )}
      </div>

      {cargandoPedidos ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-cyan-500" />
          <p>Cargando historial...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-12 text-center">
          <ClipboardList size={52} className="mx-auto mb-4 text-slate-600 opacity-40" />
          <h3 className="text-xl font-bold text-white mb-2">Sin pedidos registrados</h3>
          <p className="text-slate-400 text-sm mb-6">
            Cuando confirmes un carrito, tus pedidos aparecerán aquí con su número de seguimiento.
          </p>
          <button onClick={onBackToCatalog} className="btn btn-primary">Ir al Catálogo</button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map(ped => {
            const isExpanded = pedidoExpandido === ped.id_pedido;
            return (
              <div key={ped.id_pedido} className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden">
                {/* Header del pedido */}
                <div
                  className="flex flex-wrap justify-between items-center p-5 gap-3 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => setPedidoExpandido(isExpanded ? null : ped.id_pedido)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-lg font-extrabold text-cyan-400 font-heading">{ped.numero_pedido}</span>
                        {getBadgeEstado(ped.estado)}
                      </div>
                      <p className="text-xs text-slate-500">
                        Fecha: {ped.fecha} · {ped.detalles?.length || 0} artículo(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total pagado</p>
                      <p className="text-xl font-extrabold text-white font-heading">Bs. {ped.total.toFixed(2)}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {/* Detalle expandible */}
                {isExpanded && (
                  <div className="border-t border-white/8 p-5 space-y-4">
                    {/* Artículos */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Artículos incluidos</p>
                      <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                        {ped.detalles?.map(det => (
                          <div key={det.id_detalle} className="flex justify-between items-center px-4 py-2.5 text-sm bg-slate-900/50">
                            <span className="text-slate-300">{det.producto_nombre} <span className="text-slate-500">×{det.cantidad}</span></span>
                            <span className="font-semibold text-white">Bs. {det.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dirección de entrega */}
                    {ped.direccion && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <MapPin size={12} /> Dirección de entrega
                        </p>
                        <div className="bg-slate-900/50 rounded-xl border border-white/5 px-4 py-3 text-sm">
                          <p className="text-white font-semibold">{ped.direccion.nombre_receptor}</p>
                          <p className="text-slate-400">{ped.direccion.direccion}, {ped.direccion.ciudad}</p>
                          <p className="text-slate-500">Tel: {ped.direccion.telefono}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
