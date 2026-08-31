import React, { useState, useEffect } from 'react';
import type { Usuario, RolUsuario, EstadoUsuario } from '../types';
import { api } from '../services/api';
import { X, Save, AlertCircle, User, Mail, Phone, Shield, Power } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuarioParaEditar?: Usuario | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  usuarioParaEditar
}) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('CLIENTE');
  const [estado, setEstado] = useState<EstadoUsuario>('Activo');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuarioParaEditar) {
      setNombre(usuarioParaEditar.nombre);
      setEmail(usuarioParaEditar.email);
      setTelefono(usuarioParaEditar.telefono || '');
      setRol(usuarioParaEditar.rol);
      setEstado(usuarioParaEditar.estado || 'Activo');
    } else {
      setNombre('');
      setEmail('');
      setTelefono('');
      setRol('CLIENTE');
      setEstado('Activo');
    }
    setError(null);
  }, [usuarioParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      if (usuarioParaEditar) {
        await api.actualizarUsuarioAdmin(usuarioParaEditar.id_usuario, {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim() || null,
          rol,
          estado
        });
      } else {
        await api.crearUsuarioAdmin({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim() || undefined,
          rol,
          estado
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div>
              <span className="badge badge-warning mb-1">Administración</span>
              <h2 className="text-xl font-bold text-white font-heading">
                {usuarioParaEditar ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Usuario'}
              </h2>
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

        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 mb-6 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <User size={13} className="text-cyan-400" />
              <span>Nombre Completo *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Roberto Sánchez"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <Mail size={13} className="text-cyan-400" />
              <span>Correo Electrónico *</span>
            </label>
            <input
              type="email"
              required
              placeholder="roberto@techstore.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <Phone size={13} className="text-cyan-400" />
              <span>Teléfono de Contacto</span>
            </label>
            <input
              type="tel"
              placeholder="70000000"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label flex items-center gap-1.5">
                <Shield size={13} className="text-purple-400" />
                <span>Rol Asignado *</span>
              </label>
              <select
                value={rol}
                onChange={e => setRol(e.target.value as RolUsuario)}
                className="select-field"
              >
                <option value="CLIENTE">CLIENTE (Usuario normal)</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR (Gestión total)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label flex items-center gap-1.5">
                <Power size={13} className="text-cyan-400" />
                <span>Estado de Cuenta *</span>
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoUsuario)}
                className="select-field"
              >
                <option value="Activo">Activo (Habilitado)</option>
                <option value="Inactivo">Inactivo (Bloqueado)</option>
              </select>
            </div>
          </div>

          {!usuarioParaEditar && (
            <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/5">
              Nota: La contraseña inicial configurada por defecto para nuevas cuentas es <span className="text-cyan-400 font-mono font-semibold">123</span>.
            </p>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              <Save size={16} />
              <span>{guardando ? 'Guardando...' : usuarioParaEditar ? 'Guardar Cambios' : 'Crear Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
