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
    <div className="w-full bg-[#111827] border border-gray-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden mb-8">
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* Label & Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Alamat Email Sementara Kamu
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors"
          title="Periksa email baru sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">Periksa</span>
        </button>
      </div>

      {/* Email Address & Actions Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Email Address Display or Edit Form */}
        <div className="flex-1 min-w-0 bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 shadow-inner">
          {isEditing ? (
            <form onSubmit={handleSaveCustom} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="nama-kamu"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                className="bg-gray-900 border border-amber-500/50 rounded-lg px-3 py-1.5 text-white font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
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
            <div
              onClick={handleCopy}
              className="flex-1 font-mono text-base sm:text-xl font-bold text-amber-400 tracking-tight truncate cursor-pointer hover:text-amber-300 transition-colors select-all"
              title="Klik untuk menyalin"
            >
              {email}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex-1 sm:flex-none btn-primary !py-3 !px-5 text-sm font-semibold shadow-lg transition-all ${
              copied
                ? '!bg-emerald-500 !text-gray-950 !border-emerald-400 font-bold scale-[1.02]'
                : 'hover:scale-[1.02]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Email</span>
              </>
            )}
          </button>

          {/* Randomize Button */}
          <button
            onClick={onRandomize}
            className="btn-secondary !py-3 !px-3.5"
            title="Ganti Alamat Acak"
          >
            <Shuffle className="w-4 h-4 text-gray-300" />
            <span className="hidden md:inline text-xs">Acak</span>
          </button>

          {/* Custom Username Button */}
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setCustomInput(email.split('@')[0]);
            }}
            className="btn-secondary !py-3 !px-3.5"
            title="Kustom Nama Email"
          >
            <Edit3 className="w-4 h-4 text-gray-300" />
            <span className="hidden md:inline text-xs">Kustom</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Quick Mock Action */}
      <div className="mt-4 pt-3.5 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Pesan baru masuk otomatis secara realtime tanpa perlu refresh.</span>
        </div>

        <button
          onClick={onInjectTest}
          className="inline-flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
          title="Kirim pesan simulasi dengan kode OTP untuk mengetes tampilan"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kirim Mock OTP</span>
        </button>
      </div>
    </div>
  );
};
