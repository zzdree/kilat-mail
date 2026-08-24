import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Trash2, User, Clock, KeyRound, Copy, Check } from 'lucide-react';
import { MessageDetail as IMessageDetail } from '../types';

interface MessageDetailProps {
  message: IMessageDetail | null;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  isLoading,
  onDelete,
  onBack,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Membuka pesan...</p>
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = message.body_html
    ? DOMPurify.sanitize(message.body_html, {
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['style', 'script', 'iframe'],
      })
    : '';

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {message.body_html && (
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('html')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  viewMode === 'html' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  viewMode === 'text' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teks
              </button>
            </div>
          )}

          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Hapus pesan ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OTP Alert if detected */}
      {message.detected_otp && (
        <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Kode Verifikasi Terdeteksi
              </div>
              <div className="font-mono text-xl font-extrabold text-white tracking-widest">
                {message.detected_otp}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyOtp(message.detected_otp!)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              copiedOtp ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {copiedOtp ? (
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 stroke-[2.5]" /> Tersalin</span>
            ) : (
              <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Salin OTP</span>
            )}
          </button>
        </div>
      )}

      {/* Message Header Info */}
      <div className="p-4 sm:p-5 border-b border-slate-800">
        <h1 className="text-base sm:text-lg font-bold text-white mb-3">
          {message.subject || '(Tanpa Subjek)'}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Dari:</span>
            <span className="text-slate-200 font-medium truncate">
              {message.sender_name ? `${message.sender_name} <${message.sender_address}>` : message.sender_address}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Waktu:</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Message Body */}
      <div className="p-4 sm:p-6 min-h-[220px] max-h-[500px] overflow-y-auto bg-slate-950">
        {viewMode === 'html' && message.body_html ? (
          <div
            className="email-content-view"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
            {message.body_text || 'Pesan tidak memiliki teks isi.'}
          </pre>
        )}
      </div>
    </div>
  );
};
