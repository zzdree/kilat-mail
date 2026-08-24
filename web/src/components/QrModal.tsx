import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Mail, ExternalLink } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, email }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/60 hover:bg-gray-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">QR Code Email</h3>
            <p className="text-xs text-gray-400">Scan untuk buka alamat email di HP</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner mb-4 mx-auto w-fit">
          <QRCodeSVG
            value={`mailto:${email}`}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#0B0F19"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Address badge & copy */}
        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 truncate min-w-0 px-1">
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-xs text-gray-200 truncate select-all">
              {email}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-gray-950'
                : 'bg-gray-800 text-amber-400 hover:bg-gray-700'
            }`}
            title="Salin Email"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Alamat Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Alamat Email</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
