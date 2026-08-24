import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailBar } from './components/EmailBar';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { SettingsModal } from './components/SettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { InboxItem, MessageDetail as IMessageDetail } from './types';
import { fetchInbox, fetchMessage, deleteMessage, clearInbox, injectTestEmail } from './api';
import { ShieldCheck, Zap, KeyRound, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_DOMAIN = 'kilat.eu.org';

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

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Apakah Kilat Mail benar-benar 100% gratis?',
      a: 'Ya, Kilat Mail dibangun sepenuhnya di atas tier gratis Cloudflare Serverless (Email Routing, Workers, D1 SQLite, dan Pages) tanpa biaya langganan atau batasan tersembunyi.',
    },
    {
      q: 'Berapa lama email yang masuk akan disimpan?',
      a: 'Email secara otomatis disimpan di database edge D1 dan dibersihkan otomatis dalam 48 jam oleh cron trigger pembersih berkala.',
    },
    {
      q: 'Bagaimana cara kerja Smart OTP Extractor?',
      a: 'Algoritma regex cerdas kami memindai subjek dan isi pesan untuk mendeteksi digit kode verifikasi / 2FA (4-8 karakter), lalu menyajikannya dalam tombol 1-klik salin.',
    },
    {
      q: 'Bisakah saya menggunakan domain pribadi saya sendiri?',
      a: 'Tentu! Anda bisa membuka menu "Panduan" atau "Domain" di bagian atas untuk menghubungkan domain Cloudflare Email Routing milik Anda sendiri.',
    },
  ];

  // Simpan domain & email saat berubah
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

  // Fetch inbox items
  const loadInbox = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      try {
        const items = await fetchInbox(currentEmail);
        setInboxItems(items);

        // Jika item yang sedang dipilih dihapus di server, reset selection
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

  // Fetch detail pesan saat selectedId berubah
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

  // Initial load & Polling interval setiap 3.5 detik
  useEffect(() => {
    loadInbox();
    const interval = setInterval(() => {
      loadInbox();
    }, 3500);

    return () => clearInterval(interval);
  }, [loadInbox]);

  // Handler Hapus Pesan
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

  // Handler Kosongkan Inbox
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

  // Handler Kirim Mock Email
  const handleInjectTest = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const created = injectTestEmail(currentEmail, randomOtp);
    loadInbox(true);
    setSelectedId(created.id);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Header Navigation */}
      <Header
        isLive={true}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Hero & Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col">
        {/* Hero Tagline for Visitors */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>100% Gratis • Tanpa Registrasi • Auto-Detect OTP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5">
            Email Sementara <span className="text-amber-400">Super Cepat</span> & Otomatis
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Gunakan alamat email sekali pakai untuk verifikasi akun, aktivasi instan, dan menjaga privasi inbox utama dari spam.
          </p>
        </div>

        {/* Email Bar Widget Hero */}
        <EmailBar
          email={currentEmail}
          isRefreshing={isRefreshing}
          onRefresh={() => loadInbox(true)}
          onRandomize={handleRandomize}
          onChangeUsername={handleChangeUsername}
          onInjectTest={handleInjectTest}
        />

        {/* Dynamic Display: Inbox Stream OR Message Reader */}
        <div className="mb-12 transition-all duration-200">
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

        {/* Value Props Grid */}
        <div className="pt-8 border-t border-gray-800/80">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              Keunggulan Kilat Mail
            </h2>
            <p className="text-xs text-gray-400">
              Dirancang dengan presisi untuk kenyamanan dan privasi setiap pengunjung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-amber-500/40 transition-colors shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Smart OTP Extractor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mendeteksi kode verifikasi secara otomatis dari subjek/isi email untuk disalin langsung dalam 1 klik.
              </p>
            </div>

            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">100% Privasi & Bersih</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tanpa registrasi, tanpa tracking, dan konten HTML dibersihkan dari pelacak dengan DOMPurify.
              </p>
            </div>

            <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-5 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3.5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Serverless Edge Cloudflare</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ditenagai Cloudflare Email Routing, Workers, dan D1 SQLite Edge untuk latensi ultra rendah.
              </p>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
            <h3 className="text-sm sm:text-base font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-800/80 rounded-xl overflow-hidden bg-[#0B0F19]/60"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-amber-400 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-6 px-4 text-center text-xs text-gray-500 bg-[#0B0F19]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">⚡ Kilat Mail</span>
            <span>— Serverless Cloudflare Stack</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://kilat-mail.pages.dev"
              className="text-amber-400 hover:underline font-medium"
            >
              kilat-mail.pages.dev
            </a>
            <span>•</span>
            <a
              href="https://github.com/zzdree/kilat-mail"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
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
    </div>
  );
}
