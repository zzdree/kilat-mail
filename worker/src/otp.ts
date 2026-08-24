/**
 * Smart OTP & Magic Link / Verification URL Extractor
 * Mengidentifikasi digit kode verifikasi / OTP dan Magic Link dari teks atau HTML email.
 */

export function extractOtpCode(subject: string | null = '', bodyText: string | null = ''): string | null {
  const content = `${subject || ''}\n${bodyText || ''}`;
  if (!content.trim()) return null;

  // 1. Pola dengan kata kunci kontekstual (Bahasa Indonesia & English)
  const contextualPatterns = [
    // Kode verifikasi Anda adalah: 123456 atau 123-456 atau 123 456
    /(?:kode\s+verifikasi|verification\s+code|security\s+code|confirmation\s+code|kode\s+konfirmasi|kode\s+keamanan|otp(?:\s+code)?|passcode|pin|login\s+code|access\s+code|auth\s+code|validation\s+code)[\s:=#*\-_—–]+([0-9]{3,4}[-\s]?[0-9]{3,4}|[0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    // Masukkan kode 123456 untuk... / Enter code 123456
    /(?:enter|masukkan|gunakan|use|your\s+code\s+is|kode\s+anda\s+adalah|kode\s+kamu\s+adalah)[\s:=#*\-_—–]+([0-9]{3,4}[-\s]?[0-9]{3,4}|[0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    // [123456] adalah kode OTP
    /\[([0-9]{4,8}|[A-Z0-9]{5,8})\](?:\s+is\s+your|\s+adalah\s+kode|\s+to\s+verify)/i,
    // Format 123-456 atau 123 456 dengan label kode
    /(?:kode|code|otp|pin)[\s:=#*\-_—–]+([0-9]{3}[-\s][0-9]{3})/i,
    // G-123456 (Google / generic prefix)
    /\b([A-Z]-[0-9]{4,8})\b/i
  ];

  for (const pattern of contextualPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[-\s]/g, '').trim();
      // Pastikan bukan tahun 2020-2030 kecuali jika explicitly labeled
      if (cleaned.length === 4) {
        const num = parseInt(cleaned, 10);
        if (num >= 2020 && num <= 2035 && !/kode|code|otp|pin/i.test(pattern.source)) {
          continue;
        }
      }
      return cleaned;
    }
  }

  // 2. Pola format angka terisolasi yang menonjol di subject (misal: "123456 is your Discord verification code")
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch && subjectMatch[1]) {
      const num = parseInt(subjectMatch[1], 10);
      if (!(subjectMatch[1].length === 4 && num >= 2020 && num <= 2035)) {
        return subjectMatch[1];
      }
    }
  }

  // 3. Fallback: Standalone line yang hanya berisi 4-8 angka atau huruf kapital-angka
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[0-9]{4,8}$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (!(trimmed.length === 4 && num >= 2020 && num <= 2035)) {
        return trimmed;
      }
    }
  }

  return null;
}

/**
 * Smart Magic Link / Activation Link Extractor
 * Mendeteksi URL verifikasi, konfirmasi pendaftaran, login 1-klik dari HTML atau Plain Text.
 */
export function extractMagicLink(bodyHtml: string | null = '', bodyText: string | null = ''): string | null {
  const html = bodyHtml || '';
  const text = bodyText || '';

  // 1. Cari dari Anchor Tag HTML yang relevan (misal <a href="..." ...>Verify Email</a>)
  if (html) {
    const anchorRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gis;
    let match;
    const candidates: { url: string; score: number }[] = [];

    while ((match = anchorRegex.exec(html)) !== null) {
      const url = match[1];
      const anchorText = match[2].replace(/<[^>]*>/g, '').trim().toLowerCase();
      let score = 0;

      // Unsubscribe / privacy / terms links harus diabaikan
      if (/unsubscribe|optout|opt-out|privacy|terms|twitter\.com|facebook\.com|instagram\.com|linkedin\.com/i.test(url) ||
          /unsubscribe|berhenti berlangganan/i.test(anchorText)) {
        continue;
      }

      // Skor berdasarkan anchor text
      if (/verif|confirm|activat|konfirmasi|verifikasi|aktivasi|login|sign in|masuk|click here|klik di sini|complete|get started/i.test(anchorText)) {
        score += 10;
      }

      // Skor berdasarkan URL structure
      if (/verify|confirm|activate|magic[-_]?link|token=|token\/|code=|auth\/|validate/i.test(url)) {
        score += 8;
      }

      if (score > 0) {
        candidates.push({ url, score });
      }
    }

    if (candidates.length > 0) {
      // Urutkan berdasarkan score tertinggi
      candidates.sort((a, b) => b.score - a.score);
      return cleanUrl(candidates[0].url);
    }
  }

  // 2. Cari dari Plain Text (URL raw dengan keyword verifikasi di sekitarnya)
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const textUrls = text.match(urlRegex) || [];

  for (const rawUrl of textUrls) {
    if (/unsubscribe|optout|privacy|terms/i.test(rawUrl)) continue;
    if (/verify|confirm|activate|magic[-_]?link|token=|code=|auth\/|signup\/confirm/i.test(rawUrl)) {
      return cleanUrl(rawUrl);
    }
  }

  return null;
}

function cleanUrl(url: string): string {
  // Bersihkan trailing punctuation seperti .) or > yang sering terbawa
  return url.replace(/[.,;:)\]>]+$/, '').trim();
}
