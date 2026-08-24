import React from 'react';
import { Mail, Trash2, KeyRound, Clock, Inbox as InboxIcon } from 'lucide-react';
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
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col">
      {/* Header with counter */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Kotak Masuk
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                {items.length}
              </span>
            </h2>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-800/50"
            title="Hapus semua pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Message Items List */}
      <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 mb-3 shadow-inner">
              <InboxIcon className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">
              Kotak Masuk Masih Kosong
            </h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-4">
              Gunakan alamat email di atas untuk menerima pesan, kode OTP, atau aktivasi akun.
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
                className={`group relative p-4 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-gray-800/90 border-amber-500/60 shadow-lg glow-amber-subtle'
                    : isUnread
                    ? 'bg-gray-900/90 border-gray-700/80 hover:border-gray-600 hover:bg-gray-800/50'
                    : 'bg-gray-950/60 border-gray-800/60 opacity-85 hover:opacity-100 hover:border-gray-700'
                }`}
              >
                {/* Unread Indicator Bar */}
                {isUnread && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400/50" />
                )}

                <div className="flex items-start justify-between gap-3">
                  {/* Sender Avatar & Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/60 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 shadow-sm uppercase">
                      {(item.sender_name || item.sender_address || '?').substring(0, 2)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>
                          {item.sender_name || item.sender_address}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 font-medium truncate mb-1.5">
                        {item.subject || '(Tanpa Subjek)'}
                      </div>

                      {/* OTP Tag Badge if detected */}
                      {item.detected_otp && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>OTP: {item.detected_otp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time & Delete Action */}
                  <div className="flex flex-col items-end justify-between shrink-0 h-full gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.created_at)}</span>
                    </div>

                    <button
                      onClick={(e) => onDeleteItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 rounded transition-all hover:bg-gray-800"
                      title="Hapus email ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
