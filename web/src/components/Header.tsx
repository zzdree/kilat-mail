import React from 'react';
import { Zap, Github, Settings, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGuide, isLive }) => {
  return (
    <header className="border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
            <Zap className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Kilat Mail</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Instant & Serverless Temporary Email</p>
          </div>
        </div>

        {/* Live Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-full text-xs text-gray-300">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isLive ? 'Live Listening' : 'Connecting'}</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="btn-secondary !py-1.5 !px-2.5 text-xs text-gray-300 hover:text-white"
            title="Panduan Setup Cloudflare"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Setup Guide</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="btn-secondary !py-1.5 !px-2.5 text-xs text-gray-300 hover:text-white"
            title="Pengaturan API & Domain"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <a
            href="https://github.com/zzdree/kilat-mail"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !p-2 text-gray-400 hover:text-white"
            title="Lihat Repositori GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
};
