import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Mail, Calendar, User, Trash2, Code, Eye, FileText, ArrowLeft } from 'lucide-react';
import { MessageDetail as IMessageDetail } from '../types';
import { OtpCard } from './OtpCard';

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
  const [viewMode, setViewMode] = useState<'html' | 'text' | 'raw'>('html');

  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center h-[520px] text-gray-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Memuat isi pesan...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center h-[520px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-800/40 border border-gray-700 flex items-center justify-center text-gray-500 mb-3">
          <Mail className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-semibold text-gray-300 mb-1">Pilih Pesan untuk Dibaca</h4>
        <p className="text-xs text-gray-500 max-w-xs">
          Klik salah satu email dari daftar kotak masuk di sebelah kiri untuk melihat rincian isi pesan dan kode verifikasi.
        </p>
      </div>
    );
  }

  // Sanitasi HTML
  const sanitizedHtml = message.body_html
    ? DOMPurify.sanitize(message.body_html, {
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['style', 'script', 'iframe'],
      })
    : '';

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col h-[520px] overflow-hidden">
      {/* Top action / navigation for mobile */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800 gap-2">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1 text-xs text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5 text-xs">
          {message.body_html && (
            <button
              onClick={() => setViewMode('html')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'html'
                  ? 'bg-amber-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'text' || !message.body_html
                ? 'bg-amber-500 text-gray-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Teks Polos</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'raw'
                ? 'bg-amber-500 text-gray-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw</span>
          </button>
        </div>

        {/* Delete Message Button */}
        <button
          onClick={() => onDelete(message.id)}
          className="btn-ghost !p-2 text-gray-400 hover:text-red-400"
          title="Hapus Pesan Ini"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Header Metadata */}
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
          {message.subject || '(Tanpa Subjek)'}
        </h2>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {message.sender_name ? (
                <>
                  <strong className="text-gray-200">{message.sender_name}</strong> &lt;{message.sender_address}&gt;
                </>
              ) : (
                <strong className="text-gray-200">{message.sender_address}</strong>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{new Date(message.created_at).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* OTP Highlight Widget (Jika Ada) */}
      {message.detected_otp && <OtpCard otpCode={message.detected_otp} />}

      {/* Message Body Content */}
      <div className="flex-1 overflow-y-auto bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 sm:p-5">
        {viewMode === 'html' && message.body_html ? (
          <div
            className="email-content-view"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : viewMode === 'text' || !message.body_html ? (
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
            {message.body_text || 'Tidak ada teks isi pesan.'}
          </pre>
        ) : (
          <pre className="font-mono text-xs text-gray-400 overflow-x-auto">
            {JSON.stringify(message, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
