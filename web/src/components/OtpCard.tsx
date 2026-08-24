import React, { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

interface OtpCardProps {
  otpCode: string;
}

export const OtpCard: React.FC<OtpCardProps> = ({ otpCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-gray-900 to-amber-950/40 border border-cyan-500/40 shadow-lg glow-cyan-subtle animate-pop">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Kode OTP Terdeteksi
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-widest mt-0.5">
              {otpCode}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            copied
              ? 'bg-emerald-500 text-gray-950 font-bold'
              : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950'
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
              <span>Salin Kode OTP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
