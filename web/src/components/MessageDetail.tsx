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
  ExternalLink,
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
  const [copiedLink, setCopiedLink] = useState(false);
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
        ADD_ATTR: ['target', 'rel'],
        FORBID_TAGS: ['style', 'script', 'iframe'],
      })
    : '';

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Download .EML / .JSON file
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
                  viewMode === 'html' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'text' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Teks Polos
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadEml}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Download file .EML"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Download payload .JSON (Bot ready)"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Hapus pesan ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/40">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-3">
          {message.subject || '(Tanpa Subjek)'}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-200">
                {message.sender_name || message.sender_address}
              </span>
              {message.sender_name && (
                <span className="text-zinc-500 font-mono ml-1.5">
                  &lt;{message.sender_address}&gt;
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(message.created_at).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* 🌟 SMART EXTRACTOR CARD: Highlighted OTP & Magic Link */}
      {(message.detected_otp || message.magic_link) && (
        <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex flex-col gap-3">
          {message.detected_otp && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Kode OTP / 2FA Terdeteksi:</span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-300 tracking-wider mt-1">
                  {message.detected_otp}
                </div>
              </div>
              <button
                onClick={() => handleCopyOtp(message.detected_otp!)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  copiedOtp
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {copiedOtp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedOtp ? 'Tersalin ke Clipboard!' : 'Salin Kode OTP'}</span>
              </button>
            </div>
          )}

          {message.magic_link && (
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tautan Aktivasi / Magic Link Terdeteksi:</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5 max-w-lg">
                  {message.magic_link}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(message.magic_link!)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="Salin tautan"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
                </button>
                <a
                  href={message.magic_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Link ↗</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body Content Reader */}
      <div className="p-4 sm:p-6 flex-1 min-h-[250px] bg-zinc-950/20 text-zinc-300 text-sm overflow-x-auto">
        {viewMode === 'html' && message.body_html ? (
          <div
            className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-a:text-emerald-400 prose-a:underline"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {message.body_text || '(Pesan tidak memiliki teks polos)'}
          </pre>
        )}
      </div>
    </div>
  );
};
