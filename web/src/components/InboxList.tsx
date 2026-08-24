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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Kotak Masuk</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {items.length} pesan
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-800/80 cursor-pointer"
            title="Kosongkan semua pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="divide-y divide-slate-800">
        {items.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center bg-slate-900/50">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <InboxIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">
              Kotak masuk masih kosong
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-3">
              Gunakan alamat email di atas untuk menerima pesan atau kode verifikasi. Email yang masuk akan langsung muncul otomatis di sini.
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
                className={`p-4 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/90'
                    : isUnread
                    ? 'bg-slate-850 hover:bg-slate-800/60'
                    : 'bg-slate-900 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                {/* Left: Sender & Subject */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isUnread ? 'bg-amber-400' : 'bg-transparent'}`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs sm:text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                        {item.sender_name || item.sender_address}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                        • {formatTime(item.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 truncate">
                      {item.subject || '(Tanpa Subjek)'}
                    </div>
                  </div>
                </div>

                {/* Right: OTP Quick Copy & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <span className="text-[11px] text-slate-500 font-mono sm:hidden flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(item.created_at)}</span>
                  </span>

                  {item.detected_otp && (
                    <button
                      onClick={(e) => handleCopyOtp(item.detected_otp!, item.id, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                        copiedOtpId === item.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      }`}
                      title="Salin kode OTP ini"
                    >
                      {copiedOtpId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>OTP: {item.detected_otp}</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => onDeleteItem(item.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 transition-colors"
                      title="Hapus email"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
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
