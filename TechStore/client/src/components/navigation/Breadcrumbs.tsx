import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void; active?: boolean }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 py-3">
      <div className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer transition-colors">
        <Home size={14} />
        <span>Inicio</span>
      </div>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} className="text-slate-600" />
          {item.onClick && !item.active ? (
            <button
              onClick={item.onClick}
              className="hover:text-cyan-400 transition-colors text-slate-400"
            >
              {item.label}
            </button>
          ) : (
            <span className={item.active ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
