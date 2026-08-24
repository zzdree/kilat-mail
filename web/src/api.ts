import { InboxItem, MessageDetail } from './types';

// Default worker endpoint (bisa diganti via setting UI atau .env)
const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || '';

export function getApiBaseUrl(): string {
  const saved = localStorage.getItem('kilat_mail_api_url');
  return saved !== null ? saved : DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem('kilat_mail_api_url', url);
}

// In-Memory / LocalStorage Mock Data untuk local testing tanpa worker aktif
const LOCAL_MOCK_STORAGE_KEY = 'kilat_mail_local_inbox';

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

export async function fetchInbox(email: string): Promise<InboxItem[]> {
  const base = getApiBaseUrl();
  if (!base) {
    // Mode demo / local mock fallback jika worker belum dihubungkan
    const mock = getLocalMockMessages(email);
    return mock.map(({ body_text, body_html, ...rest }) => rest);
  }

  const res = await fetch(`${base}/api/inbox?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat inbox');
  return json.data;
}

export async function fetchMessage(id: string): Promise<MessageDetail> {
  const base = getApiBaseUrl();
  if (!base) {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    const all: MessageDetail[] = raw ? JSON.parse(raw) : [];
    const found = all.find((m) => m.id === id);
    if (!found) throw new Error('Pesan tidak ditemukan');
    found.is_read = 1;
    localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(all));
    return found;
  }

  const res = await fetch(`${base}/api/message/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat detail pesan');
  return json.data;
}

export async function deleteMessage(id: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    if (raw) {
      const all: MessageDetail[] = JSON.parse(raw);
      const filtered = all.filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(filtered));
    }
    return;
  }

  const res = await fetch(`${base}/api/message/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal menghapus pesan');
}

export async function clearInbox(email: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
    if (raw) {
      const all: MessageDetail[] = JSON.parse(raw);
      const filtered = all.filter((m) => m.recipient.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(filtered));
    }
    return;
  }

  const res = await fetch(`${base}/api/inbox?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal mengosongkan inbox');
}

/**
 * Utility untuk inject test mock email (misal untuk testing UI / OTP)
 */
export function injectTestEmail(email: string, otpCode = '749201'): MessageDetail {
  const mockMsg: MessageDetail = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: email.toLowerCase(),
    sender_name: 'GitHub Security',
    sender_address: 'noreply@github.com',
    subject: `[GitHub] Kode verifikasi Anda adalah ${otpCode}`,
    body_text: `Halo,\n\nGunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi Anda:\n\nKode Verifikasi: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.\n\nSalam,\nTim Keamanan GitHub`,
    body_html: `
      <div style="font-family: sans-serif; padding: 20px; background: #0d1117; color: #c9d1d9; border-radius: 8px;">
        <h2 style="color: #58a6ff; margin-bottom: 16px;">Verifikasi Akun GitHub</h2>
        <p>Gunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi akun Anda:</p>
        <div style="background: #161b22; border: 1px solid #30363d; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8;">${otpCode}</span>
        </div>
        <p style="color: #8b949e; font-size: 13px;">Kode ini hanya berlaku selama 10 menit. Abaikan email ini jika Anda tidak merasa memintanya.</p>
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
