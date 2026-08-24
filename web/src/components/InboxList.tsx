import React, { useState, useMemo } from 'react';
import {
  Mail,
  Trash2,
  KeyRound,
  Clock,
  Inbox as InboxIcon,
  Check,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'otp' | 'link'>('all');

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

  // Filtered & Searched Inbox Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.sender_name || '').toLowerCase().includes(q) ||
        (item.sender_address || '').toLowerCase().includes(q) ||
        (item.detected_otp || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterType === 'otp') return Boolean(item.detected_otp);
      if (filterType === 'link') return Boolean(item.magic_link);
      return true;
    });
  }, [items, searchQuery, filterType]);

  return (
    <div
      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
      data-testid="inbox-container"
      data-inbox-count={items.length}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-zinc-100">Kotak Masuk</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
            {items.length} pesan
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 cursor-pointer border border-zinc-800"
            title="Kosongkan semua pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar (jika ada pesan) */}
      {items.length > 1 && (
        <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengirim, subjek, atau OTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-emerald-400 font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('otp')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'otp'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3 h-3 text-emerald-400" />
              <span>OTP</span>
            </button>
            <button
              onClick={() => setFilterType('link')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'link'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="divide-y divide-zinc-800/80">
        {items.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center bg-zinc-950/40">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-3">
              <InboxIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mb-1">
              Kotak masuk masih kosong
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-3">
              Gunakan alamat email di atas. Pesan, kode OTP, atau tautan verifikasi yang masuk akan otomatis tampil di sini.
            </p>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Memeriksa pesan baru...</span>
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 px-4 text-center text-zinc-400 text-xs">
            Tidak ada pesan yang cocok dengan filter pencarian "{searchQuery}".
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedId === item.id;
            const isUnread = item.is_read === 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                data-message-id={item.id}
                data-unread={isUnread}
                data-otp={item.detected_otp || ''}
                data-magic-link={item.magic_link || ''}
                className={`p-4 sm:px-5 flex items-start justify-between gap-3 cursor-pointer transition-colors group ${
                  isSelected
                    ? 'bg-zinc-800/90'
                    : isUnread
                    ? 'bg-zinc-900/90 hover:bg-zinc-800/60'
                    : 'bg-zinc-950/40 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {/* Sender & Time row */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold truncate ${
                          isUnread ? 'text-zinc-100' : 'text-zinc-300'
                        }`}
                      >
                        {item.sender_name || item.sender_address}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <h4
                    className={`text-xs mb-2 truncate ${
                      isUnread ? 'font-bold text-zinc-200' : 'text-zinc-400'
                    }`}
                  >
                    {item.subject || '(Tanpa Subjek)'}
                  </h4>

                  {/* Badges: Smart OTP Quick Copy & Magic Link */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.detected_otp && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>OTP: {item.detected_otp}</span>
                        <button
                          onClick={(e) => handleCopyOtp(item.detected_otp!, item.id, e)}
                          className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] uppercase transition-colors cursor-pointer"
                          title="Salin kode OTP ini"
                        >
                          {copiedOtpId === item.id ? (
                            <span className="flex items-center gap-0.5 text-zinc-100 font-bold">
                              <Check className="w-3 h-3" /> Disalin
                            </span>
                          ) : (
                            'Salin'
                          )}
                        </button>
                      </div>
                    )}

                    {item.magic_link && (
                      <a
                        href={item.magic_link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
                        title="Buka tautan verifikasi di tab baru"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Link Aktivasi ↗</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right chevron & delete action */}
                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={(e) => onDeleteItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Hapus pesan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
