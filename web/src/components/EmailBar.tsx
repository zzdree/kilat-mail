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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
      {/* Top info label */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <label htmlFor="temp-email-input" className="text-xs font-semibold text-slate-400">
          Alamat Email Sementara Kamu:
        </label>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Otomatis diperbarui secara realtime
        </span>
      </div>

      {/* Main Email Input / Box */}
      {isEditing ? (
        <form onSubmit={handleSaveCustom} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input
              id="temp-email-input"
              type="text"
              placeholder="masukkan-nama-custom"
              value={customInput}
              onChange={(e) =>
                setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
              }
              className="w-full bg-slate-950 border border-amber-500/70 rounded-lg px-3.5 py-2.5 text-white font-mono text-sm sm:text-base focus:outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div
            onClick={handleCopy}
            className="flex-1 bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3.5 py-2.5 font-mono text-sm sm:text-base font-bold text-slate-100 flex items-center justify-between cursor-pointer transition-colors select-all group"
            title="Klik untuk menyalin"
          >
            <span className="truncate">{email}</span>
            <span className="text-xs font-sans text-slate-500 group-hover:text-amber-400 transition-colors ml-2 shrink-0">
              Salin
            </span>
          </div>

          <button
            onClick={handleCopy}
            className={`px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
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

      {/* Control Buttons Bar (Persis seperti standard Temp Mail) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          title="Periksa Kotak Masuk Sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          onClick={onRandomize}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          title="Ganti dengan Email Acak Baru"
        >
          <Shuffle className="w-3.5 h-3.5 text-slate-400" />
          <span>Acak Baru</span>
        </button>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setCustomInput(email.split('@')[0]);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          title="Ganti Username Email"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          <span>Ubah Nama</span>
        </button>

        <button
          onClick={onOpenQr}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          title="Buka QR Code untuk Scan di HP"
        >
          <QrCode className="w-3.5 h-3.5 text-slate-400" />
          <span>QR Code</span>
        </button>
      </div>
    </div>
  );
};
