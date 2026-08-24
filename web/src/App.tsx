import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { EmailBar } from './components/EmailBar';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QrModal } from './components/QrModal';
import { CodeSnippets } from './components/CodeSnippets';
import { InboxItem, MessageDetail as IMessageDetail } from './types';
import {
  fetchInbox,
  fetchMessage,
  deleteMessage,
  clearInbox,
  injectTestEmail,
  REAL_AVAILABLE_DOMAINS,
  getProviderForDomain,
} from './api';
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
  Bot,
  Bell,
  MailCheck,
} from 'lucide-react';

const RECENT_EMAILS_STORAGE_KEY = 'kilat_mail_recent_addresses';
const ACTIVE_MAILBOXES_STORAGE_KEY = 'kilat_mail_active_mailboxes';

function generateRandomEmail(domain: string): string {
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `kilat.${randomChars}@${domain}`;
}

// Audio alert generator (Web Audio API synth chime, no external MP3 asset required)
function playChimeSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function App() {
  const availableDomains = REAL_AVAILABLE_DOMAINS;
  const [domain, setDomain] = useState<string>(() => {
    return localStorage.getItem('kilat_mail_domain') || 'sharklasers.com';
  });

  const [currentEmail, setCurrentEmail] = useState<string>(() => {
    const saved = localStorage.getItem('kilat_mail_current_address');
    if (saved) return saved;
    const initial = generateRandomEmail('sharklasers.com');
    localStorage.setItem('kilat_mail_current_address', initial);
    return initial;
  });

  // Multiple active mailboxes tabs
  const [activeMailboxes, setActiveMailboxes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_MAILBOXES_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && list.length > 0) return list;
      return [currentEmail];
    } catch {
      return [currentEmail];
    }
  });

  // Riwayat 5 alamat email terakhir
  const [recentEmails, setRecentEmails] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_EMAILS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });

  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<IMessageDetail | null>(null);

  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Desktop Notifications
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });

  const prevInboxLength = useRef<number>(0);
  const isDocumentVisible = useRef<boolean>(true);
  const currentProvider = getProviderForDomain(domain);

  // Ambil latest OTP & Magic Link dari pesan masuk
  const latestOtp = inboxItems.find((i) => Boolean(i.detected_otp))?.detected_otp || '';
  const latestMagicLink = inboxItems.find((i) => Boolean(i.magic_link))?.magic_link || '';

  // Simpan ke Recent Mailboxes History & Active Mailboxes setiap kali email berganti
  useEffect(() => {
    if (!currentEmail) return;
    setRecentEmails((prev) => {
      const filtered = prev.filter((e) => e.toLowerCase() !== currentEmail.toLowerCase());
      const updated = [currentEmail, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_EMAILS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveMailboxes((prev) => {
      if (!prev.some((e) => e.toLowerCase() === currentEmail.toLowerCase())) {
        const updated = [...prev, currentEmail].slice(0, 4);
        localStorage.setItem(ACTIVE_MAILBOXES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [currentEmail]);

  // Tab Title Flashing saat ada pesan baru / OTP
  useEffect(() => {
    if (latestOtp) {
      document.title = `(${inboxItems.length}) 🔑 OTP: ${latestOtp} - Kilat Mail ⚡`;
    } else if (latestMagicLink) {
      document.title = `(${inboxItems.length}) 🔗 Link Aktivasi - Kilat Mail ⚡`;
    } else if (inboxItems.length > 0) {
      document.title = `(${inboxItems.length}) ✉️ Email Masuk - Kilat Mail ⚡`;
    } else {
      document.title = 'Kilat Mail ⚡ — Instant & Serverless Temporary Email';
    }
  }, [inboxItems, latestOtp, latestMagicLink]);

  // Request Desktop Notification Permission
  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser Anda tidak mendukung Web Notification API.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
  };

  // Trigger Notification & Audio saat ada email baru mendarat
  useEffect(() => {
    if (inboxItems.length > prevInboxLength.current && prevInboxLength.current !== 0) {
      playChimeSound();

      // Kirim browser desktop notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const newest = inboxItems[0];
        const title = newest.detected_otp
          ? `🔑 Kode OTP: ${newest.detected_otp}`
          : newest.magic_link
          ? `🔗 Link Verifikasi Diterima`
          : `✉️ Email Baru Masuk`;

        const body = `${newest.sender_name || newest.sender_address}: ${newest.subject || '(Tanpa Subjek)'}`;
        try {
          new Notification(title, {
            body,
            icon: '/icon-192.svg',
          });
        } catch {
          // Notification failed
        }
      }
    }
    prevInboxLength.current = inboxItems.length;
  }, [inboxItems]);

  const faqs = [
    {
      q: 'Apa itu Kilat Mail?',
      a: 'Kilat Mail adalah platform email sekali pakai (disposable temporary email) gratis berkecepatan tinggi dengan ekstraksi otomatis kode OTP/2FA dan tautan verifikasi akun secara instan tanpa perlu registrasi.',
    },
    {
      q: 'Bagaimana fitur Smart OTP & Magic Link bekerja?',
      a: 'Sistem menggunakan regex kontekstual cerdas dan parser HTML untuk langsung mengenali kode 4-8 digit OTP dan tombol/tautan konfirmasi, menampilkannya di kartu sorotan teratas untuk disalin dengan 1 klik.',
    },
    {
      q: 'Apakah bisa digunakan untuk Bot, Scraper, Playwright, dan AI Agent?',
      a: 'Sangat bisa! Kilat Mail menyediakan atribut DOM semantik (#kilat-hub[data-email], [data-latest-otp]) serta REST API publik ringan /api/otp?email=... dan /api/latest?email=... untuk otomatisasi Python, Selenium, Playwright, dan cURL.',
    },
    {
      q: 'Bagaimana status domain @kilat.eu.org, @kilat.us.kg, @kilat.pp.ua?',
      a: 'Domain-domain tersebut sudah terdaftar di zona Cloudflare. Begitu delegasi DNS selesai, Email Routing otomatis mengalirkan email ke database D1 SQLite edge.',
    },
    {
      q: 'Apakah saya bisa memilih domain lain yang langsung aktif?',
      a: 'Bisa! Kami menyediakan pilihan domain global seperti @sharklasers.com, @emalupe.com, @guerrillamail.com, @pokemail.net, @spam4.me, dan @grr.la yang langsung aktif 100% saat ini juga.',
    },
    {
      q: 'Apakah Kilat Mail 100% gratis?',
      a: 'Ya, Kilat Mail gratis selamanya tanpa batasan kuota penerimaan pesan, tanpa iklan mengganggu, dan tanpa pendaftaran akun.',
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

  const handleSelectRecentEmail = (selectedAddr: string) => {
    const newDomain = selectedAddr.split('@')[1] || domain;
    setDomain(newDomain);
    localStorage.setItem('kilat_mail_domain', newDomain);
    setCurrentEmail(selectedAddr);
    localStorage.setItem('kilat_mail_current_address', selectedAddr);
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleAddNewMailbox = () => {
    const fresh = generateRandomEmail(domain);
    setActiveMailboxes((prev) => {
      const updated = [...prev, fresh].slice(0, 4);
      localStorage.setItem(ACTIVE_MAILBOXES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setCurrentEmail(fresh);
    localStorage.setItem('kilat_mail_current_address', fresh);
    setSelectedId(null);
    setSelectedMessage(null);
  };

  const handleRemoveMailbox = (boxToRemove: string) => {
    setActiveMailboxes((prev) => {
      const filtered = prev.filter((b) => b.toLowerCase() !== boxToRemove.toLowerCase());
      const fallback = filtered.length > 0 ? filtered[0] : generateRandomEmail(domain);
      const finalList = filtered.length > 0 ? filtered : [fallback];
      localStorage.setItem(ACTIVE_MAILBOXES_STORAGE_KEY, JSON.stringify(finalList));
      if (currentEmail.toLowerCase() === boxToRemove.toLowerCase()) {
        handleSelectRecentEmail(fallback);
      }
      return finalList;
    });
  };

  const handleClearRecentEmails = () => {
    setRecentEmails([currentEmail]);
    localStorage.setItem(RECENT_EMAILS_STORAGE_KEY, JSON.stringify([currentEmail]));
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

  // Keyboard Shortcuts (C = Copy, O = Copy OTP, N = New Random, R = Refresh)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'c' || e.key === 'C') {
        navigator.clipboard.writeText(currentEmail);
      } else if ((e.key === 'o' || e.key === 'O') && latestOtp) {
        navigator.clipboard.writeText(latestOtp);
      } else if (e.key === 'n' || e.key === 'N') {
        handleRandomize();
      } else if (e.key === 'r' || e.key === 'R') {
        loadInbox(true);
      } else if (e.key === 'Escape' && selectedId) {
        setSelectedId(null);
        setSelectedMessage(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEmail, latestOtp, selectedId, loadInbox]);

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

  // Adaptive Smart Polling (Page Visibility API)
  useEffect(() => {
    loadInbox();

    let intervalId: any;

    const startAdaptivePolling = () => {
      if (intervalId) clearInterval(intervalId);
      const pollDelay = isDocumentVisible.current ? 3500 : 10000;
      intervalId = setInterval(() => {
        loadInbox();
      }, pollDelay);
    };

    const handleVisibilityChange = () => {
      isDocumentVisible.current = document.visibilityState === 'visible';
      if (isDocumentVisible.current) {
        loadInbox();
      }
      startAdaptivePolling();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAdaptivePolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
      {/* 🤖 AGENT/BOT METADATA HUB (Machine-Readable Node for Scrapers & Browser Agents) */}
      <div
        id="kilat-hub"
        className="sr-only"
        data-email={currentEmail}
        data-latest-otp={latestOtp}
        data-latest-magic-link={latestMagicLink}
        data-inbox-count={inboxItems.length}
        data-provider={currentProvider}
        aria-hidden="true"
      />

      {/* Header */}
      <Header
        isLive={true}
        notificationPermission={notificationPermission}
        onRequestNotification={handleRequestNotification}
        onInjectTest={handleInjectTest}
      />

      {/* Main Container */}
      <main className="w-full max-w-3xl px-4 py-8 sm:py-10 flex-1 flex flex-col">
        {/* Title Area */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mb-2 tracking-tight">
            Email Sementara Gratis & Cepat
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Terima email aktivasi, tautan magic link, dan kode OTP secara instan. Dioptimalkan untuk manusia, AI agent, dan automation scraper.
          </p>
        </div>

        {/* Email Bar Component with Multi-Mailbox Switcher */}
        <EmailBar
          email={currentEmail}
          domain={domain}
          availableDomains={availableDomains}
          recentEmails={recentEmails}
          activeMailboxes={activeMailboxes}
          isRefreshing={isRefreshing}
          onRefresh={() => loadInbox(true)}
          onRandomize={handleRandomize}
          onChangeUsername={handleChangeUsername}
          onSelectDomain={handleSelectDomain}
          onSelectRecentEmail={handleSelectRecentEmail}
          onAddNewMailbox={handleAddNewMailbox}
          onRemoveMailbox={handleRemoveMailbox}
          onClearRecentEmails={handleClearRecentEmails}
          onOpenQr={() => setIsQrOpen(true)}
        />

        {/* Helper & Shortcut Bar */}
        <div className="flex items-center justify-between mb-4 -mt-3 text-[11px] text-zinc-500 flex-wrap gap-2">
          <div className="hidden sm:flex items-center gap-2 font-mono">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">C</kbd> Salin
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">N</kbd> Acak
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">R</kbd> Refresh
            {latestOtp && (
              <>
                <kbd className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">O</kbd> Salin OTP
              </>
            )}
          </div>

          <button
            onClick={handleInjectTest}
            data-testid="mock-otp-btn"
            className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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

        {/* Bot & Agent API Snippets */}
        <section id="api" className="mb-12">
          <CodeSnippets email={currentEmail} />
        </section>

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
                Salin alamat email sementara yang sudah dibuat otomatis di atas atau buat custom username sesuka Anda.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">LANGKAH 02</div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Gunakan untuk Mendaftar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pakai alamat email ini untuk registrasi website, testing aplikasi, bot automation, atau download konten.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">LANGKAH 03</div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Baca Pesan & Salin OTP</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pesan akan langsung masuk di kotak masuk secara otomatis. Kode OTP dan Magic Link diekstrak otomatis.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="mb-12 border-t border-zinc-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-4 text-center">
            Fitur Unggulan Kilat Mail
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <KeyRound className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Smart OTP Extractor</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mendeteksi kode OTP verifikasi 4-8 digit secara otomatis dengan tombol 1-klik salin langsung.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <ExternalLink className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Magic Link Detector</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Menemukan link aktivasi akun dan URL konfirmasi pendaftaran secara instan tanpa perlu mencari di HTML.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">100% Tanpa Registrasi</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Langsung pakai tanpa akun, password, nomor HP, atau pelacakan cookie identitas pribadi.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <Bot className="w-5 h-5 text-purple-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">AI Agent & Bot Ready</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Endpoint REST API ringan (<code className="text-emerald-400 font-mono">/api/otp</code>) dan atribut DOM semantik siap pakai untuk scraper.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <Bell className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Desktop & Sound Alert</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Notifikasi pop-up browser dan suara chime otomatis saat email atau kode verifikasi baru tiba.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <MailCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Multi-Mailbox Tabs</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Buka dan kelola hingga beberapa alamat email sementara sekaligus secara simultan dalam satu jendela.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-12 border-t border-zinc-800/80 pt-8">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-4 text-center">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-zinc-200">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40">
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
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-300">Kilat Mail ⚡</span>
            <span>— Serverless Temporary Email</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <a
              href="https://github.com/zzdree/kilat-mail"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>$0 Cloudflare Stack</span>
          </div>
        </div>
      </footer>

      {/* QR Code Modal */}
      {isQrOpen && (
        <QrModal
          isOpen={isQrOpen}
          email={currentEmail}
          onClose={() => setIsQrOpen(false)}
        />
      )}
    </div>
  );
}
