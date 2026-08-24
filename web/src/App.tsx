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
  Code2,
  Terminal,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_DOMAIN = 'kilat.eu.org';
const AVAILABLE_DOMAINS = [
  'kilat.eu.org',
  'kilat.pp.ua',
  'kilat.is-a.dev',
  'kilat.js.cool',
  'temp.kilat.eu.org',
];

function generateRandomEmail(domain: string): string {
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `kilat.${randomChars}@${domain}`;
}

export function App() {
  const [domain, setDomain] = useState<string>(() => {
    return localStorage.getItem('kilat_mail_domain') || DEFAULT_DOMAIN;
  });

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
      a: 'Kilat Mail adalah layanan email sementara (disposable temporary email) gratis untuk menerima pesan dan kode verifikasi OTP secara instan tanpa perlu registrasi.',
    },
    {
      q: 'Apakah saya bisa memilih domain lain?',
      a: 'Ya! Kilat Mail mendukung beberapa domain gratis populer seperti @kilat.eu.org, @kilat.pp.ua, @kilat.is-a.dev, dan @kilat.js.cool. Kamu bisa memilihnya langsung di tombol domain di atas.',
    },
    {
      q: 'Apakah bisa digunakan oleh Script / Bot / Scraper?',
      a: 'Ya! Kilat Mail didesain ramah bot & AI browser agent dengan semantic selector (data-testid) dan REST API publik yang dapat dipanggil langsung dari Python, cURL, Node.js, atau Playwright/Puppeteer.',
    },
    {
      q: 'Berapa lama email yang masuk akan disimpan?',
      a: 'Email secara otomatis dibersihkan dalam 48 jam oleh cron cleaner Cloudflare edge D1 SQLite untuk menjaga kebersihan data dan privasi pengguna.',
    },
    {
      q: 'Apakah Kilat Mail 100% gratis?',
      a: 'Ya, Kilat Mail gratis selamanya tanpa batasan penerimaan pesan, tanpa iklan mengganggu, dan tanpa pendaftaran akun.',
    },
  ];

  const handleSelectDomain = (newDomain: string) => {
    setDomain(newDomain);
    localStorage.setItem('kilat_mail_domain', newDomain);
    const username = currentEmail.split('@')[0];
    const updated = `${username}@${newDomain}`;
    setCurrentEmail(updated);
    localStorage.setItem('kilat_mail_current_address', updated);
    setSelectedId(null);
    setSelectedMessage(null);
  };

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center selection:bg-emerald-500 selection:text-zinc-950">
      {/* Header */}
      <Header isLive={true} />

      {/* Main Container */}
      <main className="w-full max-w-3xl px-4 py-8 sm:py-10 flex-1 flex flex-col">
        {/* Title Area */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mb-2 tracking-tight">
            Email Sementara Gratis & Cepat
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Terima email aktivasi dan kode OTP instan. Lindungi kotak masuk aslimu dari spam dan pelacak data.
          </p>
        </div>

        {/* Email Bar Component */}
        <EmailBar
          email={currentEmail}
          domain={domain}
          availableDomains={AVAILABLE_DOMAINS}
          isRefreshing={isRefreshing}
          onRefresh={() => loadInbox(true)}
          onRandomize={handleRandomize}
          onChangeUsername={handleChangeUsername}
          onSelectDomain={handleSelectDomain}
          onOpenQr={() => setIsQrOpen(true)}
        />

        {/* Simulator Test Action (Discreet helper) */}
        <div className="flex justify-end mb-4 -mt-3">
          <button
            onClick={handleInjectTest}
            data-testid="mock-otp-btn"
            className="text-[11px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
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
        <section id="cara-kerja" className="mb-12 border-t border-zinc-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-4 text-center">
            Bagaimana Cara Kerjanya?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">LANGKAH 01</div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Salin Alamat Email</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Salin alamat email sementara yang sudah dibuat otomatis di atas.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">LANGKAH 02</div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Gunakan untuk Mendaftar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pakai alamat email ini untuk registrasi website, aplikasi, atau download file.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">LANGKAH 03</div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Baca Pesan & Salin OTP</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pesan akan langsung masuk di kotak masuk secara otomatis dan realtime.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="mb-12 border-t border-zinc-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-4 text-center">
            Fitur Unggulan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <KeyRound className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Smart OTP Detection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mendeteksi kode OTP verifikasi secara instan dengan tombol 1-klik salin langsung.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">100% Tanpa Registrasi</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Langsung pakai tanpa akun, password, nomor HP, atau pelacakan cookie pribadi.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <Zap className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Cloudflare Edge Fast</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ditenagai Cloudflare Email Routing & Workers global dengan auto-purge 48 jam.
              </p>
            </div>
          </div>
        </section>

        {/* API / Developer & Scraper Documentation Section */}
        <section id="api" className="mb-12 border-t border-zinc-800/80 pt-8">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                Akses API untuk Bot & Automation (Scraper Friendly)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Kamu bisa mengakses kotak masuk secara terprogram menggunakan HTTP REST endpoint langsung dari Python, Node.js, cURL, atau browser automation:
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-300 space-y-2 overflow-x-auto">
              <div className="text-zinc-500 font-sans text-[11px] font-bold uppercase tracking-wider">
                # 1. Fetch Inbox Messages
              </div>
              <div className="text-emerald-400 font-mono select-all">
                GET https://kilat-mail-worker.zzdree.workers.dev/api/inbox?email={currentEmail}
              </div>

              <div className="text-zinc-500 font-sans text-[11px] font-bold uppercase tracking-wider pt-2">
                # 2. Fetch Single Message Detail
              </div>
              <div className="text-emerald-400 font-mono select-all">
                GET https://kilat-mail-worker.zzdree.workers.dev/api/message/:id
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-8 border-t border-zinc-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-4 text-center">
            Pertanyaan Umum (FAQ)
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
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
      <footer className="w-full border-t border-zinc-800/80 py-6 px-4 text-xs text-zinc-500 bg-zinc-950">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">Kilat Mail</span>
            <span>— Email Sementara Bebas Spam</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <a href="#fitur" className="hover:text-zinc-200">Fitur</a>
            <a href="#cara-kerja" className="hover:text-zinc-200">Cara Kerja</a>
            <a href="#api" className="hover:text-zinc-200">API Bot</a>
            <a href="#faq" className="hover:text-zinc-200">FAQ</a>
            <a
              href="https://github.com/zzdree/kilat-mail"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
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
