# 📋 Product Requirements Document (PRD)

## Project Name: **Kilat Mail** (⚡)
**Tagline:** *Serverless, Instant, and Privacy-First Temporary Email Service*  
**Repository:** [zzdree/kilat-mail](https://github.com/zzdree/kilat-mail)  
**Reference Inspiration:** [Threads Reference Post](https://www.threads.com/share/EhpxPkQAD/)  

---

## 1. 🎯 Executive Summary & Vision
**Kilat Mail** adalah layanan *disposable / temporary email* (email sekali pakai) modern yang dibangun di atas infrastruktur serverless **Cloudflare Email Routing**, **Cloudflare Workers**, dan **Cloudflare D1 (SQLite Database)**.

Tujuan utama Kilat Mail adalah memberikan pengalaman penerimaan email (terutama kode OTP, link aktivasi akun, dan verifikasi pendaftaran) yang **secepat kilat**, aman dari spam pelacak, 100% transparan, bebas iklan mengganggu, dan berbiaya $0 (serverless free tier).

---

## 2. 👥 Target Pengguna & Use Cases

| Persona | Kebutuhan Utama | Nilai Tambah Kilat Mail |
| :--- | :--- | :--- |
| **Developer / QA Tester** | Butuh puluhan akun email berbeda untuk testing alur pendaftaran aplikasi | Instant address generation, API endpoint, auto-parse OTP |
| **Pengguna Privasi** | Ingin mendaftar layanan tanpa membagikan email pribadi | Tidak ada tracking, email otomatis dihapus setelah kedaluwarsa |
| **Pengguna Umum (OTP)** | Menerima kode verifikasi cepat untuk download file/akses situs sekali pakai | Fitur *One-Click Copy OTP Code* otomatis tanpa perlu membaca seluruh email |

---

## 3. 🏗️ Arsitektur Sistem & Tech Stack

```
[ Pengirim Email / OTP ]
          │ (SMTP)
          ▼
[ Cloudflare Email Routing (*@domain) ]
          │ (Worker Event Handler)
          ▼
[ Cloudflare Worker Backend ]
   ├── Parser (postal-mime)
   ├── Extractor (Smart OTP Regex)
   └── Database Driver
          │
          ▼
[ Cloudflare D1 Database (SQLite Edge) ]
          ▲
          │ (REST API & SSE Realtime)
          ▼
[ Frontend Web App (Vite + React + Tailwind/CSS) ]
   ├── Live Inbox Stream
   ├── OTP Instant Copy Widget
   └── HTML Sanitized Reader (DOMPurify)
```

### Tech Stack:
* **Email Ingestion:** Cloudflare Email Routing (Catch-All Domain Rule).
* **Serverless Backend:** Cloudflare Workers (TypeScript).
* **Email Parser:** `postal-mime` (Lightweight RFC 822 / MIME parser di V8 worker).
* **Database:** Cloudflare D1 (Serverless Distributed SQLite).
* **Frontend:** Vite + React + TypeScript + Vanilla/Tailwind CSS tokens.
* **Hosting:** Cloudflare Pages (Frontend) & Cloudflare Workers (Backend).

---

## 4. ⚡ Fitur Utama & Kebutuhan Fungsional

### Phase 1: Core Engine (MVP)
1. **Instant Address Generator:**
   * Generate alamat email acak secara instan (misal: `kilat.x892a@domain.com`).
   * Pilihan untuk membuat **Custom Username** (misal: `andreas.test@domain.com`).
   * Tombol *Copy Email Address* satu kali klik dengan feedback visual.

2. **Serverless Email Receiver & Storage:**
   * Menangkap semua email masuk yang dikirim ke domain yang terdaftar.
   * Parsing *Sender*, *Recipient*, *Subject*, *Date*, *Text Body*, dan *HTML Body*.
   * Menyimpan pesan ke Cloudflare D1 Database dengan index recipient teroptimasi.

3. **Realtime Live Inbox:**
   * Auto-refresh polling / Server-Sent Events (SSE) sehingga pesan langsung muncul begitu tiba di server.
   * Counter badge pesan baru yang belum dibaca.

4. **Smart OTP / Verification Code Extractor:**
   * Analisis teks pesan menggunakan pattern matching cerdas untuk mendeteksi digit kode OTP (4-8 digit angka/alfanumerik).
   * Menampilkan kartu sorotan kode OTP di bagian atas pesan dengan tombol *"Salin Kode OTP"*.

5. **Sanitized HTML Message Viewer:**
   * Render HTML email yang aman dari XSS/script injeksi berbahaya menggunakan sanitasi ketat (`DOMPurify`).
   * Switcher tab antara format **HTML View**, **Plain Text View**, dan **Raw Headers**.

### Phase 2: Enhanced Capabilities
6. **Multi-Domain Selector:**
   * Mendukung lebih dari 1 domain jika user memiliki beberapa domain aktif di Cloudflare.
7. **Auto-Expiration & Auto-Cleanup:**
   * Fitur cron trigger worker untuk membersihkan email yang sudah lebih dari 24 jam / 48 jam secara otomatis.
8. **Forward to Telegram / Webhook (Opsional):**
   * Meneruskan pesan atau OTP masuk ke bot Telegram pemilik secara instan.
9. **Dark Mode & PWA Support:**
   * Tema gelap adaptif dan kemampuan diinstal di homescreen HP/desktop.

---

## 5. 🔒 Keamanan & Non-Functional Requirements
* **Privacy & Zero Logs:** Tidak menyimpan data pribadi user yang membuka web. Session email disimpan di browser `localStorage`.
* **XSS Defense:** Semua konten HTML wajib melalui filter sanitasi sebelum dirender di DOM.
* **Performance:** Waktu respon API inbox < 150ms di edge network global Cloudflare.
* **Resilience:** Penanganan fallback jika body email dalam format non-standar atau encoding khusus (Base64, Quoted-Printable).

---

## 6. 📅 Rencana Milestones
* **Milestone 1:** Repository setup, PRD & DESIGN.md, inisialisasi struktur monorepo.
* **Milestone 2:** Backend Cloudflare Worker + D1 Database Schema + Email Routing Parser.
* **Milestone 3:** REST API endpoint untuk inbox & detail pesan.
* **Milestone 4:** Frontend UI dengan fitur Realtime Inbox, OTP Extractor, dan Sanitized HTML Viewer.
* **Milestone 5:** Testing, dokumentasi setup Cloudflare, dan deployment panduan.
