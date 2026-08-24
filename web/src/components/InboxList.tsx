import React from 'react';
import { Mail, Trash2, KeyRound, Clock, Inbox } from 'lucide-react';
import { InboxItem } from '../types';

interface InboxListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  isLoading: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 10) return 'Baru saja';
    if (diffSecs < 60) return `${diffSecs} detik lalu`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch {
    return 'Beberapa saat lalu';
  }
}

export const InboxList: React.FC<InboxListProps> = ({
  items,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  isLoading,
}) => {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col h-[520px]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm text-white">Kotak Masuk</span>
          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-mono">
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            title="Kosongkan Semua Pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* List / Empty State */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center text-gray-500">
                <Inbox className="w-8 h-8" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200 mb-1">
              Menunggu Email Masuk...
            </h4>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Gunakan alamat email di atas untuk mendaftar layanan atau meminta kode OTP. Pesan akan muncul otomatis di sini.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedId === item.id;
            const senderInitial = (item.sender_name || item.sender_address || '?').charAt(0).toUpperCase();

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : 'bg-gray-900/60 border-gray-800/80 hover:bg-gray-800/60 hover:border-gray-700'
                }`}
              >
                {/* Unread indicator vertical bar */}
                {item.is_read === 0 && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar Initials */}
                  <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-sm text-amber-400 shrink-0">
                    {senderInitial}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs truncate ${item.is_read === 0 ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                        {item.sender_name || item.sender_address}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-200 font-semibold truncate mb-1">
                      {item.subject || '(Tanpa Subjek)'}
                    </div>

                    {/* Detected OTP Tag */}
                    {item.detected_otp && (
                      <div className="inline-flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                        <KeyRound className="w-3 h-3 text-cyan-400" />
                        <span>OTP: {item.detected_otp}</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={(e) => onDeleteItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 transition-all shrink-0"
                    title="Hapus pesan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
