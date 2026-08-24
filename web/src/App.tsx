import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailBar } from './components/EmailBar';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { SettingsModal } from './components/SettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { QrModal } from './components/QrModal';
import { HowItWorks } from './components/HowItWorks';
import { CtaBanner } from './components/CtaBanner';
import { InboxItem, MessageDetail as IMessageDetail } from './types';
import { fetchInbox, fetchMessage, deleteMessage, clearInbox, injectTestEmail } from './api';
import {
  ShieldCheck,
  Zap,
  KeyRound,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_DOMAIN = 'kilat.eu.org';
const AVAILABLE_DOMAINS = ['kilat.eu.org', 'temp.kilat.eu.org', 'inbox.kilat.eu.org'];

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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah Kilat Mail benar-benar 100% gratis?',
      a: 'Ya, Kilat Mail dibangun sepenuhnya di atas tier gratis Cloudflare Serverless (Email Routing, Workers, D1 SQLite, dan Pages) tanpa biaya langganan, tanpa iklan mengganggu, dan tanpa batasan.',
    },
    {
      q: 'Berapa lama email yang masuk akan disimpan?',
      a: 'Email secara otomatis disimpan di database edge D1 dan dibersihkan otomatis dalam 48 jam oleh cron trigger pembersih otomatis.',
    },
    {
      q: 'Bagaimana cara kerja Smart OTP Extractor?',
      a: 'Algoritma cerdas kami secara otomatis memindai pesan untuk mendeteksi digit kode verifikasi / 2FA (4-8 karakter), lalu menyajikannya dalam tombol 1-klik salin tanpa perlu membaca email secara manual.',
    },
    {
      q: 'Bisakah saya menggunakan domain pribadi saya sendiri?',
      a: 'Tentu! Anda bisa membuka menu "Domain" atau "Panduan" di navigasi atas untuk menghubungkan domain Cloudflare Email Routing milik Anda sendiri.',
    },
    {
      q: 'Apakah saya perlu registrasi akun atau login?',
      a: 'Tidak perlu sama sekali! Buka halaman ini dan alamat email langsung siap pakai seketika. Privasi Anda terjaga 100%.',
    },
  ];

  const handleSaveDomain = (newDomain: string) => {
    const cleanDomain = newDomain || DEFAULT_DOMAIN;
    setDomain(cleanDomain);
    localStorage.setItem('kilat_mail_domain', cleanDomain);
    const username = currentEmail.split('@')[0];
    const updated = `${username}@${cleanDomain}`;
    setCurrentEmail(updated);
    localStorage.setItem('kilat_mail_current_address', updated);
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
          setTimeout(() => setIsRefreshing(false), 400);
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
    if (!confirm('Yakin ingin mengosongkan semua pesan di inbox ini?')) return;
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-gray-100 flex flex-col items-center selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        isLive={true}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl px-4 py-6 sm:py-10 flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] sm:text-xs font-semibold mb-3.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
            <span>Gratis • Tanpa Registrasi • Auto Smart OTP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5 leading-tight">
            Email Sementara <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Super Cepat</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Terima kode OTP instan & lindungi privasi email utama kamu dari spam dan data tracker.
          </p>
        </div>

        {/* Email Bar Widget Hero */}
        <EmailBar
          email={currentEmail}
          domain={domain}
          availableDomains={AVAILABLE_DOMAINS}
          isRefreshing={isRefreshing}
          onRefresh={() => loadInbox(true)}
          onRandomize={handleRandomize}
          onChangeUsername={handleChangeUsername}
          onSelectDomain={handleSaveDomain}
          onInjectTest={handleInjectTest}
          onOpenQr={() => setIsQrOpen(true)}
        />

        {/* Inbox Stream OR Message Reader */}
        <div className="mb-10 w-full transition-all">
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

        {/* How It Works (3 Steps) */}
        <HowItWorks />

        {/* Value Props / Features */}
        <section id="fitur" className="pt-8 border-t border-gray-800/80 w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2.5">
              <span>Keunggulan Utama</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
              Fitur Unggulan Kilat Mail
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              Dirancang dengan presisi untuk kecepatan maksimal dan keamanan privasi pengunjung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-amber-500/40 transition-colors shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3.5 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Smart OTP Extractor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Algoritma regex cerdas mendeteksi kode verifikasi secara otomatis untuk disalin langsung dalam 1 klik.
              </p>
            </div>

            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">100% Privasi & Bersih</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tanpa registrasi, tanpa pelacakan data, dan konten HTML dibersihkan anti-XSS dengan DOMPurify.
              </p>
            </div>

            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-emerald-500/40 transition-colors shadow-lg group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3.5 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Cloudflare Edge</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Infrastruktur serverless global Cloudflare Email Routing & Workers untuk latensi penerimaan zero-lag.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <CtaBanner onScrollToTop={scrollToTop} />

        {/* FAQ Section */}
        <section id="faq" className="w-full pt-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-5 sm:p-7 mb-8 shadow-xl">
            <div className="text-center sm:text-left mb-5">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Informasi seputar cara kerja, privasi, dan batasan layanan Kilat Mail.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-800/80 rounded-xl overflow-hidden bg-[#0B0F19]/60 transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800/80 py-8 px-4 text-xs text-gray-500 bg-[#0B0F19]">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="font-bold text-gray-200 text-sm">⚡ Kilat Mail</span>
              <span className="text-gray-500">• Serverless Cloudflare Edge</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <a
                href="#fitur"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Fitur
              </a>
              <a
                href="#cara-kerja"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="#faq"
                className="text-gray-400 hover:text-white transition-colors"
              >
                FAQ
              </a>
              <a
                href="https://github.com/zzdree/kilat-mail"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-600">
            <span>© 2026 Kilat Mail by Andreas Restuawanta Christwara. MIT Licensed.</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-400">Semua sistem operasional</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentDomain={domain}
        onSaveDomain={handleSaveDomain}
      />

      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        email={currentEmail}
      />
    </div>
  );
}
