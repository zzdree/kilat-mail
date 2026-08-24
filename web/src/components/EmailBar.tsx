import React, { useState } from 'react';
import { Copy, Check, Shuffle, Edit3, RefreshCw, QrCode } from 'lucide-react';

interface EmailBarProps {
  email: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeUsername: (newUsername: string) => void;
  onOpenQr: () => void;
}

export const EmailBar: React.FC<EmailBarProps> = ({
  email,
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeUsername,
  onOpenQr,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');

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
      {/* Top info label */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label htmlFor="temp-email-input" className="text-xs font-semibold text-zinc-400">
          Alamat Email Sementara Kamu:
        </label>
        <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
          Live Instant Push
        </span>
      </div>

      {/* Main Email Input / Box */}
      {isEditing ? (
        <form onSubmit={handleSaveCustom} className="flex gap-2 mb-3.5">
          <div className="relative flex-1">
            <input
              id="temp-email-input"
              type="text"
              placeholder="masukkan-nama-custom"
              value={customInput}
              onChange={(e) =>
                setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
              }
              className="w-full bg-zinc-950 border border-emerald-500/80 rounded-xl px-4 py-2.5 text-zinc-100 font-mono text-sm sm:text-base focus:outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3.5">
          <div
            onClick={handleCopy}
            className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm sm:text-base font-bold text-zinc-100 flex items-center justify-between cursor-pointer transition-all select-all group shadow-inner"
            title="Klik untuk menyalin"
            data-email-value={email}
            data-testid="email-display"
          >
            <span className="truncate text-emerald-300 font-mono">{email}</span>
            <span className="text-xs font-sans text-zinc-500 group-hover:text-emerald-400 transition-colors ml-2 shrink-0">
              Salin
            </span>
          </div>

          <button
            onClick={handleCopy}
            data-testid="copy-email-btn"
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm ${
              copied
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
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
      )}

      {/* Control Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
          title="Periksa Kotak Masuk Sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
          <span>Refresh</span>
        </button>

        <button
          onClick={onRandomize}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
          title="Ganti dengan Email Acak Baru"
        >
          <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Acak Baru</span>
        </button>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setCustomInput(email.split('@')[0]);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
          title="Ganti Username Email"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ubah Nama</span>
        </button>

        <button
          onClick={onOpenQr}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
          title="Buka QR Code untuk Scan di HP"
        >
          <QrCode className="w-3.5 h-3.5 text-zinc-400" />
          <span>QR Code</span>
        </button>
      </div>
    </div>
  );
};
