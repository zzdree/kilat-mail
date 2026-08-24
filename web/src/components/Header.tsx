import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLive }) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 px-4 py-3.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-sm group-hover:bg-amber-400 transition-colors">
            <Zap className="w-4.5 h-4.5 fill-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg text-white tracking-tight">
              Kilat<span className="text-amber-400">Mail</span>
            </span>
          </div>
        </a>

        {/* Navigation & Status */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <nav className="hidden sm:flex items-center gap-4 text-slate-400">
            <a href="#fitur" className="hover:text-slate-200 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-slate-200 transition-colors">Cara Kerja</a>
            <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400 opacity-75' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {isLive ? 'Siap Menerima Email' : 'Menghubungkan...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
