import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Shuffle, Edit3, Send } from 'lucide-react';

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
    <div className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden glow-amber-subtle mb-6">
      {/* Glow highlight top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-75" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Email display & Status */}
        <div className="w-full md:w-auto flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Alamat Email Sementara Kamu
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveCustom} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="nama-kamu"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                className="bg-gray-900 border border-amber-500/50 rounded-lg px-3 py-1.5 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-full max-w-xs"
                autoFocus
              />
              <button type="submit" className="btn-primary !py-1.5 !px-3 text-xs">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary !py-1.5 !px-3 text-xs"
              >
                Batal
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group">
              <span
                onClick={handleCopy}
                className="font-mono text-lg sm:text-2xl font-bold text-amber-400 tracking-tight cursor-pointer hover:text-amber-300 transition-colors select-all break-all"
                title="Klik untuk menyalin"
              >
                {email}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions bar */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex-1 md:flex-none btn-primary !py-2.5 !px-4 ${
              copied ? '!bg-emerald-500 !text-gray-950 font-bold' : ''
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
            className="btn-secondary !py-2.5 !px-3"
            title="Ganti Alamat Acak Baru"
          >
            <Shuffle className="w-4 h-4 text-gray-300" />
            <span className="hidden sm:inline">Acak</span>
          </button>

          {/* Custom Username Button */}
          <button
            onClick={() => {
              const currentUsername = email.split('@')[0];
              setCustomInput(currentUsername);
              setIsEditing(true);
            }}
            className="btn-secondary !py-2.5 !px-3"
            title="Ubah Username Kustom"
          >
            <Edit3 className="w-4 h-4 text-gray-300" />
            <span className="hidden sm:inline">Kustom</span>
          </button>

          {/* Refresh Inbox Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn-secondary !py-2.5 !px-3"
            title="Cek Email Masuk Sekarang"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Inject Test Email Button */}
          <button
            onClick={onInjectTest}
            className="btn-secondary !py-2.5 !px-3 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40"
            title="Kirim Pesan Uji Coba (Mock OTP)"
          >
            <Send className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-semibold">Kirim Mock OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
