/**
 * Smart OTP & Verification Code Extractor
 * Mengidentifikasi digit kode verifikasi / OTP dari teks atau subject email.
 */
export function extractOtpCode(subject: string | null = '', bodyText: string | null = ''): string | null {
  const content = `${subject || ''}\n${bodyText || ''}`;
  if (!content.trim()) return null;

  // 1. Pola dengan kata kunci kontekstual (Bahasa Indonesia & English)
  const contextualPatterns = [
    // Kode verifikasi Anda adalah: 123456
    /(?:kode\s+verifikasi|verification\s+code|security\s+code|confirmation\s+code|kode\s+konfirmasi|kode\s+keamanan|otp(?:\s+code)?|passcode|pin|login\s+code|access\s+code)[\s:=#*\-_—–]+([0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    // Masukkan kode 123456 untuk...
    /(?:enter|masukkan|gunakan|use|your\s+code\s+is|kode\s+anda\s+adalah)[\s:=#*\-_—–]+([0-9]{4,8}|[A-Z0-9]{5,8})\b/i,
    // [123456] adalah kode OTP
    /\[([0-9]{4,8})\](?:\s+is\s+your|\s+adalah\s+kode)/i,
    // Format 123-456 atau 123 456
    /(?:kode|code|otp)[\s:=#*\-_—–]+([0-9]{3}[-\s][0-9]{3})/i
  ];

  for (const pattern of contextualPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Bersihkan pemisah strip/spasi jika ada
      return match[1].replace(/[-\s]/g, '').trim();
    }
  }

  // 2. Pola format angka terisolasi yang menonjol di subject (misal: "123456 is your Discord verification code")
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch && subjectMatch[1]) {
      return subjectMatch[1];
    }
  }

  // 3. Fallback: Standalone line yang hanya berisi 4-8 angka
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[0-9]{4,8}$/.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
}
