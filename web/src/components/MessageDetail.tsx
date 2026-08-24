import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Calendar, User, Trash2, Code, Eye, FileText, ArrowLeft } from 'lucide-react';
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
      <div className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-gray-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-gray-400">Membuka rincian email...</p>
      </div>
    );
  }

  if (!message) {
    return null;
  }

  // Sanitasi HTML
  const sanitizedHtml = message.body_html
    ? DOMPurify.sanitize(message.body_html, {
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['style', 'script', 'iframe'],
      })
    : '';

  return (
    <div className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col transition-all">
      {/* Top Bar: Back button, view tabs, and delete */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800/80 gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700/60 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kembali ke Inbox</span>
        </button>

        <div className="flex items-center gap-2">
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
              <span>Teks</span>
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

          {/* Delete Action */}
          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 bg-gray-800/80 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg border border-gray-700/60 hover:border-red-500/30 transition-all text-xs"
            title="Hapus email ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Smart OTP Banner if detected */}
      {message.detected_otp && (
        <div className="mb-4">
          <OtpCard otp={message.detected_otp} />
        </div>
      )}

      {/* Header Info */}
      <div className="bg-[#0B0F19] border border-gray-800/80 rounded-xl p-4 mb-4">
        <h1 className="text-base sm:text-xl font-bold text-white mb-2 leading-snug break-words">
          {message.subject || '(Tanpa Subjek)'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800/60">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-gray-500">Dari:</span>
            <span className="text-gray-200 font-medium truncate">
              {message.sender_name ? `${message.sender_name} <${message.sender_address}>` : message.sender_address}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-gray-500">Waktu:</span>
            <span className="text-gray-200 font-medium font-mono text-[11px]">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body Content Container */}
      <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 sm:p-6 min-h-[260px] max-h-[550px] overflow-y-auto">
        {viewMode === 'html' && message.body_html ? (
          <div
            className="email-content-view"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : viewMode === 'text' || !message.body_html ? (
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
            {message.body_text || 'Pesan tidak memiliki teks isi.'}
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs text-gray-400 bg-black/40 p-4 rounded-lg overflow-x-auto">
            {message.raw_headers || 'Header data tidak tersedia.'}
          </pre>
        )}
      </div>
    </div>
  );
};
