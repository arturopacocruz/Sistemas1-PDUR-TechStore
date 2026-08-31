import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, AlertCircle, LogIn, Shield, User, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    try {
      setCargando(true);
      setError(null);
      await login(email.trim(), password.trim());
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123');
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={closeLoginModal} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '28px 24px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <LogIn size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">Iniciar Sesión</h3>
              <p className="text-xs text-slate-400">Acceso a la plataforma TechStore</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl mb-5">
            <AlertCircle size={17} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@techstore.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña registrada"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Contraseña establecida para todos los usuarios: <span className="text-cyan-400 font-mono font-semibold">123</span>
            </p>
          </div>

          {/* Quick Access Helper Buttons */}
          <div className="pt-2">
            <div className="text-[11px] text-slate-400 uppercase font-semibold mb-2 tracking-wider">
              Cuentas registradas para pruebas rápidas:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTestAccount('arturo@techstore.com')}
                className="p-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                  <User size={13} />
                  <span>Arturo Cruz</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rol: Cliente</div>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('admin@techstore.com')}
                className="p-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-purple-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                  <Shield size={13} />
                  <span>Administrador</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rol: Admin</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <span>{cargando ? 'Verificando credenciales...' : 'Ingresar a mi cuenta'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
