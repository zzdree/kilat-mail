# ⚡ Kilat Mail

> **Serverless, Instant, and Privacy-First Temporary Email Service**  
> Dibuat dengan Cloudflare Email Routing, Cloudflare Workers, dan Cloudflare D1.

---

## 📖 Tentang Kilat Mail
**Kilat Mail** adalah layanan temporary email mandiri (*self-hosted serverless*) yang dirancang untuk menerima pesan verifikasi, OTP, dan email sementara tanpa perlu setup dan maintenance mail server IMAP/SMTP sendiri.

### ✨ Fitur Unggulan
- ⚡ **Super Cepat & Serverless:** Berjalan di jaringan edge Cloudflare Workers.
- 🔒 **Privasi Terjaga:** Tanpa tracking pihak ketiga, tanpa iklan yang mengganggu.
- 🎯 **Smart OTP Extractor:** Otomatis mendeteksi dan mengekstrak kode verifikasi OTP (4-8 digit) dari isi pesan.
- 🔄 **Realtime Live Inbox:** Pesan langsung muncul di layar secara instan.
- 🛡️ **Sanitized Viewer:** Sanitasi HTML ketat untuk mencegah serangan XSS berbahaya.
- 💰 **100% Biaya $0:** Berjalan di Cloudflare Free Tier yang sangat longgar.

---

## 📚 Dokumentasi
- [Product Requirements Document (PRD)](./PRD.md)
- [Design System & Tokens (DESIGN.md)](./DESIGN.md)

---

## 🛠️ Tech Stack
- **Ingestion:** Cloudflare Email Routing
- **Backend:** Cloudflare Workers (TypeScript)
- **Database:** Cloudflare D1 (SQLite at the Edge)
- **Parser:** `postal-mime`
- **Frontend:** Vite + React + TypeScript + Vanilla/Tailwind CSS
- **Deployment:** Cloudflare Pages & Workers

---

## 🚀 Status Pengembangan
- [x] Inisialisasi Repositori & Dokumentasi Arsitektur
- [ ] Implementasi Backend Cloudflare Worker & D1 Database
- [ ] Implementasi Frontend Web UI & Realtime Stream
- [ ] Fitur Smart OTP Extraction
- [ ] Panduan Setup Domain & Deploy Panduan
