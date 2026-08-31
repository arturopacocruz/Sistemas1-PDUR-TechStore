import React, { useState } from 'react';
import { X, FileText, Shield, Scale, Truck, Lock, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'legal' | 'consumidor' | 'privacidad' | 'envios'>('legal');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content max-w-3xl w-full"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">Términos y Condiciones de Uso</h3>
              <p className="text-xs text-slate-400">TechStore Bolivia · Marco Regulatorio y Legal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-slate-950/60 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'legal'
                ? 'border-cyan-400 text-cyan-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>Ley N° 164 (Contratos Digitales)</span>
          </button>

          <button
            onClick={() => setActiveTab('consumidor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'consumidor'
                ? 'border-cyan-400 text-cyan-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={15} />
            <span>Ley N° 453 (Consumidor)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidad')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'privacidad'
                ? 'border-cyan-400 text-cyan-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={15} />
            <span>Habeas Data & Privacidad</span>
          </button>

          <button
            onClick={() => setActiveTab('envios')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'envios'
                ? 'border-cyan-400 text-cyan-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck size={15} />
            <span>Envíos y Garantía</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
                <strong>Validez Jurídica Probatoria:</strong> Todo pedido confirmado a través de esta plataforma digital posee pleno reconocimiento legal y fuerza vinculante conforme a la legislación boliviana.
              </div>

              <h4 className="text-base font-bold text-white font-heading">1. Ley General de Telecomunicaciones y TIC (Ley N° 164)</h4>
              <p>
                De acuerdo con el <strong>Artículo 79</strong> de la Ley N° 164, los actos y contratos celebrados mediante mensajes de datos y comercio electrónico gozan de plena validez jurídica y probatoria. La confirmación de un pedido genera un comprobante digital con identificación única (<code className="text-cyan-400">PED-XXXXXX</code>) y sello criptográfico de integridad (SHA-256 HMAC) para garantizar el no repudio.
              </p>

              <h4 className="text-base font-bold text-white font-heading">2. Perfeccionamiento del Contrato de Compraventa</h4>
              <p>
                El contrato de compraventa electrónica se considera perfeccionado en el momento en que el usuario completa el formulario de entrega, valida el stock disponible en tiempo real y presiona el botón de confirmación de pedido.
              </p>
            </div>
          )}

          {activeTab === 'consumidor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                <strong>Protección al Consumidor:</strong> Garantía de transparencia en precios, stock verificado y prohibición de cláusulas abusivas.
              </div>

              <h4 className="text-base font-bold text-white font-heading">1. Ley General de los Derechos de las Usuarias y los Usuarios (Ley N° 453)</h4>
              <p>
                En estricto apego al <strong>Artículo 13</strong> de la Ley N° 453, TechStore garantiza el derecho a recibir información veraz, clara y oportuna respecto a las características técnicas, precios finales en moneda nacional (Bolivianos - Bs.) y disponibilidad física de cada producto tecnológico ofertado.
              </p>

              <h4 className="text-base font-bold text-white font-heading">2. Transparencia de Inventario</h4>
              <p>
                El sistema prohíbe la comercialización de productos en estado "Agotado". La plataforma valida el inventario antes del checkout para evitar cobros o compromisos que no puedan ser satisfechos inmediatamente.
              </p>
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                <strong>Habeas Data (CPE Arts. 130-131):</strong> Sus datos personales están protegidos bajo cifrado y estándares de confidencialidad.
              </div>

              <h4 className="text-base font-bold text-white font-heading">1. Tratamiento y Cifrado de Datos Personales</h4>
              <p>
                La información de contacto, números telefónicos y direcciones de entrega se almacenan en reposo bajo cifrado simétrico <strong>AES-256</strong>. TechStore no comercializa ni cede datos a terceros bajo ninguna circunstancia.
              </p>

              <h4 className="text-base font-bold text-white font-heading">2. Ejercicio de Derechos ARCO</h4>
              <p>
                El titular de los datos puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>, solicitando la actualización o anonimización de su historial conforme a los plazos legales del Código Tributario Boliviano.
              </p>
            </div>
          )}

          {activeTab === 'envios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <strong>Cobertura Local:</strong> Envíos directos en el área metropolitana de Tarija.
              </div>

              <h4 className="text-base font-bold text-white font-heading">1. Tiempos de Entrega en Tarija</h4>
              <p>
                Los pedidos confirmados en días hábiles se entregan en un plazo máximo de 24 a 48 horas en el radio urbano de la ciudad de Tarija.
              </p>

              <h4 className="text-base font-bold text-white font-heading">2. Garantía Oficial de Productos</h4>
              <p>
                Todos los equipos (laptops, celulares, componentes y periféricos) cuentan con garantía legal y técnica por defectos de fábrica. Se entrega nota fiscal y comprobante digital con cada despacho.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span>Versión 2.0 · Vigente para Bolivia (2026)</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
