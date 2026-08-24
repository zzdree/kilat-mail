import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailBar } from './components/EmailBar';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QrModal } from './components/QrModal';
import { InboxItem, MessageDetail as IMessageDetail } from './types';
import { fetchInbox, fetchMessage, deleteMessage, clearInbox, injectTestEmail } from './api';
import {
  ShieldCheck,
  Zap,
  KeyRound,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Shield,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_DOMAIN = 'kilat.eu.org';

function generateRandomEmail(domain: string): string {
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `kilat.${randomChars}@${domain}`;
}

export function App() {
  const [domain] = useState<string>(DEFAULT_DOMAIN);

  const [currentEmail, setCurrentEmail] = useState<string>(() => {
    const saved = localStorage.getItem('kilat_mail_current_address');
    if (saved) return saved;
    const initial = generateRandomEmail(DEFAULT_DOMAIN);
    localStorage.setItem('kilat_mail_current_address', initial);
    return initial;
  });

  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<IMessageDetail | null>(null);

  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Apa itu Kilat Mail?',
      a: 'Kilat Mail adalah layanan email sekali pakai (disposable email) gratis yang memungkinkan kamu menerima email dan kode verifikasi (OTP) secara instan tanpa perlu registrasi atau membocorkan email pribadimu.',
    },
    {
      q: 'Berapa lama email yang masuk disimpan?',
      a: 'Email yang masuk akan otomatis dihapus oleh sistem setelah 48 jam untuk memastikan privasi dan kebersihan data.',
    },
    {
      q: 'Apakah layanan ini gratis?',
      a: 'Ya, Kilat Mail 100% gratis digunakan kapan saja tanpa batasan jumlah penerimaan email.',
    },
    {
      q: 'Bagaimana cara menyalin kode OTP dengan cepat?',
      a: 'Sistem pintar Kilat Mail secara otomatis mendeteksi kode verifikasi/OTP di dalam subjek dan isi email, lalu memunculkan tombol 1-klik salin langsung di daftar kotak masuk.',
    },
  ];

  const handleRandomize = () => {
    const fresh = generateRandomEmail(domain);
    setCurrentEmail(fresh);
    localStorage.setItem('kilat_mail_current_address', fresh);
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleChangeUsername = (username: string) => {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const updated = `${cleanUsername}@${domain}`;
    setCurrentEmail(updated);
    localStorage.setItem('kilat_mail_current_address', updated);
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const loadInbox = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      try {
        const items = await fetchInbox(currentEmail);
        setInboxItems(items);

        if (selectedId && !items.some((i) => i.id === selectedId)) {
          setSelectedId(null);
          setSelectedMessage(null);
        }
      } catch (err) {
        console.error('Error fetching inbox:', err);
      } finally {
        if (isManual) {
          setTimeout(() => setIsRefreshing(false), 300);
        }
      }
    },
    [currentEmail, selectedId]
  );

  useEffect(() => {
    if (!selectedId) {
      setSelectedMessage(null);
      return;
    }

    let isSubscribed = true;
    setIsLoadingDetail(true);

    fetchMessage(selectedId)
      .then((detail) => {
        if (isSubscribed) {
          setSelectedMessage(detail);
          setInboxItems((prev) =>
            prev.map((item) => (item.id === selectedId ? { ...item, is_read: 1 } : item))
          );
        }
      })
      .catch((err) => {
        console.error('Error fetching message detail:', err);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingDetail(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedId]);

  useEffect(() => {
    loadInbox();
    const interval = setInterval(() => {
      loadInbox();
    }, 3500);

    return () => clearInterval(interval);
  }, [loadInbox]);

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteMessage(id);
      setInboxItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Kosongkan semua pesan di inbox ini?')) return;
    try {
      await clearInbox(currentEmail);
      setInboxItems([]);
      setSelectedId(null);
      setSelectedMessage(null);
    } catch (err) {
      console.error('Error clearing inbox:', err);
    }
  };

  const handleInjectTest = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const created = injectTestEmail(currentEmail, randomOtp);
    loadInbox(true);
    setSelectedId(created.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Header */}
      <Header isLive={true} />

      {/* Main Container */}
      <main className="w-full max-w-3xl px-4 py-8 sm:py-10 flex-1 flex flex-col">
        {/* Title Area */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Email Sementara Gratis & Cepat
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Lupakan spam, iklan promosi, dan bot. Lindungi email aslimu dengan email sekali pakai yang aman.
          </p>
        </div>

        {/* Email Bar (Hero Functional Component) */}
        <EmailBar
          email={currentEmail}
          isRefreshing={isRefreshing}
          onRefresh={() => loadInbox(true)}
          onRandomize={handleRandomize}
          onChangeUsername={handleChangeUsername}
          onOpenQr={() => setIsQrOpen(true)}
        />

        {/* Simulator Test Action (Discreet helper) */}
        <div className="flex justify-end mb-4 -mt-3">
          <button
            onClick={handleInjectTest}
            className="text-[11px] text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulasi Kirim Email Uji Coba</span>
          </button>
        </div>

        {/* Inbox List / Message Detail */}
        <div className="mb-12">
          {selectedMessage || isLoadingDetail ? (
            <MessageDetail
              message={selectedMessage}
              isLoading={isLoadingDetail}
              onDelete={(id) => handleDeleteItem(id)}
              onBack={() => {
                setSelectedId(null);
                setSelectedMessage(null);
              }}
            />
          ) : (
            <InboxList
              items={inboxItems}
              selectedId={selectedId}
              onSelectItem={(id) => setSelectedId(id)}
              onDeleteItem={handleDeleteItem}
              onClearAll={handleClearAll}
              isLoading={isLoadingInbox}
            />
          )}
        </div>

        {/* How It Works Section */}
        <section id="cara-kerja" className="mb-12 border-t border-slate-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 text-center">
            Bagaimana Cara Kerjanya?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-amber-400 mb-1">LANGKAH 01</div>
              <h3 className="text-sm font-bold text-white mb-1">Salin Alamat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salin alamat email sementara yang sudah dibuat secara otomatis di atas.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-amber-400 mb-1">LANGKAH 02</div>
              <h3 className="text-sm font-bold text-white mb-1">Gunakan di Mana Saja</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gunakan alamat ini untuk mendaftar di situs web, forum, atau aplikasi.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-bold text-amber-400 mb-1">LANGKAH 03</div>
              <h3 className="text-sm font-bold text-white mb-1">Baca Pesan & OTP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pesan masuk akan langsung muncul di kotak masuk ini secara realtime.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="mb-12 border-t border-slate-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 text-center">
            Mengapa Menggunakan Kilat Mail?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <KeyRound className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Ekstraksi OTP Otomatis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deteksi otomatis kode OTP atau PIN aktivasi sehingga kamu bisa menyalinnya dengan 1 klik.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Tanpa Registrasi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tanpa username, tanpa password, dan tanpa pelacakan cookie pribadi apapun.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Cepat & Aman</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ditenagai jaringan edge serverless global dengan pembersihan otomatis 48 jam.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-8 border-t border-slate-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 text-center">
            Pertanyaan Umum (FAQ)
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-6 px-4 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Kilat Mail</span>
            <span>— Layanan Email Sementara Gratis</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="#fitur" className="hover:text-slate-200">Fitur</a>
            <a href="#cara-kerja" className="hover:text-slate-200">Cara Kerja</a>
            <a href="#faq" className="hover:text-slate-200">FAQ</a>
            <a
              href="https://github.com/zzdree/kilat-mail"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* QR Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        email={currentEmail}
      />
    </div>
  );
}
