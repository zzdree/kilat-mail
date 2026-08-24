import React from 'react';
import { Zap, Settings, HelpCircle, Shield } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGuide, isLive }) => {
  return (
    <header className="w-full border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-5 h-5 fill-gray-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Kilat<span className="text-amber-400">Mail</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md hidden xs:inline-block">
                ⚡ Serverless
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-block mt-0.5">
              Email Sementara Cepat & Aman
            </span>
          </div>
        </a>

        {/* Section Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-gray-400">
          <a href="#fitur" className="hover:text-amber-400 transition-colors">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-amber-400 transition-colors">
            Cara Kerja
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Status & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-900/90 border border-gray-800 px-2.5 py-1.5 rounded-full text-xs text-gray-300 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isLive ? 'bg-emerald-400 opacity-75' : 'bg-amber-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="text-[11px] font-medium hidden sm:inline">
              {isLive ? 'Realtime Live' : 'Connecting'}
            </span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Panduan Setup Domain"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Pengaturan Domain Pribadi"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Domain</span>
          </button>
        </div>
      </div>
    </header>
  );
};
