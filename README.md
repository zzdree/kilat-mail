# ⚡ Kilat Mail

> **Serverless, Instant, and Privacy-First Temporary Email Service**  
> Dibangun dengan Cloudflare Email Routing, Cloudflare Workers, dan Cloudflare D1.

---

## 📖 Tentang Kilat Mail
**Kilat Mail** adalah layanan temporary email mandiri (*self-hosted serverless*) yang dirancang untuk menerima pesan verifikasi, OTP, dan email sementara tanpa perlu setup dan maintenance server IMAP/SMTP sendiri.

### ✨ Fitur Unggulan
- ⚡ **Super Cepat & Serverless:** Berjalan di jaringan edge global Cloudflare Workers.
- 🎯 **Smart OTP Extractor:** Otomatis mendeteksi dan mengekstrak kode verifikasi OTP (4-8 digit) dari isi pesan dengan tombol satu-klik salin.
- 🔄 **Realtime Live Inbox:** Pesan langsung muncul di layar tanpa reload halaman.
- 🛡️ **Sanitized HTML Viewer:** Sanitasi ketat menggunakan DOMPurify untuk mencegah XSS.
- 🔒 **Privasi Terjaga:** Tanpa tracking, tanpa iklan pihak ketiga.
- 🧪 **Offline / Mock Mode:** Mendukung pengujian lokal langsung di browser dengan tombol *"Kirim Mock OTP"*.
- 💰 **100% Gratis ($0):** Sepenuhnya memanfaatkan Cloudflare Free Tier.

---

## 📂 Struktur Project
```text
kilat-mail/
├── worker/               # Backend Cloudflare Worker
│   ├── src/
│   │   ├── index.ts      # Email Routing & REST API Handler
│   │   ├── otp.ts        # Smart OTP Regex Extractor
│   │   ├── types.ts      # TypeScript interfaces
│   │   └── schema.sql    # Skema Cloudflare D1 SQLite
│   ├── wrangler.jsonc    # Konfigurasi Cloudflare & D1 Binding
│   └── package.json
│
├── web/                  # Frontend Web App (Vite + React + TS)
│   ├── src/
│   │   ├── components/   # Header, EmailBar, InboxList, MessageDetail, OtpCard, dll.
│   │   ├── api.ts        # Client API & Mock Generator
│   │   ├── index.css     # Design System Tokens
│   │   └── App.tsx       # Master-Detail Realtime Inbox
│   ├── index.html
│   └── package.json
│
├── PRD.md                # Product Requirements Document
├── DESIGN.md             # Design System & Token Specification
└── README.md
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Menjalankan Frontend (Web)
```bash
cd web
npm install
npm run dev
```
Buka browser di `http://localhost:3000`. Kamu bisa langsung mencoba fitur:
- Generate alamat acak / kustom
- Salin alamat email
- Klik tombol **"Kirim Mock OTP"** untuk menguji deteksi kode OTP dan tampilan sanitized HTML.

### 2. Menjalankan Backend Worker Secara Lokal
```bash
cd worker
npm install
# Inisialisasi Database D1 lokal
npm run db:init:local
# Jalankan Worker lokal
npm run dev
```

---

## ☁️ Panduan Deployment ke Cloudflare ($0)

### 1. Buat Database D1 & Deploy Worker
```bash
cd worker

# 1. Login ke Cloudflare
npx wrangler login

# 2. Buat database D1
npx wrangler d1 create kilat_mail_db

# 3. Masukkan database_id yang didapat ke dalam worker/wrangler.jsonc

# 4. Inisialisasi tabel di Cloudflare D1
npx wrangler d1 execute kilat_mail_db --remote --file=./src/schema.sql

# 5. Deploy Worker
npx wrangler deploy
```

### 2. Konfigurasi Cloudflare Email Routing
1. Buka dashboard Cloudflare dan pilih domain Anda (misal domain gratis `eu.org` / `is-a.dev` / `.my.id`).
2. Masuk ke menu **Email** → **Email Routing** dan klik **Enable**.
3. Buka tab **Routing rules** → **Catch-all rule**.
4. Set action menjadi **Send to Worker** dan pilih worker `kilat-mail-worker`.

### 3. Deploy Frontend Web ke Cloudflare Pages
```bash
cd web
npm run build
npx wrangler pages deploy dist --project-name kilat-mail
```

---

## 📚 Dokumen Lengkap
- [Product Requirements Document (PRD)](./PRD.md)
- [Design System & Tokens (DESIGN.md)](./DESIGN.md)

---

## 👤 Author
- **Andreas Restuawanta Christwara** ([@zzdree](https://github.com/zzdree))
