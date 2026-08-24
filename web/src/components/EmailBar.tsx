import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Shuffle,
  Edit3,
  Sparkles,
  RefreshCw,
  QrCode,
  Globe,
  ChevronDown,
} from 'lucide-react';

interface EmailBarProps {
  email: string;
  domain: string;
  availableDomains?: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeUsername: (newUsername: string) => void;
  onSelectDomain: (newDomain: string) => void;
  onInjectTest: () => void;
  onOpenQr: () => void;
}

export const EmailBar: React.FC<EmailBarProps> = ({
  email,
  domain,
  availableDomains = ['kilat.eu.org', 'temp.kilat.eu.org', 'inbox.kilat.eu.org'],
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeUsername,
  onSelectDomain,
  onInjectTest,
  onOpenQr,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const domainDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        domainDropdownRef.current &&
        !domainDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDomainOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChangeUsername(customInput.trim());
      setIsEditing(false);
      setCustomInput('');
    }
  };

  return (
    <div className="w-full bg-[#111827] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-6 transition-all">
      {/* Top electric amber glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* Header Info Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Alamat Email Aktif
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Domain Selector Dropdown */}
          <div className="relative" ref={domainDropdownRef}>
            <button
              onClick={() => setIsDomainOpen(!isDomainOpen)}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-amber-400 bg-gray-800/80 hover:bg-gray-800 transition-colors py-1 px-2.5 rounded-lg border border-gray-700/60 cursor-pointer font-mono"
              title="Pilih Domain"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>@{domain}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isDomainOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#0B0F19] border border-gray-700 rounded-xl shadow-2xl py-1.5 z-30 animate-fade-in font-mono text-xs">
                <div className="px-3 py-1 text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider border-b border-gray-800">
                  Pilih Domain
                </div>
                {availableDomains.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      onSelectDomain(d);
                      setIsDomainOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center justify-between cursor-pointer ${
                      domain === d ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-gray-300'
                    }`}
                  >
                    <span>@{d}</span>
                    {domain === d && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors py-1 px-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 cursor-pointer"
            title="Periksa email baru"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="text-[11px] font-medium hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Email Input Box */}
      {isEditing ? (
        <form
          onSubmit={handleSaveCustom}
          className="bg-[#0B0F19] border border-amber-500/50 rounded-xl p-2 flex items-center gap-2 mb-3.5 shadow-inner"
        >
          <input
            type="text"
            placeholder="nama-kamu"
            value={customInput}
            onChange={(e) =>
              setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
            }
            className="bg-transparent px-3 py-1.5 text-white font-mono text-sm sm:text-base focus:outline-none w-full"
            autoFocus
          />
          <button type="submit" className="btn-primary !py-1.5 !px-3 text-xs shrink-0 cursor-pointer">
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0 cursor-pointer"
          >
            Batal
          </button>
        </form>
      ) : (
        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-inner mb-3.5 group">
          <div
            onClick={handleCopy}
            className="px-3 py-1.5 font-mono text-sm sm:text-lg font-bold text-amber-400 tracking-tight truncate cursor-pointer hover:text-amber-300 transition-colors select-all flex items-center min-w-0"
            title="Klik untuk menyalin"
          >
            {email}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* QR Code Action Button */}
            <button
              onClick={onOpenQr}
              className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/60 transition-all cursor-pointer"
              title="Tampilkan QR Code Email"
              aria-label="QR Code"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`h-10 px-5 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-gray-950 scale-[1.02]'
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950 hover:scale-[1.02]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <button
            onClick={onRandomize}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Ganti Alamat Email Acak"
          >
            <Shuffle className="w-3.5 h-3.5 text-gray-400" />
            <span>Acak Baru</span>
          </button>

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setCustomInput(email.split('@')[0]);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Kustom Username Email"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            <span>Kustom Nama</span>
          </button>
        </div>

        <button
          onClick={onInjectTest}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
          title="Kirim pesan simulasi dengan kode OTP"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>🧪 Coba Kirim Mock OTP</span>
        </button>
      </div>
    </div>
  );
};
