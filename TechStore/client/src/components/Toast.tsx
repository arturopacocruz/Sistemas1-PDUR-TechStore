import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useCart();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="var(--success)" />,
    error: <AlertCircle size={20} color="var(--danger)" />,
    info: <Info size={20} color="var(--accent-cyan)" />
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toastMessage.type}`}>
        {icons[toastMessage.type]}
        <span>{toastMessage.text}</span>
        <button
          onClick={clearToast}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
