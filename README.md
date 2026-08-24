# ⚡ Kilat Mail v2.0

<p align="center">
  <img src="https://raw.githubusercontent.com/zzdree/kilat-mail/main/web/public/vite.svg" width="64" height="64" alt="Kilat Mail Logo" />
</p>

<h3 align="center">
  Layanan Temporary Email Serverless Berkecepatan Tinggi dengan Smart OTP & Magic Link Extractor
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
  <a href="#-endpoint-api-untuk-bot--ai-agent">API / Bot Guide</a>
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

**Kilat Mail** adalah platform *disposable / temporary email* (email sekali pakai) mandiri yang dirancang dengan filosofi **Electric Precision Minimalist**. Kilat Mail memungkinkan Anda menerima email aktivasi, link pendaftaran/magic link, dan kode verifikasi (OTP) secara instan tanpa perlu mendaftarkan akun atau mengorbankan privasi email pribadi ke situs pihak ketiga.

Sistem juga dirancang khusus ramah **AI Agent, Web Scraper, dan Bot Automation** (Playwright, Selenium, Puppeteer, Python Requests, cURL) melalui endpoint REST API ultra-ringan dan atribut DOM semantik.

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
* 🔗 **Smart Magic Link Detector:** Mendeteksi tombol dan link aktivasi akun (verifikasi email 1-klik) langsung dari HTML email tanpa perlu mencari manual.
* 📬 **Multi-Mailbox Tabs:** Buka dan pantau hingga 4 alamat email sementara secara bersamaan dalam satu tab browser.
* 🔔 **Desktop & Sound Notification:** Notifikasi desktop browser otomatis (Web Notification API) dan audio chime sintetis saat email atau OTP baru tiba.
* 🔍 **Search & Filter Inbox:** Cari email berdasarkan pengirim, subjek, atau filter khusus email yang memiliki OTP / Magic Link.
* 🤖 **AI Agent & Automation Friendly:** Endpoint 1-baris `/api/otp?email=...` dan atribut DOM semantik `#kilat-hub` untuk integrasi Playwright, Selenium, dan Python.
* ⚡ **Instant Realtime Inbox:** Sinkronisasi adaptif otomatis setiap 3.5 detik (10 detik saat tab diminimize untuk efisiensi resource).
* 🎲 **Custom Username & Generator Acak:** Buat username sesuka Anda (`nama-anda@domain.com`) atau acak alamat unik baru dalam hitungan milidetik.
* 🛡️ **Sanitasi HTML Tingkat Tinggi:** Parsing email aman dari XSS, pelacak piksel, dan script jahat menggunakan `DOMPurify`.
* 🔒 **Zero Data Retention & Auto-Cleanup:** Email kedaluwarsa secara otomatis dibersihkan secara berkala oleh Cron Trigger Worker.
* 💸 **100% Serverless & Gratis ($0):** Menggunakan Cloudflare Pages, Workers, D1 Database, dan Email Routing.

---

## 🤖 Endpoint API untuk Bot & AI Agent

Kilat Mail menyediakan REST API publik tanpa autentikasi yang dapat dipanggil langsung:

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/otp?email={address}` | **Rekomendasi Bot:** Ambil kode OTP dan Magic Link terbaru secara instan dalam 1 panggilan JSON ringan. |
| `GET` | `/api/latest?email={address}` | Ambil seluruh payload email terbaru (subjek, sender, body text, body HTML). |
| `GET` | `/api/inbox?email={address}` | Ambil daftar 50 pesan terakhir di inbox email tersebut. |
| `GET` | `/api/message/{id}` | Ambil detail pesan lengkap berdasarkan ID pesan. |
| `DELETE` | `/api/inbox?email={address}` | Kosongkan seluruh isi inbox email tersebut. |
| `DELETE` | `/api/message/{id}` | Hapus 1 pesan spesifik. |

### Contoh Pemanggilan Python (Requests):
```python
import requests, time

EMAIL = "test.user@sharklasers.com"

# Poll sampai OTP tiba (maksimal 60 detik)
for _ in range(20):
    res = requests.get(f"https://kilat-mail-worker.zzdree.workers.dev/api/otp?email={EMAIL}").json()
    if res.get("success") and res.get("data", {}).get("has_otp"):
        print("🔑 OTP:", res["data"]["latest_otp"])
        break
    time.sleep(3)
```

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
   ├── Smart OTP & Magic Link Regex Extractor
   └── D1 Database Driver (with Composite Index)
           │
           ▼
[ Cloudflare D1 Database (kilat_mail_db) ]
           ▲
           │ (REST API / CORS)
           ▼
[ Cloudflare Pages Frontend (Vite + React 19 + Tailwind v4) ]
   ├── Multi-Mailbox Tab Bar & Address Copy Box
   ├── Live Inbox Stream, Search & Filter
   ├── Smart OTP & Magic Link Quick Copy Card
   ├── Desktop Notification & Web Audio Chime
   └── Sanitized Multi-Tab Reader (HTML / Text / EML / JSON)
```

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
* Node.js v18+
* Akun Cloudflare (Gratis) & Wrangler CLI

### 2. Jalankan Frontend Web
```bash
cd web
npm install
npm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Jalankan Worker Backend
```bash
cd worker
npm install
npm run dev
```

---

## 📄 Lisensi

MIT License © 2026 [zzdree](https://github.com/zzdree)
