import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import type { Pedido, DireccionEntrega, Usuario } from '../types';
import {
  CheckCircle2, MapPin, ArrowLeft, AlertCircle,
  ShoppingBag, Phone, Home, User, RefreshCw, ClipboardList,
  ChevronDown, ChevronUp, Lock, Download, MessageSquare, Receipt, FileText
} from 'lucide-react';

interface PedidoViewProps {
  onBackToCatalog: () => void;
  isCheckoutMode?: boolean;
}

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
  nit_ci: '',
  razon_social: ''
};

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

function generarContenidoTxt(pedido: Pedido, usuario: Usuario | null): string {
  const fechaStr = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
  const separador = '======================================================================';
  const subseparador = '----------------------------------------------------------------------';

  let itemsTexto = '';
  if (pedido.detalles && pedido.detalles.length > 0) {
    itemsTexto = pedido.detalles.map(d => {
      const cant = String(d.cantidad).padEnd(4);
      const desc = (d.producto_nombre || `Item #${d.id_producto}`).padEnd(36).substring(0, 36);
      const pu = `Bs. ${d.precio_unitario.toFixed(2)}`.padEnd(12);
      const sub = `Bs. ${d.subtotal.toFixed(2)}`;
      return `${cant}  ${desc} ${pu} ${sub}`;
    }).join('\n');
  }

  const facturacionTexto = pedido.nit_ci ? `
${subseparador}
2. DATOS DE FACTURACIÓN (LEY N° 453)
${subseparador}
NIT / C.I.:             ${pedido.nit_ci}
Razón Social / Nombre:  ${pedido.razon_social || pedido.direccion?.nombre_receptor || 'Consumidor Final'}
` : `
${subseparador}
2. DATOS DE FACTURACIÓN (LEY N° 453)
${subseparador}
Modalidad:              Sin factura comercial / Consumidor Final
`;

  return `${separador}
                     TECHSTORE BOLIVIA - MVP
            COMPROBANTE DE PEDIDO ELECTRÓNICO (LEY 164)
${separador}

NÚMERO DE PEDIDO:       ${pedido.numero_pedido}
FECHA Y HORA (BOLIVIA): ${fechaStr}
SELLO DE INTEGRIDAD:    ${pedido.hash_integridad || 'SHA256-HMAC-VERIFIED'}
ESTADO DEL PEDIDO:      ${pedido.estado}

${subseparador}
1. DATOS DEL CLIENTE Y ENTREGA
${subseparador}
Cliente:                ${usuario?.nombre || pedido.direccion?.nombre_receptor || 'Cliente TechStore'}
Correo Electrónico:     ${usuario?.email || 'N/A'}
Teléfono de Contacto:   ${pedido.direccion?.telefono || 'N/A'}
Ciudad de Despacho:     ${pedido.direccion?.ciudad || 'Tarija'}, Bolivia
Dirección Exacta:       ${pedido.direccion?.direccion || 'N/A'}
${facturacionTexto}
${subseparador}
3. DETALLE DE PRODUCTOS COMPRADOS
${subseparador}
CANT.  DESCRIPCIÓN                          P. UNIT.     SUBTOTAL
${subseparador}
${itemsTexto}
${subseparador}
TOTAL GENERAL A CANCELAR:                                Bs. ${pedido.total.toFixed(2)}
${separador}

SERVICIO WEB DE PEDIDOS - SIMULACIÓN Y DESPACHO VÍA WHATSAPP:
Este documento constituye la constancia electrónica oficial generada
por TechStore Tarija para la coordinación de la entrega física.
Para coordinar el pago en efectivo contra entrega o mediante transferencia
QR Banco Unión/BNB, reenvíe este pedido al WhatsApp oficial:
https://wa.me/59170000001?text=Hola%20TechStore,%20confirmo%20mi%20pedido%20${pedido.numero_pedido}
`;
}

function descargarTxt(contenido: string, numeroPedido: string) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Pedido_${numeroPedido}_TechStore.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const PedidoView: React.FC<PedidoViewProps> = ({ onBackToCatalog, isCheckoutMode = false }) => {
  const { usuarioActual } = useAuth();
  const { carrito, refrescarCarrito } = useCart();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);
  const [txtGenerado, setTxtGenerado] = useState<string>('');
  const [mostrarCheckout, setMostrarCheckout] = useState(isCheckoutMode);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [requiereFactura, setRequiereFactura] = useState(false);

  // Form state
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

  const handleFieldChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const err = validarCampo(field, value);
    setFormErrors(prev => ({ ...prev, [field]: err || undefined }));
  };

  const handleFieldBlur = (field: FormField) => {
    setCamposTocados(prev => ({ ...prev, [field]: true }));
    const err = validarCampo(field, formData[field] as string);
    setFormErrors(prev => ({ ...prev, [field]: err || undefined }));
  };

  const validarFormulario = (): boolean => {
    const fields: FormField[] = ['nombre_receptor', 'telefono', 'ciudad', 'direccion'];
    let valido = true;
    const nuevosErrores: Partial<Record<FormField, string>> = {};

    fields.forEach(f => {
      const err = validarCampo(f, formData[f] as string);
      if (err) {
        valido = false;
        nuevosErrores[f] = err;
      }
    });

    setFormErrors(nuevosErrores);
    setCamposTocados({ nombre_receptor: true, telefono: true, ciudad: true, direccion: true });
    return valido;
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioActual) return;

    if (!validarFormulario()) return;

    const items = carrito?.items || [];
    if (items.length === 0) {
      setErrorCheckout('El carrito está vacío. Agregue productos antes de realizar el pedido.');
      return;
    }

    try {
      setProcesando(true);
      setErrorCheckout(null);

      const datosEnvio: DireccionEntrega = {
        ...formData,
        nit_ci: requiereFactura ? formData.nit_ci : undefined,
        razon_social: requiereFactura ? formData.razon_social : undefined
      };

      const res = await api.checkout(usuarioActual.id_usuario, datosEnvio);
      setPedidoConfirmado(res.pedido);

      // Generar y descargar archivo .txt automáticamente
      const txt = generarContenidoTxt(res.pedido, usuarioActual);
      setTxtGenerado(txt);
      descargarTxt(txt, res.pedido.numero_pedido);

      await refrescarCarrito();
      await cargarPedidosUsuario();
      setMostrarCheckout(false);
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

  // ── 1. Pantalla de Confirmación de Pedido (HU-03 + TXT Download) ─────────
  if (pedidoConfirmado) {
    const whatsappUrl = `https://wa.me/59170000001?text=${encodeURIComponent(
      `Hola TechStore, acabo de realizar el pedido *${pedidoConfirmado.numero_pedido}* por un total de *Bs. ${pedidoConfirmado.total.toFixed(2)}* para entrega en Tarija. Adjunto comprobante.`
    )}`;

    return (
      <div className="page-container" style={{ maxWidth: '820px' }}>
        <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/80 p-8 md:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={44} className="text-emerald-400" />
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Pedido Registrado con Éxito
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading">¡Gracias por tu compra!</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Tu pedido fue confirmado y el inventario fue descontado en tiempo real.
            Se ha descargado automáticamente tu comprobante en formato <strong>.TXT</strong>.
          </p>

          {/* Número de Pedido y Total */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Número de Identificación del Pedido</p>
            <p className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-heading tracking-widest mb-2">
              {pedidoConfirmado.numero_pedido}
            </p>
            <p className="text-xs text-slate-400">
              Fecha: {pedidoConfirmado.fecha} &bull; Total: <span className="text-white font-bold text-sm">Bs. {pedidoConfirmado.total.toFixed(2)}</span>
            </p>
          </div>

          {/* Action Buttons: TXT download & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => descargarTxt(txtGenerado || generarContenidoTxt(pedidoConfirmado, usuarioActual), pedidoConfirmado.numero_pedido)}
              className="btn btn-secondary flex items-center justify-center gap-2 py-3 text-sm font-semibold"
            >
              <Download size={16} className="text-cyan-400" />
              <span>Volver a Descargar .TXT</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare size={16} />
              <span>Confirmar vía WhatsApp (+591)</span>
            </a>
          </div>

          {/* TXT Receipt Preview Box */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-left font-mono text-xs text-slate-400 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-sans uppercase font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-cyan-400" />
              <span>Vista previa del Comprobante Generado (.TXT):</span>
            </div>
            <pre className="whitespace-pre-wrap">{txtGenerado || generarContenidoTxt(pedidoConfirmado, usuarioActual)}</pre>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setPedidoConfirmado(null);
                setMostrarCheckout(false);
              }}
              className="btn btn-secondary"
            >
              <ClipboardList size={16} />
              <span>Ver Mis Pedidos</span>
            </button>
            <button onClick={onBackToCatalog} className="btn btn-primary">
              <ShoppingBag size={16} />
              <span>Seguir Comprando</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Formulario de Checkout (HU-03) ────────────────────────────────────
  if (mostrarCheckout) {
    return (
      <div className="page-container" style={{ maxWidth: '1100px' }}>
        <button
          onClick={() => setMostrarCheckout(false)}
          className="btn btn-secondary btn-sm mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Volver al Historial</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
              <div>
                <span className="badge badge-warning mb-2">HU-03 &bull; Finalizar Compra</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                  Datos de Entrega y Facturación
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingrese la dirección en Tarija para la entrega de sus productos.
                </p>
              </div>

              {errorCheckout && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorCheckout}</span>
                </div>
              )}

              <form onSubmit={handleSubmitCheckout} className="space-y-4">
                <div className="input-group">
                  <label className="input-label flex items-center gap-1.5">
                    <User size={14} className="text-cyan-400" />
                    <span>Nombre completo del receptor *</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formData.nombre_receptor}
                    onChange={e => handleFieldChange('nombre_receptor', e.target.value)}
                    onBlur={() => handleFieldBlur('nombre_receptor')}
                    placeholder="Ej. Arturo Cruz"
                    className={`input-field ${camposTocados.nombre_receptor && formErrors.nombre_receptor ? 'border-rose-500' : ''}`}
                  />
                  {camposTocados.nombre_receptor && formErrors.nombre_receptor && (
                    <span className="text-xs text-rose-400 mt-1">{formErrors.nombre_receptor}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label flex items-center gap-1.5">
                      <Phone size={14} className="text-cyan-400" />
                      <span>Teléfono / WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={20}
                      value={formData.telefono}
                      onChange={e => handleFieldChange('telefono', e.target.value)}
                      onBlur={() => handleFieldBlur('telefono')}
                      placeholder="Ej. 70000001"
                      className={`input-field ${camposTocados.telefono && formErrors.telefono ? 'border-rose-500' : ''}`}
                    />
                    {camposTocados.telefono && formErrors.telefono && (
                      <span className="text-xs text-rose-400 mt-1">{formErrors.telefono}</span>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label flex items-center gap-1.5">
                      <MapPin size={14} className="text-cyan-400" />
                      <span>Ciudad de Entrega *</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.ciudad}
                      onChange={e => handleFieldChange('ciudad', e.target.value)}
                      onBlur={() => handleFieldBlur('ciudad')}
                      placeholder="Tarija"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label flex items-center gap-1.5">
                    <Home size={14} className="text-cyan-400" />
                    <span>Dirección física exacta y referencias *</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={255}
                    value={formData.direccion}
                    onChange={e => handleFieldChange('direccion', e.target.value)}
                    onBlur={() => handleFieldBlur('direccion')}
                    placeholder="Ej. Av. Las Américas #450, entre Calle 1 y 2, Barrio Senac (portón negro)"
                    className={`textarea-field ${camposTocados.direccion && formErrors.direccion ? 'border-rose-500' : ''}`}
                  />
                  {camposTocados.direccion && formErrors.direccion && (
                    <span className="text-xs text-rose-400 mt-1">{formErrors.direccion}</span>
                  )}
                </div>

                {/* Optional Facturación Toggle */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={requiereFactura}
                      onChange={e => setRequiereFactura(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Receipt size={14} className="text-cyan-400" />
                      <span>Solicitar Factura Comercial (Ley N° 453)</span>
                    </span>
                  </label>

                  {requiereFactura && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div className="input-group mb-0">
                        <label className="input-label">NIT o C.I. *</label>
                        <input
                          type="text"
                          required={requiereFactura}
                          value={formData.nit_ci || ''}
                          onChange={e => setFormData(prev => ({ ...prev, nit_ci: e.target.value }))}
                          placeholder="Ej. 1234567019"
                          className="input-field"
                        />
                      </div>
                      <div className="input-group mb-0">
                        <label className="input-label">Razón Social / Nombre *</label>
                        <input
                          type="text"
                          required={requiereFactura}
                          value={formData.razon_social || ''}
                          onChange={e => setFormData(prev => ({ ...prev, razon_social: e.target.value }))}
                          placeholder="Ej. Cruz & Hnos S.R.L."
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={procesando || items.length === 0}
                  className="w-full btn btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 mt-4"
                >
                  <Lock size={16} />
                  <span>{procesando ? 'Procesando pedido...' : `Confirmar Pedido (Bs. ${total.toFixed(2)})`}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white font-heading pb-3 border-b border-white/10">
                Resumen de Compra ({items.length} productos)
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map(it => (
                  <div key={it.id_item} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-semibold text-white truncate">{it.producto?.nombre}</p>
                      <p className="text-slate-400">{it.cantidad} x Bs. {it.precio_unitario.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-cyan-400 font-mono">Bs. {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>Bs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Envío Local (Tarija)</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/5">
                  <span>Total General</span>
                  <span className="text-cyan-400 font-mono">Bs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. Historial de Pedidos del Usuario ───────────────────────────────────
  return (
    <div className="page-container space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="badge badge-warning mb-2">Historial</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
            Mis Pedidos Registrados
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Seguimiento en tiempo real de tus órdenes y comprobantes de compra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={cargarPedidosUsuario} className="btn btn-secondary btn-sm flex items-center gap-2">
            <RefreshCw size={14} className={cargandoPedidos ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button onClick={onBackToCatalog} className="btn btn-primary btn-sm flex items-center gap-2">
            <ShoppingBag size={14} />
            <span>Ver Catálogo</span>
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-3xl space-y-4">
          <ClipboardList size={48} className="mx-auto opacity-30 text-slate-500" />
          <h3 className="text-lg font-bold text-white font-heading">Aún no has realizado pedidos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explora nuestro catálogo de tecnología y realiza tu primer pedido con entrega inmediata en Tarija.
          </p>
          <button onClick={onBackToCatalog} className="btn btn-primary mt-2">
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map(ped => {
            const isExpanded = pedidoExpandido === ped.id_pedido;
            return (
              <div key={ped.id_pedido} className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono text-cyan-400">{ped.numero_pedido}</span>
                    <span className="text-xs text-slate-400">Fecha: {ped.fecha}</span>
                    {getBadgeEstado(ped.estado)}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono">
                      Total: <span className="text-cyan-400">Bs. {ped.total.toFixed(2)}</span>
                    </span>

                    <button
                      onClick={() => setPedidoExpandido(isExpanded ? null : ped.id_pedido)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {ped.direccion && (
                      <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                        <p className="font-bold text-cyan-400 uppercase text-[11px]">Dirección de Entrega:</p>
                        <p>{ped.direccion.nombre_receptor} &bull; {ped.direccion.direccion}, {ped.direccion.ciudad}</p>
                        <p className="text-slate-400">Tel: {ped.direccion.telefono}</p>
                        {ped.nit_ci && <p className="text-amber-400">Factura: NIT {ped.nit_ci} ({ped.razon_social})</p>}
                      </div>
                    )}

                    <div className="space-y-2">
                      {ped.detalles?.map(det => (
                        <div key={det.id_detalle} className="flex justify-between items-center text-xs p-2 rounded-lg bg-black/20">
                          <span>{det.cantidad}x {det.producto_nombre}</span>
                          <span className="font-mono text-slate-300">Bs. {det.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => descargarTxt(generarContenidoTxt(ped, usuarioActual), ped.numero_pedido)}
                        className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
                      >
                        <Download size={13} className="text-cyan-400" />
                        <span>Descargar Comprobante .TXT</span>
                      </button>
                    </div>
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
