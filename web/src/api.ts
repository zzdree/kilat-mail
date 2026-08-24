import { InboxItem, MessageDetail } from './types';

// ==========================================
// KILAT MAIL MULTI-PROVIDER REAL ENGINE
// Providers:
// 1. Mail.tm (@emalupe.com)
// 2. Guerrilla Mail (@sharklasers.com, @guerrillamail.com, @pokemail.net, @spam4.me, @grr.la)
// 3. Cloudflare Worker Native (@kilat.us.kg, @kilat.eu.org, @kilat.pp.ua)
// ==========================================

const STORAGE_EMAIL_KEY = 'kilat_mail_current_address';
const STORAGE_TOKEN_KEY = 'kilat_mail_live_token';
const STORAGE_GM_SID_KEY = 'kilat_mail_gm_sid';
const LOCAL_MOCK_STORAGE_KEY = 'kilat_mail_local_inbox';

const MAIL_TM_API = 'https://api.mail.tm';
const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';
export const CLOUDFLARE_WORKER_API = 'https://kilat-mail-worker.zzdree.workers.dev';
const FIXED_PASSWORD = 'KilatMailSecurePass123!';

export const REAL_AVAILABLE_DOMAINS = [
  'sharklasers.com',
  'emalupe.com',
  'guerrillamail.com',
  'pokemail.net',
  'spam4.me',
  'grr.la',
  'kilat.us.kg',
  'kilat.eu.org',
  'kilat.pp.ua',
];

export function getProviderForDomain(domain: string): 'mailtm' | 'guerrilla' | 'cloudflare' {
  if (domain === 'emalupe.com') return 'mailtm';
  if (
    [
      'sharklasers.com',
      'guerrillamail.com',
      'guerrillamailblock.com',
      'guerrillamail.net',
      'guerrillamail.org',
      'pokemail.net',
      'spam4.me',
      'grr.la',
    ].includes(domain)
  ) {
    return 'guerrilla';
  }
  return 'cloudflare';
}

/**
 * Ekstraksi kode OTP dari teks / subjek
 */
export function extractOtpFromText(subject?: string | null, body?: string | null): string | null {
  const textToScan = `${subject || ''}\n${body || ''}`;
  if (!textToScan.trim()) return null;

  const patterns = [
    /(?:kode\s+verifikasi|verification\s+code|security\s+code|confirmation\s+code|kode\s+konfirmasi|kode\s+keamanan|otp(?:\s+code)?|passcode|pin|login\s+code|access\s+code|auth\s+code|validation\s+code)[\s:=#*\-_—–]+([0-9]{3,4}[-\s]?[0-9]{3,4}|[0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    /(?:enter|masukkan|gunakan|use|your\s+code\s+is|kode\s+anda\s+adalah|kode\s+kamu\s+adalah)[\s:=#*\-_—–]+([0-9]{3,4}[-\s]?[0-9]{3,4}|[0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    /\[([0-9]{4,8}|[A-Z0-9]{5,8})\](?:\s+is\s+your|\s+adalah\s+kode|\s+to\s+verify)/i,
    /(?:kode|code|otp|pin)[\s:=#*\-_—–]+([0-9]{3}[-\s][0-9]{3})/i,
    /\b([A-Z]-[0-9]{4,8})\b/i,
  ];

  for (const regex of patterns) {
    const match = textToScan.match(regex);
    if (match && match[1]) {
      const code = match[1].replace(/[-\s]/g, '').trim();
      const yearNum = parseInt(code, 10);
      if (code.length === 4 && yearNum >= 2020 && yearNum <= 2035 && !/kode|code|otp|pin/i.test(regex.source)) {
        continue;
      }
      return code;
    }
  }

  // Fallback: 4-8 digit standalone
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch && subjectMatch[1]) {
      const num = parseInt(subjectMatch[1], 10);
      if (!(subjectMatch[1].length === 4 && num >= 2020 && num <= 2035)) {
        return subjectMatch[1];
      }
    }
  }

  return null;
}

/**
 * Ekstraksi Magic Link / URL Verifikasi
 */
export function extractMagicLinkFromContent(html?: string | null, text?: string | null): string | null {
  const htmlContent = html || '';
  const textContent = text || '';

  // 1. Dari HTML Anchor Tags
  if (htmlContent) {
    const anchorRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gis;
    let match;
    const candidates: { url: string; score: number }[] = [];

    while ((match = anchorRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      const anchorText = match[2].replace(/<[^>]*>/g, '').trim().toLowerCase();
      let score = 0;

      if (/unsubscribe|optout|opt-out|privacy|terms|twitter\.com|facebook\.com|instagram\.com|linkedin\.com/i.test(url) ||
          /unsubscribe|berhenti berlangganan/i.test(anchorText)) {
        continue;
      }

      if (/verif|confirm|activat|konfirmasi|verifikasi|aktivasi|login|sign in|masuk|click here|klik di sini|complete|get started/i.test(anchorText)) {
        score += 10;
      }
      if (/verify|confirm|activate|magic[-_]?link|token=|token\/|code=|auth\/|validate/i.test(url)) {
        score += 8;
      }

      if (score > 0) {
        candidates.push({ url, score });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return cleanUrl(candidates[0].url);
    }
  }

  // 2. Dari Plain Text URLs
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const textUrls = textContent.match(urlRegex) || [];
  for (const rawUrl of textUrls) {
    if (/unsubscribe|optout|privacy|terms/i.test(rawUrl)) continue;
    if (/verify|confirm|activate|magic[-_]?link|token=|code=|auth\/|signup\/confirm/i.test(rawUrl)) {
      return cleanUrl(rawUrl);
    }
  }

  return null;
}

function cleanUrl(url: string): string {
  return url.replace(/[.,;:)\]>]+$/, '').trim();
}

// ----------------------------------------------------
// 1. MAIL.TM HANDLER
// ----------------------------------------------------
async function ensureMailTmAccount(email: string): Promise<string | null> {
  const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
  const savedEmail = localStorage.getItem(STORAGE_EMAIL_KEY);

  if (savedToken && savedEmail?.toLowerCase() === email.toLowerCase()) {
    return savedToken;
  }

  try {
    await fetch(`${MAIL_TM_API}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password: FIXED_PASSWORD }),
    });

    const authRes = await fetch(`${MAIL_TM_API}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password: FIXED_PASSWORD }),
    });

    if (!authRes.ok) return null;
    const tokenData = await authRes.json();
    if (tokenData.token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, tokenData.token);
      return tokenData.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchMailTmInbox(email: string): Promise<InboxItem[]> {
  let token = await ensureMailTmAccount(email);
  if (!token) return [];

  let res = await fetch(`${MAIL_TM_API}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Auto-recovery jika token expired (401/403)
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    token = await ensureMailTmAccount(email);
    if (!token) return [];
    res = await fetch(`${MAIL_TM_API}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!res.ok) return [];
  const json = await res.json();
  const raw = json['hydra:member'] || [];

  return raw.map((m: any) => ({
    id: `mtm_${m.id}`,
    recipient: email,
    sender_name: m.from?.name || m.from?.address || 'Unknown',
    sender_address: m.from?.address || 'unknown@domain.com',
    subject: m.subject || '(Tanpa Subjek)',
    detected_otp: extractOtpFromText(m.subject, m.intro),
    magic_link: extractMagicLinkFromContent(null, m.intro),
    raw_size: m.size || 0,
    is_read: m.seen ? 1 : 0,
    created_at: m.createdAt || new Date().toISOString(),
  }));
}

async function fetchMailTmDetail(rawId: string): Promise<MessageDetail> {
  let token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) throw new Error('Token sesi tidak ditemukan');

  let res = await fetch(`${MAIL_TM_API}/messages/${rawId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    const email = localStorage.getItem(STORAGE_EMAIL_KEY) || '';
    token = await ensureMailTmAccount(email);
    if (!token) throw new Error('Gagal memperbarui sesi token Mail.tm');
    res = await fetch(`${MAIL_TM_API}/messages/${rawId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!res.ok) throw new Error('Gagal mengambil pesan');
  const m = await res.json();
  const bodyText = m.text || m.intro || '';
  const bodyHtml = m.html && m.html.length > 0 ? m.html[0] : null;

  return {
    id: `mtm_${m.id}`,
    recipient: m.to?.[0]?.address || '',
    sender_name: m.from?.name || null,
    sender_address: m.from?.address || '',
    subject: m.subject || '(Tanpa Subjek)',
    body_text: bodyText,
    body_html: bodyHtml,
    detected_otp: extractOtpFromText(m.subject, bodyText),
    magic_link: extractMagicLinkFromContent(bodyHtml, bodyText),
    raw_size: m.size || 0,
    is_read: 1,
    created_at: m.createdAt || new Date().toISOString(),
  };
}

// ----------------------------------------------------
// 2. GUERRILLA MAIL HANDLER
// ----------------------------------------------------
async function ensureGuerrillaSession(email: string): Promise<string> {
  const user = email.split('@')[0];
  let sid = localStorage.getItem(STORAGE_GM_SID_KEY);

  if (!sid) {
    const res = await fetch(`${GUERRILLA_API}?f=get_email_address`);
    if (res.ok) {
      const data = await res.json();
      sid = data.sid_token;
      if (sid) localStorage.setItem(STORAGE_GM_SID_KEY, sid);
    }
  }

  if (sid && user) {
    try {
      await fetch(`${GUERRILLA_API}?f=set_email_user&email_user=${encodeURIComponent(user)}&sid_token=${sid}`);
    } catch (e) {
      console.warn('Error setting guerrilla user:', e);
    }
  }

  return sid || '';
}

async function fetchGuerrillaInbox(email: string): Promise<InboxItem[]> {
  try {
    const sid = await ensureGuerrillaSession(email);
    if (!sid) return [];

    const res = await fetch(`${GUERRILLA_API}?f=get_email_list&offset=0&sid_token=${sid}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.list || [];

    return list.map((m: any) => ({
      id: `gm_${m.mail_id}`,
      recipient: email,
      sender_name: m.mail_from || 'Unknown',
      sender_address: m.mail_from || 'unknown@sender.com',
      subject: m.mail_subject || '(Tanpa Subjek)',
      detected_otp: extractOtpFromText(m.mail_subject, m.mail_excerpt),
      magic_link: extractMagicLinkFromContent(null, m.mail_excerpt),
      raw_size: parseInt(m.mail_size || '0', 10),
      is_read: m.mail_read ? 1 : 0,
      created_at: new Date(parseInt(m.mail_timestamp || `${Date.now() / 1000}`, 10) * 1000).toISOString(),
    }));
  } catch (err) {
    console.warn('Guerrilla fetch error:', err);
    return [];
  }
}

async function fetchGuerrillaDetail(rawId: string): Promise<MessageDetail> {
  const sid = localStorage.getItem(STORAGE_GM_SID_KEY) || '';
  const res = await fetch(`${GUERRILLA_API}?f=fetch_email&email_id=${rawId}&sid_token=${sid}`);
  if (!res.ok) throw new Error('Gagal memuat pesan Guerrilla');
  const m = await res.json();

  const bodyHtml = m.mail_body || null;
  const bodyText = m.mail_excerpt || '';

  return {
    id: `gm_${m.mail_id}`,
    recipient: m.mail_recipient || '',
    sender_name: m.mail_from || null,
    sender_address: m.mail_from || '',
    subject: m.mail_subject || '(Tanpa Subjek)',
    body_text: bodyText,
    body_html: bodyHtml,
    detected_otp: extractOtpFromText(m.mail_subject, bodyHtml || bodyText),
    magic_link: extractMagicLinkFromContent(bodyHtml, bodyText),
    raw_size: parseInt(m.mail_size || '0', 10),
    is_read: 1,
    created_at: new Date(parseInt(m.mail_timestamp || `${Date.now() / 1000}`, 10) * 1000).toISOString(),
  };
}

// ----------------------------------------------------
// 3. CLOUDFLARE WORKER NATIVE HANDLER
// ----------------------------------------------------
async function fetchCloudflareInbox(email: string): Promise<InboxItem[]> {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_API}/api/inbox?email=${encodeURIComponent(email)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchCloudflareDetail(id: string): Promise<MessageDetail> {
  const res = await fetch(`${CLOUDFLARE_WORKER_API}/api/message/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Gagal mengambil detail pesan Cloudflare');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Pesan tidak ditemukan');
  return json.data;
}

// ----------------------------------------------------
// UNIFIED API EXPORTS
// ----------------------------------------------------

export async function fetchInbox(email: string): Promise<InboxItem[]> {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const provider = getProviderForDomain(domain);
  const localMocks = getLocalMockMessages(email).map(({ body_text, body_html, ...rest }) => rest);

  let realItems: InboxItem[] = [];

  if (provider === 'mailtm') {
    realItems = await fetchMailTmInbox(email);
  } else if (provider === 'guerrilla') {
    realItems = await fetchGuerrillaInbox(email);
  } else {
    realItems = await fetchCloudflareInbox(email);
  }

  return [...realItems, ...localMocks];
}

export async function fetchMessage(id: string): Promise<MessageDetail> {
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

  if (id.startsWith('mtm_')) {
    return await fetchMailTmDetail(id.replace('mtm_', ''));
  }

  if (id.startsWith('gm_')) {
    return await fetchGuerrillaDetail(id.replace('gm_', ''));
  }

  return await fetchCloudflareDetail(id);
}

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

  if (id.startsWith('mtm_')) {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      await fetch(`${MAIL_TM_API}/messages/${id.replace('mtm_', '')}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return;
  }

  if (id.startsWith('gm_')) {
    const sid = localStorage.getItem(STORAGE_GM_SID_KEY) || '';
    await fetch(`${GUERRILLA_API}?f=del_email&email_ids[]=${id.replace('gm_', '')}&sid_token=${sid}`);
    return;
  }

  await fetch(`${CLOUDFLARE_WORKER_API}/api/message/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function clearInbox(email: string): Promise<void> {
  const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
  if (raw) {
    const all: MessageDetail[] = JSON.parse(raw);
    const filtered = all.filter((m) => m.recipient.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(filtered));
  }

  const domain = email.split('@')[1]?.toLowerCase() || '';
  const provider = getProviderForDomain(domain);

  if (provider === 'mailtm') {
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
  } else if (provider === 'cloudflare') {
    await fetch(`${CLOUDFLARE_WORKER_API}/api/inbox?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
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

export function injectTestEmail(email: string, otpCode = '749201'): MessageDetail {
  const magicLink = `https://github.com/login/oauth/authorize?client_id=kilat_app&state=demo_${Date.now()}&confirm=true`;
  const mockMsg: MessageDetail = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: email.toLowerCase(),
    sender_name: 'GitHub Security',
    sender_address: 'noreply@github.com',
    subject: `[GitHub] Kode verifikasi akun Anda adalah ${otpCode}`,
    body_text: `Halo,\n\nGunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi Anda:\n\nKode Verifikasi: ${otpCode}\n\nAtau klik tautan konfirmasi langsung:\n${magicLink}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.\n\nSalam,\nTim Keamanan GitHub`,
    body_html: `
      <div style="font-family: sans-serif; padding: 24px; background: #18181b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: #34d399; margin-bottom: 16px;">Verifikasi Akun GitHub</h2>
        <p>Gunakan kode verifikasi berikut untuk menyelesaikan proses autentikasi akun Anda:</p>
        <div style="background: #27272a; border: 1px solid #3f3f46; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #34d399;">${otpCode}</span>
        </div>
        <p style="margin-bottom: 16px;">Atau konfirmasi langsung dengan 1-klik di bawah ini:</p>
        <div style="text-align: center; margin: 16px 0;">
          <a href="${magicLink}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Aktivasi & Masuk Akun Sekarang ↗
          </a>
        </div>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 24px; border-top: 1px solid #27272a; padding-top: 12px;">Kode ini hanya berlaku selama 10 menit. Abaikan email ini jika Anda tidak merasa memintanya.</p>
      </div>
    `,
    detected_otp: otpCode,
    magic_link: magicLink,
    raw_size: 1620,
    is_read: 0,
    created_at: new Date().toISOString(),
  };

  const raw = localStorage.getItem(LOCAL_MOCK_STORAGE_KEY);
  const all: MessageDetail[] = raw ? JSON.parse(raw) : [];
  all.unshift(mockMsg);
  localStorage.setItem(LOCAL_MOCK_STORAGE_KEY, JSON.stringify(all));
  return mockMsg;
}
