# ⚡ Kilat Mail

<p align="center">
  <img src="https://raw.githubusercontent.com/zzdree/kilat-mail/main/web/public/vite.svg" width="64" height="64" alt="Kilat Mail Logo" />
</p>

<h3 align="center">
  Layanan Temporary Email Serverless Berkecepatan Tinggi dengan Smart OTP Extractor
</h3>

<p align="center">
  Ditenagai oleh <b>Cloudflare Email Routing</b>, <b>Cloudflare Workers</b>, <b>Cloudflare D1 (SQLite Edge)</b>, dan <b>Cloudflare Pages</b>.
</p>

<p align="center">
  <a href="https://kilat-mail.pages.dev"><strong>🌐 Coba Live Demo »</strong></a>
  <br />
  <a href="https://kilat-mail-worker.zzdree.workers.dev/health">API Health Check</a>
  ·
  <a href="#-arsitektur-sistem">Arsitektur</a>
  ·
  <a href="#-fitur-unggulan">Fitur Unggulan</a>
  ·
  <a href="#-panduan-instalasi-lokal">Instalasi Lokal</a>
  ·
  <a href="#-deployment-ke-cloudflare-0">Deploy $0</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Live-kilat--mail.pages.dev-amber?style=flat-square&logo=cloudflarepages" alt="Live Demo" />
  <img src="https://img.shields.io/badge/Stack-Cloudflare%20Workers%20%2B%20D1-orange?style=flat-square&logo=cloudflare" alt="Cloudflare Stack" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20v4-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Type%20Safe-TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Cost-$0%20(Free%20Tier)-emerald?style=flat-square" alt="Zero Cost" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License" />
</p>

---

## ⚡ Apa itu Kilat Mail?

**Kilat Mail** adalah platform *disposable / temporary email* (email sekali pakai) mandiri yang dirancang dengan filosofi **Electric Precision Minimalist**. Kilat Mail memungkinkan Anda menerima email aktivasi, link pendaftaran, dan kode verifikasi (OTP) secara instan tanpa perlu mendaftarkan akun atau mengorbankan privasi email pribadi ke situs pihak ketiga.

Seluruh sistem berjalan 100% di infrastruktur **Cloudflare Serverless Free Tier**, menghilangkan kebutuhan akan server IMAP/SMTP tradisional yang rumit dan mahal.

---

## 🚀 Live Production Links

* 🌐 **Web Application:** [https://kilat-mail.pages.dev](https://kilat-mail.pages.dev)
* ⚡ **Worker API Endpoint:** [https://kilat-mail-worker.zzdree.workers.dev](https://kilat-mail-worker.zzdree.workers.dev)
* 🩺 **Backend Health Check:** [https://kilat-mail-worker.zzdree.workers.dev/health](https://kilat-mail-worker.zzdree.workers.dev/health)
* 📦 **GitHub Repository:** [https://github.com/zzdree/kilat-mail](https://github.com/zzdree/kilat-mail)

---

## 🌟 Fitur Unggulan

* 🔑 **Smart OTP / 2FA Extractor:** Secara otomatis mengenali dan mengekstrak kode verifikasi 4–8 digit dari subjek maupun isi email, disajikan dalam kartu sorotan besar untuk penyalinan 1-klik.
* ⚡ **Instant Realtime Inbox:** Inbox langsung melakukan sinkronisasi otomatis setiap 3.5 detik tanpa perlu me-refresh halaman secara manual.
* 🎲 **Custom Username & Generator Acak:** Buat username sesuka Anda (`nama-anda@domain.com`) atau acak alamat unik baru dalam hitungan milidetik.
* 🛡️ **Sanitasi HTML Tingkat Tinggi:** Parsing email aman dari XSS, pelacak piksel, dan script jahat menggunakan `DOMPurify`.
* 🔒 **Zero Data Retention & Auto-Cleanup:** Email kedaluwarsa secara otomatis dibersihkan secara berkala oleh Cron Trigger Worker.
* 💸 **100% Serverless & Gratis ($0):** Menggunakan Cloudflare Pages, Workers, D1 Database, dan Email Routing.

---

## 🏗️ Arsitektur Sistem

```text
[ Pengirim Email / OTP ]
           │ (Protokol SMTP)
           ▼
[ Cloudflare Email Routing (*@domain) ]
           │ (Catch-All Action)
           ▼
[ Cloudflare Worker Handler (kilat-mail-worker) ]
   ├── MIME Parser (postal-mime)
   ├── Smart OTP Regex Extractor
   └── D1 Database Driver
           │
           ▼
[ Cloudflare D1 Database (kilat_mail_db) ]
           ▲
           │ (REST API / CORS)
           ▼
[ Cloudflare Pages Frontend (Vite + React 19 + Tailwind v4) ]
   ├── One-Click Address Copy Bar
   ├── Live Inbox Stream & Badges
   ├── Smart OTP Quick Copy Card
   └── Sanitized Multi-Tab Reader (HTML / Text / Raw)
```

---

## 📁 Struktur Direktori Project

```text
kilat-mail/
├── PRD.md                     # Product Requirements Document & Technical Spec
├── DESIGN.md                  # Design System & UI/UX Guidelines
├── README.md                  # Dokumentasi & Panduan Lengkap
├── worker/                    # Backend Serverless Cloudflare Worker
│   ├── src/
│   │   ├── index.ts           # Email Ingestion + REST API Endpoints
│   │   ├── otp.ts             # Smart Verification Code Extractor Logic
│   │   └── types.ts           # Type Definitions (Worker Env & D1 Models)
│   ├── schema.sql             # Skema D1 SQLite Table & Indexing
│   ├── wrangler.jsonc         # Konfigurasi Wrangler (D1 Binding & Cron)
│   └── package.json
└── web/                       # Frontend Web App (React 19 + Vite + Tailwind)
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx     # Top Navbar & Status Indicator
    │   │   ├── EmailBar.tsx   # Hero Address Box & Action Buttons
    │   │   ├── InboxList.tsx  # Feed Kotak Masuk & OTP Chips
    │   │   ├── MessageDetail.tsx # Email Content Reader & Tabs
    │   │   ├── OtpCard.tsx    # Kartu Sorotan Kode OTP Instan
    │   │   ├── SettingsModal.tsx # Pengaturan Domain & API URL
    │   │   └── SetupGuideModal.tsx # Panduan Setup Domain Cloudflare
    │   ├── api.ts             # API Client & Mock Generator
    │   ├── App.tsx            # Komponen Utama & Flow Orkestrasi
    │   ├── index.css          # Design System Styles & Tailwind Setup
    │   └── main.tsx           # React Root Entrypoint
    ├── index.html
    └── package.json
```

---

## 🛠️ Panduan Instalasi Lokal

### 1. Prasyarat
* Node.js v18+ atau v20+
* npm atau pnpm
* Akun Cloudflare (untuk deployment)

### 2. Clone Repositori
```bash
git clone https://github.com/zzdree/kilat-mail.git
cd kilat-mail
```

### 3. Menjalankan Frontend Web
```bash
cd web
npm install
npm run dev
```
Buka browser di `http://localhost:3000`. Jika backend belum tersambung, frontend secara otomatis berjalan dalam **Mode Simulasi (Mock Mode)** lengkap dengan tombol **"Kirim Mock OTP"**.

### 4. Menjalankan Backend Worker
```bash
cd ../worker
npm install
npx wrangler dev
```

---

## ☁️ Deployment ke Cloudflare ($0)

### 1. Inisialisasi Cloudflare D1 Database
```bash
cd worker
npx wrangler d1 create kilat_mail_db
# Masukkan database_id yang didapat ke dalam worker/wrangler.jsonc

# Eksekusi migrasi skema tabel
npx wrangler d1 execute kilat_mail_db --remote --file=./schema.sql
```

### 2. Deploy Worker Backend
```bash
npx wrangler deploy
# Output URL: https://kilat-mail-worker.<subdomain>.workers.dev
```

### 3. Deploy Frontend ke Cloudflare Pages
```bash
cd ../web
npm run build
npx wrangler pages deploy dist --project-name kilat-mail --branch main
```

### 4. Menghubungkan Domain & Email Routing
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > Pilih Domain Anda (misal domain gratis `eu.org` atau `.my.id`).
2. Masuk ke menu **Email Routing** > **Routes**.
3. Buat **Catch-all rule**:
   * *Match:* Any email (`*@yourdomain.com`)
   * *Action:* **Send to Worker**
   * *Destination Worker:* `kilat-mail-worker`

---

## 📡 REST API Reference

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Mengecek status kesehatan Worker & D1 database |
| `GET` | `/api/inbox?email={address}` | Mengambil daftar email masuk untuk alamat tertentu |
| `GET` | `/api/message/:id` | Mengambil detail lengkap isi email & menandai telah dibaca |
| `DELETE` | `/api/message/:id` | Menghapus 1 pesan email secara permanen |
| `DELETE` | `/api/inbox?email={address}` | Menghapus seluruh pesan dalam kotak masuk |

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk rincian selengkapnya.

Dibuat dengan ⚡ oleh **[Andreas Restuawanta Christwara (zzdree)](https://github.com/zzdree)**.
