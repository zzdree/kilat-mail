import { InboxItem, MessageDetail } from './types';

// Storage keys
const STORAGE_EMAIL_KEY = 'kilat_mail_current_address';
const STORAGE_TOKEN_KEY = 'kilat_mail_live_token';
const STORAGE_ACCOUNT_ID_KEY = 'kilat_mail_live_account_id';
const STORAGE_PASS_KEY = 'kilat_mail_live_password';
const LOCAL_MOCK_STORAGE_KEY = 'kilat_mail_local_inbox';

const MAIL_TM_API = 'https://api.mail.tm';
const FIXED_PASSWORD = 'KilatMailSecurePass123!';

/**
 * Ekstraksi kode OTP dari teks / subjek
 */
export function extractOtpFromText(subject?: string | null, body?: string | null): string | null {
  const textToScan = `${subject || ''} ${body || ''}`;
  if (!textToScan.trim()) return null;

  const patterns = [
    /(?:kode|code|otp|pin|verifikasi|verification|token)\s*(?:is|adalah|:|\s)\s*([0-9]{4,8})/i,
    /(?:is|adalah)\s*([0-9]{4,8})/i,
    /\b([0-9]{6})\b/,
    /\b([0-9]{4,8})\b/,
  ];

  for (const regex of patterns) {
    const match = textToScan.match(regex);
    if (match && match[1]) {
      const code = match[1];
      const yearNum = parseInt(code, 10);
      if (code.length === 4 && yearNum >= 2020 && yearNum <= 2030) continue;
      return code;
    }
  }

  return null;
}

/**
 * 1. Ambil domain aktif yang benar-benar bisa menerima email global
 */
export async function getLiveAvailableDomains(): Promise<string[]> {
  try {
    const res = await fetch(`${MAIL_TM_API}/domains`);
    if (!res.ok) throw new Error('Gagal memuat domain live');
    const json = await res.json();
    const domains: string[] = json['hydra:member']
      ?.filter((d: any) => d.isActive)
      ?.map((d: any) => d.domain) || [];
    return domains.length > 0 ? domains : ['emalupe.com', 'kilat.eu.org'];
  } catch {
    return ['emalupe.com', 'kilat.eu.org'];
  }
}

/**
 * 2. Buat atau autentikasi akun real mail.tm
 */
export async function ensureLiveAccount(email: string): Promise<string | null> {
  const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
  const savedEmail = localStorage.getItem(STORAGE_EMAIL_KEY);

  if (savedToken && savedEmail?.toLowerCase() === email.toLowerCase()) {
    return savedToken;
  }

  try {
    // 1. Coba registrasi akun baru
    const regRes = await fetch(`${MAIL_TM_API}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password: FIXED_PASSWORD }),
    });

    // 2. Login untuk mendapatkan JWT Token
    const authRes = await fetch(`${MAIL_TM_API}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password: FIXED_PASSWORD }),
    });

    if (!authRes.ok) {
      console.warn('Failed to obtain token for live email:', email);
      return null;
    }

    const tokenData = await authRes.json();
    const token = tokenData.token;
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      return token;
    }
    return null;
  } catch (err) {
    console.error('Error ensuring live email account:', err);
    return null;
  }
}

/**
 * 3. Ambil daftar Inbox (Real Mail.tm + Local Mock)
 */
export async function fetchInbox(email: string): Promise<InboxItem[]> {
  const localMocks = getLocalMockMessages(email).map(({ body_text, body_html, ...rest }) => rest);

  try {
    const token = await ensureLiveAccount(email);
    if (!token) return localMocks;

    const res = await fetch(`${MAIL_TM_API}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return localMocks;

    const json = await res.json();
    const rawMessages = json['hydra:member'] || [];

    const realItems: InboxItem[] = rawMessages.map((m: any) => ({
      id: m.id,
      recipient: email,
      sender_name: m.from?.name || m.from?.address || 'Unknown',
      sender_address: m.from?.address || 'unknown@domain.com',
      subject: m.subject || '(Tanpa Subjek)',
      detected_otp: extractOtpFromText(m.subject, m.intro),
      raw_size: m.size || 0,
      is_read: m.seen ? 1 : 0,
      created_at: m.createdAt || new Date().toISOString(),
    }));

    return [...realItems, ...localMocks];
  } catch (err) {
    console.warn('Fallback to local mocks:', err);
    return localMocks;
  }
}

/**
 * 4. Ambil isi detail pesan
 */
export async function fetchMessage(id: string): Promise<MessageDetail> {
  // Cek mock ID
  if (id.startsWith('mock-')) {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    const all: MessageDetail[] = raw ? JSON.parse(raw) : [];
    const found = all.find((m) => m.id === id);
    if (found) {
      found.is_read = 1;
      localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(all));
      return found;
    }
    throw new Error('Pesan tidak ditemukan');
  }

  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) throw new Error('Sesi email tidak ditemukan');

  const res = await fetch(`${MAIL_TM_API}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Gagal mengambil pesan live');

  const m = await res.json();
  const bodyText = m.text || m.intro || '';
  const bodyHtml = m.html && m.html.length > 0 ? m.html[0] : null;

  return {
    id: m.id,
    recipient: m.to?.[0]?.address || '',
    sender_name: m.from?.name || null,
    sender_address: m.from?.address || '',
    subject: m.subject || '(Tanpa Subjek)',
    body_text: bodyText,
    body_html: bodyHtml,
    detected_otp: extractOtpFromText(m.subject, bodyText),
    raw_size: m.size || 0,
    is_read: 1,
    created_at: m.createdAt || new Date().toISOString(),
  };
}

/**
 * 5. Hapus pesan
 */
export async function deleteMessage(id: string): Promise<void> {
  if (id.startsWith('mock-')) {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    if (raw) {
      const all: MessageDetail[] = JSON.parse(raw);
      const filtered = all.filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(filtered));
    }
    return;
  }

  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) return;

  await fetch(`${MAIL_TM_API}/messages/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * 6. Kosongkan Inbox
 */
export async function clearInbox(email: string): Promise<void> {
  const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
  if (raw) {
    const all: MessageDetail[] = JSON.parse(raw);
    const filtered = all.filter((m) => m.recipient.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(filtered));
  }

  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) return;
    const res = await fetch(`${MAIL_TM_API}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      const messages = json['hydra:member'] || [];
      await Promise.all(
        messages.map((m: any) =>
          fetch(`${MAIL_TM_API}/messages/${m.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    }
  } catch (err) {
    console.error('Error clearing live inbox:', err);
  }
}

function getLocalMockMessages(email: string): MessageDetail[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    if (!raw) return [];
    const all: MessageDetail[] = JSON.parse(raw);
    return all.filter((m) => m.recipient.toLowerCase() === email.toLowerCase());
  } catch {
    return [];
  }
}

/**
 * Injeksi test email lokal untuk simulator instan
 */
export function injectTestEmail(email: string, otpCode = '749201'): MessageDetail {
  const mockMsg: MessageDetail = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: email.toLowerCase(),
    sender_name: 'GitHub Security',
    sender_address: 'noreply@github.com',
    subject: `[GitHub] Kode verifikasi akun Anda adalah ${otpCode}`,
    body_text: `Halo,\n\nGunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi Anda:\n\nKode Verifikasi: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.\n\nSalam,\nTim Keamanan GitHub`,
    body_html: `
      <div style="font-family: sans-serif; padding: 20px; background: #18181b; color: #f4f4f5; border-radius: 8px;">
        <h2 style="color: #34d399; margin-bottom: 16px;">Verifikasi Akun GitHub</h2>
        <p>Gunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi akun Anda:</p>
        <div style="background: #27272a; border: 1px solid #3f3f46; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #34d399;">${otpCode}</span>
        </div>
        <p style="color: #a1a1aa; font-size: 13px;">Kode ini hanya berlaku selama 10 menit. Abaikan email ini jika Anda tidak merasa memintanya.</p>
      </div>
    `,
    detected_otp: otpCode,
    raw_size: 1420,
    is_read: 0,
    created_at: new Date().toISOString(),
  };

  const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
  const all: MessageDetail[] = raw ? JSON.parse(raw) : [];
  all.unshift(mockMsg);
  localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(all));
  return mockMsg;
}
