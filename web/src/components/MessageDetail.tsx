import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Trash2,
  User,
  Clock,
  KeyRound,
  Copy,
  Check,
  Download,
  FileCode,
} from 'lucide-react';
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
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
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

  // Download .EML / .TXT / .JSON file
  const handleDownloadEml = () => {
    const emlContent = `From: ${message.sender_name || ''} <${message.sender_address}>\nTo: ${message.recipient}\nSubject: ${message.subject || ''}\nDate: ${new Date(message.created_at).toUTCString()}\nContent-Type: text/html; charset=utf-8\n\n${message.body_html || message.body_text || ''}`;
    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${message.id.substring(0, 8)}.eml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonContent = JSON.stringify(message, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${message.id.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
      data-testid="message-detail"
      data-detail-id={message.id}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex-wrap gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {message.body_html && (
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-xs">
              <button
                onClick={() => setViewMode('html')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'html' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Teks
              </button>
            </div>
          )}

          {/* Export Actions */}
          <button
            onClick={handleDownloadEml}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors border border-zinc-800 cursor-pointer"
            title="Download file .EML"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition-colors border border-zinc-800 cursor-pointer"
            title="Download payload .JSON"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(message.id)}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors border border-zinc-800 cursor-pointer"
            title="Hapus pesan ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OTP Alert if detected */}
      {message.detected_otp && (
        <div className="mx-4 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Kode Verifikasi Terdeteksi
              </div>
              <div
                className="font-mono text-xl font-extrabold text-white tracking-widest"
                data-testid="detected-otp-code"
              >
                {message.detected_otp}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyOtp(message.detected_otp!)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              copiedOtp ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
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
      <div className="p-4 sm:p-5 border-b border-zinc-800">
        <h1 className="text-base sm:text-lg font-bold text-zinc-100 mb-3 leading-snug">
          {message.subject || '(Tanpa Subjek)'}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Dari:</span>
            <span className="text-zinc-200 font-medium truncate">
              {message.sender_name ? `${message.sender_name} <${message.sender_address}>` : message.sender_address}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Waktu:</span>
            <span className="text-zinc-300 font-mono text-[11px]">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Message Body */}
      <div className="p-4 sm:p-6 min-h-[220px] max-h-[500px] overflow-y-auto bg-zinc-950/80">
        {viewMode === 'html' && message.body_html ? (
          <div
            className="email-content-view"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {message.body_text || 'Pesan tidak memiliki teks isi.'}
          </pre>
        )}
      </div>
    </div>
  );
};
