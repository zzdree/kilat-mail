import React from 'react';
import { Zap, Code2, Globe } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLive }) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors shadow-sm">
            <Zap className="w-4 h-4 fill-emerald-400 stroke-[1.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-zinc-100 tracking-tight">
              Kilat<span className="text-emerald-400">Mail</span>
            </span>
          </div>
        </a>

        {/* Navigation & Status */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <nav className="hidden sm:flex items-center gap-5 text-zinc-400">
            <a href="#fitur" className="hover:text-zinc-200 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-zinc-200 transition-colors">Cara Kerja</a>
            <a href="#api" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>API / Bot</span>
            </a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400 opacity-75' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] font-medium text-zinc-300">
              {isLive ? 'Aktif' : 'Menghubungkan...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
