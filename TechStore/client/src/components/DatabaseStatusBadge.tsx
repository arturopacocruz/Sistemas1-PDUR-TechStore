import { Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const DatabaseStatusBadge: React.FC = () => {
  return (
    <div
      className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-tech-border bg-slate-900/60 backdrop-blur-md"
      title={isSupabaseConfigured ? 'Conectado a Supabase PostgreSQL' : 'Conectado a Base de Datos Relacional Local (PostgreSQL/SQLite MVC)'}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
      </span>
      <Database size={13} className="text-cyan-400" />
      <span className="text-slate-300 font-mono">
        {isSupabaseConfigured ? 'Supabase Cloud DB' : 'TechStore Relational DB'}
      </span>
    </div>
  );
};
