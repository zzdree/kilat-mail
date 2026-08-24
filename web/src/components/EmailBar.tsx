import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Shuffle,
  Edit3,
  RefreshCw,
  QrCode,
  Globe,
  ChevronDown,
  History,
  Trash2,
  Plus,
  Mail,
  X,
} from 'lucide-react';

interface EmailBarProps {
  email: string;
  domain: string;
  availableDomains: string[];
  recentEmails: string[];
  activeMailboxes: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeUsername: (newUsername: string) => void;
  onSelectDomain: (newDomain: string) => void;
  onSelectRecentEmail: (selectedEmail: string) => void;
  onAddNewMailbox: () => void;
  onRemoveMailbox: (mailbox: string) => void;
  onClearRecentEmails: () => void;
  onOpenQr: () => void;
}

export const EmailBar: React.FC<EmailBarProps> = ({
  email,
  domain,
  availableDomains,
  recentEmails,
  activeMailboxes,
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeUsername,
  onSelectDomain,
  onSelectRecentEmail,
  onAddNewMailbox,
  onRemoveMailbox,
  onClearRecentEmails,
  onOpenQr,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isDomainMenuOpen, setIsDomainMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const domainRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (domainRef.current && !domainRef.current.contains(e.target as Node)) {
        setIsDomainMenuOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
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
    <div
      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6"
      data-testid="email-bar"
    >
      {/* Active Mailbox Multi-Tabs */}
      {activeMailboxes.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 border-b border-zinc-800/80 scrollbar-none">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Mail className="w-3 h-3 text-emerald-400" />
            Kotak:
          </span>
          {activeMailboxes.map((box) => {
            const isActive = box.toLowerCase() === email.toLowerCase();
            return (
              <div
                key={box}
                onClick={() => onSelectRecentEmail(box)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-xs'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{box}</span>
                {activeMailboxes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMailbox(box);
                    }}
                    className="p-0.5 hover:text-rose-400 transition-colors rounded"
                    title="Tutup tab mailbox ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={onAddNewMailbox}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-emerald-400 text-xs transition-colors cursor-pointer"
            title="Tambah alamat mailbox baru simultan"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[11px]">Baru</span>
          </button>
        </div>
      )}

      {/* Top info label & History Dropdown */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <label htmlFor="temp-email-input" className="text-xs font-semibold text-zinc-400">
          Alamat Email Aktif Saat Ini:
        </label>

        <div className="flex items-center gap-2">
          {recentEmails.length > 1 && (
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-sans text-[11px] transition-colors cursor-pointer"
                title="Riwayat Alamat Email Sebelumnya"
              >
                <History className="w-3 h-3 text-emerald-400" />
                <span>Riwayat ({recentEmails.length})</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {isHistoryOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 mb-1">
                    <span>5 Alamat Terakhir</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearRecentEmails();
                        setIsHistoryOpen(false);
                      }}
                      className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                  {recentEmails.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        onSelectRecentEmail(item);
                        setIsHistoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono truncate hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                        item.toLowerCase() === email.toLowerCase()
                          ? 'text-emerald-400 font-bold bg-emerald-500/10'
                          : 'text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      {item.toLowerCase() === email.toLowerCase() && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-1.5"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Email Input / Display Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            id="temp-email-input"
            type="text"
            readOnly
            value={email}
            onClick={handleCopy}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-3.5 pr-10 text-emerald-400 font-mono text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer selection:bg-emerald-500/30"
          />
          <button
            onClick={handleCopy}
            className="absolute right-2 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Salin alamat email"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {/* Randomize Button */}
          <button
            onClick={onRandomize}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-semibold text-xs transition-colors cursor-pointer"
            title="Acak username email baru"
          >
            <Shuffle className="w-4 h-4 text-zinc-400" />
            <span>Acak</span>
          </button>

          {/* Edit Custom Username */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-semibold text-xs transition-colors cursor-pointer"
            title="Kustomisasi username email"
          >
            <Edit3 className="w-4 h-4 text-zinc-400" />
            <span>Ubah</span>
          </button>

          {/* QR Code */}
          <button
            onClick={onOpenQr}
            className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Buka QR Code alamat ini"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh inbox manual"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Domain Selector & Custom Input Sub-row */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Custom Username Inline Form */}
        {isEditing ? (
          <form onSubmit={handleSaveCustom} className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Masukkan username baru..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1.5 bg-zinc-800 text-zinc-400 rounded-xl text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </form>
        ) : (
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Sinkronisasi otomatis aktif (setiap 3.5 detik)</span>
          </div>
        )}

        {/* Domain Selector Menu */}
        <div className="relative" ref={domainRef}>
          <button
            onClick={() => setIsDomainMenuOpen(!isDomainMenuOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>@{domain}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {isDomainMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
              <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 mb-1">
                Pilih Domain Provider
              </div>
              {availableDomains.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    onSelectDomain(d);
                    setIsDomainMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer ${
                    d === domain ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-300'
                  }`}
                >
                  <span>@{d}</span>
                  {d === domain && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
