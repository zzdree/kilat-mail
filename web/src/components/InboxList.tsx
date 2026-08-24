import React, { useState } from 'react';
import { Mail, Trash2, KeyRound, Clock, Inbox as InboxIcon, Check, ChevronRight } from 'lucide-react';
import { InboxItem } from '../types';

interface InboxListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string, e?: React.MouseEvent) => void;
  onClearAll: () => void;
  isLoading: boolean;
}

export const InboxList: React.FC<InboxListProps> = ({
  items,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  isLoading,
}) => {
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleCopyOtp = (otp: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(otp);
    setCopiedOtpId(itemId);
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  return (
    <div className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col transition-all">
      {/* Inbox Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Kotak Masuk
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-800 text-amber-300 border border-gray-700">
                {items.length} pesan
              </span>
            </h2>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-800/60 border border-transparent hover:border-red-500/20"
            title="Kosongkan semua pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Message List Stream */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0B0F19] border border-gray-800 flex items-center justify-center text-gray-500 mb-3 shadow-inner">
              <InboxIcon className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-gray-300 mb-1">
              Menunggu Email Masuk...
            </h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">
              Kirim email atau minta kode verifikasi ke alamat di atas. Pesan akan tampil otomatis secara realtime di sini.
            </p>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Memeriksa pesan baru...</span>
              </div>
            )}
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedId === item.id;
            const isUnread = item.is_read === 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`group relative p-4 sm:p-4.5 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-gray-800/90 border-amber-500/60 shadow-lg glow-amber-subtle'
                    : isUnread
                    ? 'bg-gray-900/90 border-gray-700/80 hover:border-gray-600 hover:bg-gray-800/50'
                    : 'bg-gray-950/60 border-gray-800/60 opacity-90 hover:opacity-100 hover:border-gray-700'
                }`}
              >
                {/* Unread Left Border Accent */}
                {isUnread && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400/50" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/80 flex items-center justify-center text-xs font-extrabold text-amber-400 shrink-0 shadow-sm uppercase">
                      {(item.sender_name || item.sender_address || '?').substring(0, 2)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>
                          {item.sender_name || item.sender_address}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                          • {formatTime(item.created_at)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 truncate font-medium">
                        {item.subject || '(Tanpa Subjek)'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & OTP Direct Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/60">
                    <span className="text-[11px] text-gray-400 font-mono sm:hidden flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.created_at)}</span>
                    </span>

                    {/* Direct OTP Quick Copy Button */}
                    {item.detected_otp && (
                      <button
                        onClick={(e) => handleCopyOtp(item.detected_otp!, item.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm ${
                          copiedOtpId === item.id
                            ? 'bg-emerald-500 text-gray-950 font-bold scale-[1.03]'
                            : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200'
                        }`}
                        title="Klik untuk langsung menyalin kode OTP ini"
                      >
                        {copiedOtpId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span>Salin {item.detected_otp}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* View arrow & delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => onDeleteItem(item.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition-all hover:bg-gray-800"
                        title="Hapus email ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
