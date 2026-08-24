import React from 'react';
import { Zap, Settings, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGuide, isLive }) => {
  return (
    <header className="border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/5 shrink-0">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Kilat<span className="text-amber-400">Mail</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                ⚡ Serverless
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Email Sementara Cepat & Otomatis</p>
          </div>
        </div>

        {/* Live Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 px-3 py-1.5 rounded-full text-xs text-gray-300 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400 opacity-75' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium">{isLive ? 'Realtime Live' : 'Connecting'}</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700/60 text-xs font-medium transition-all"
            title="Panduan Setup Domain"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-700/60 text-xs font-medium transition-all flex items-center gap-1.5"
            title="Pengaturan Domain"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Domain</span>
          </button>
        </div>
      </div>
    </header>
  );
};
