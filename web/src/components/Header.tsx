import React from 'react';
import { Zap, Code2, Bell, BellOff, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  theme,
  onToggleTheme,
  notificationPermission,
  onRequestNotification,
}) => {
  return (
    <header className="w-full border-b border-zinc-800/80 light:border-zinc-200/90 bg-zinc-950/90 light:bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 light:bg-emerald-50 border border-zinc-700/80 light:border-emerald-200 flex items-center justify-center text-emerald-400 light:text-emerald-600 group-hover:border-emerald-500/50 transition-colors shadow-xs">
            <Zap className="w-4 h-4 fill-emerald-400 light:fill-emerald-600 stroke-[1.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-zinc-100 light:text-zinc-900 tracking-tight">
              Kilat<span className="text-emerald-400 light:text-emerald-600">Mail</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 light:bg-emerald-100 text-emerald-400 light:text-emerald-700 border border-emerald-500/20 light:border-emerald-300 font-semibold">
              Live Real
            </span>
          </div>
        </a>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-medium">
          <nav className="hidden md:flex items-center gap-4 text-zinc-400 light:text-zinc-600 mr-1">
            <a href="#fitur" className="hover:text-zinc-200 light:hover:text-zinc-900 transition-colors">Fitur</a>
            <a href="#api" className="hover:text-zinc-200 light:hover:text-zinc-900 transition-colors flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
              <span>Bot & API</span>
            </a>
            <a href="#faq" className="hover:text-zinc-200 light:hover:text-zinc-900 transition-colors">FAQ</a>
          </nav>

          {/* Theme Switcher Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-zinc-900 light:bg-zinc-100 hover:bg-zinc-800 light:hover:bg-zinc-200 border border-zinc-800 light:border-zinc-300 text-zinc-300 light:text-zinc-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke Tema Terang (Light Mode)' : 'Ganti ke Tema Gelap (Dark Mode)'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Browser Notification Button */}
          <button
            onClick={onRequestNotification}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-[11px] ${
              notificationPermission === 'granted'
                ? 'bg-emerald-950/40 light:bg-emerald-50 border-emerald-800/60 light:border-emerald-300 text-emerald-300 light:text-emerald-700'
                : 'bg-zinc-900 light:bg-zinc-100 border-zinc-800 light:border-zinc-300 text-zinc-400 light:text-zinc-600 hover:text-zinc-200 light:hover:text-zinc-900'
            }`}
            title={
              notificationPermission === 'granted'
                ? 'Notifikasi Desktop Aktif'
                : 'Aktifkan Notifikasi Desktop saat email tiba'
            }
          >
            {notificationPermission === 'granted' ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
                <span className="hidden sm:inline">Notif Aktif</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-zinc-400 light:text-zinc-500" />
                <span className="hidden sm:inline">Aktifkan Notif</span>
              </>
            )}
          </button>

          {/* Realtime Live Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-zinc-900 light:bg-zinc-100 border border-zinc-800 light:border-zinc-300 text-zinc-300 light:text-zinc-700">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400 opacity-75' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300 light:text-zinc-700">
              {isLive ? 'Live 100%' : 'Sync'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
