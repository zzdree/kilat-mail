import React, { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

interface OtpCardProps {
  otpCode?: string;
  otp?: string;
}

export const OtpCard: React.FC<OtpCardProps> = ({ otpCode, otp }) => {
  const code = otp || otpCode || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gray-900 to-cyan-500/15 border border-amber-500/40 shadow-lg glow-amber-subtle">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              Kode OTP Terdeteksi
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-widest mt-0.5">
              {code}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            copied
              ? 'bg-emerald-500 text-gray-950 font-bold scale-[1.02]'
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
              <span>Salin OTP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
