import React, { useState } from 'react';
import { Copy, Check, Shuffle, Edit3, Sparkles, RefreshCw } from 'lucide-react';

interface EmailBarProps {
  email: string;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeUsername: (newUsername: string) => void;
  onInjectTest: () => void;
  isRefreshing: boolean;
}

export const EmailBar: React.FC<EmailBarProps> = ({
  email,
  onRefresh,
  onRandomize,
  onChangeUsername,
  onInjectTest,
  isRefreshing,
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
    <div className="w-full bg-[#111827] border border-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-6 transition-all">
      {/* Top amber glow accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* Label Row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Alamat Email Aktif
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors py-0.5 px-2 rounded-md hover:bg-gray-800"
          title="Periksa email baru"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="text-[11px] font-medium">Refresh</span>
        </button>
      </div>

      {/* Main Email Input Box */}
      {isEditing ? (
        <form onSubmit={handleSaveCustom} className="bg-[#0B0F19] border border-amber-500/50 rounded-xl p-2 flex items-center gap-2 mb-3 shadow-inner">
          <input
            type="text"
            placeholder="nama-kamu"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
            className="bg-transparent px-3 py-1.5 text-white font-mono text-sm sm:text-base focus:outline-none w-full"
            autoFocus
          />
          <button type="submit" className="btn-primary !py-1.5 !px-3 text-xs shrink-0">
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0"
          >
            Batal
          </button>
        </form>
      ) : (
        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-inner mb-3">
          <div
            onClick={handleCopy}
            className="px-3 py-1.5 font-mono text-sm sm:text-lg font-bold text-amber-400 tracking-tight truncate cursor-pointer hover:text-amber-300 transition-colors select-all flex items-center min-w-0"
            title="Klik untuk menyalin"
          >
            {email}
          </div>

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
      )}

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <button
            onClick={onRandomize}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-700/60 text-xs font-medium transition-all"
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-700/60 text-xs font-medium transition-all"
            title="Kustom Username Email"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            <span>Kustom Nama</span>
          </button>
        </div>

        <button
          onClick={onInjectTest}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-lg text-xs font-medium transition-all"
          title="Kirim pesan simulasi dengan kode OTP"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>🧪 Coba Kirim Mock OTP</span>
        </button>
      </div>
    </div>
  );
};
