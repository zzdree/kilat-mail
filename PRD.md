# 📋 Product Requirements Document (PRD)

## Project Name: **Kilat Mail** (⚡)
**Tagline:** *Serverless, Instant, and Privacy-First Temporary Email Service*  
**Live Application:** [https://kilat-mail.pages.dev](https://kilat-mail.pages.dev)  
**Live API Endpoint:** [https://kilat-mail-worker.zzdree.workers.dev](https://kilat-mail-worker.zzdree.workers.dev)  
**Repository:** [zzdree/kilat-mail](https://github.com/zzdree/kilat-mail)  
**Reference Inspiration:** [Threads Reference Post](https://www.threads.com/share/EhpxPkQAD/)  

---

## 1. 🎯 Executive Summary & Vision
**Kilat Mail** adalah layanan *disposable / temporary email* (email sekali pakai) modern yang dibangun di atas infrastruktur serverless **Cloudflare Email Routing**, **Cloudflare Workers**, dan **Cloudflare D1 (SQLite Database)**.

Tujuan utama Kilat Mail adalah memberikan pengalaman penerimaan email (terutama kode OTP, link aktivasi akun, dan verifikasi pendaftaran) yang **secepat kilat**, ramah pengguna bagi pengunjung umum, aman dari spam pelacak, 100% transparan, bebas iklan mengganggu, dan berbiaya $0 (serverless free tier).

---

## 2. 👥 Target Pengguna & Use Cases

| Persona | Kebutuhan Utama | Nilai Tambah Kilat Mail |
| :--- | :--- | :--- |
| **Developer / QA Tester** | Butuh puluhan akun email berbeda untuk testing alur pendaftaran aplikasi | Instant address generation, API endpoint, auto-parse OTP |
| **Pengguna Privasi** | Ingin mendaftar layanan tanpa membagikan email pribadi | Tidak ada tracking, email otomatis dihapus setelah kedaluwarsa |
| **Pengguna Umum (OTP)** | Menerima kode verifikasi cepat untuk download file/akses situs sekali pakai | Fitur *One-Click Copy OTP Code* otomatis tanpa perlu membaca seluruh email |

---

## 3. 🏗️ Arsitektur Sistem & Tech Stack

```text
[ Pengirim Email / OTP ]
          │ (SMTP)
          ▼
[ Cloudflare Email Routing (*@domain) ]
          │ (Worker Event Handler)
          ▼
[ Cloudflare Worker Backend (kilat-mail-worker) ]
   ├── Parser (postal-mime)
   ├── Extractor (Smart OTP Regex)
   └── Database Driver
          │
          ▼
[ Cloudflare D1 Database (kilat_mail_db) ]
          ▲
          │ (REST API & Realtime Polling)
          ▼
[ Frontend Web App (Vite + React 19 + Tailwind v4) ]
   ├── Live Inbox Stream & Badges
   ├── OTP Instant Copy Widget
   └── HTML Sanitized Reader (DOMPurify)
```

### Tech Stack:
* **Email Ingestion:** Cloudflare Email Routing (Catch-All Domain Rule).
* **Serverless Backend:** Cloudflare Workers (TypeScript).
* **Email Parser:** `postal-mime` (Lightweight RFC 822 / MIME parser di V8 worker).
* **Database:** Cloudflare D1 (Serverless Distributed SQLite, `kilat_mail_db`).
* **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4.
* **Hosting:** Cloudflare Pages (`kilat-mail.pages.dev`) & Cloudflare Workers.

---

## 4. ⚡ Fitur Utama & Kebutuhan Fungsional

### Phase 1: Core Engine (Status: ✅ IMPLEMENTED & LIVE)
1. **Instant Address Generator:**
   * Generate alamat email acak secara instan (misal: `kilat.x892a@domain.com`).
   * Pilihan untuk membuat **Custom Username** (misal: `andreas.test@domain.com`).
   * Tombol *Copy Email Address* satu kali klik dengan feedback visual haptik.

2. **Serverless Email Receiver & Storage:**
   * Menangkap semua email masuk yang dikirim ke domain yang terdaftar via Cloudflare Email Routing catch-all.
   * Parsing *Sender*, *Recipient*, *Subject*, *Date*, *Text Body*, dan *HTML Body*.
   * Menyimpan pesan ke Cloudflare D1 Database dengan index recipient teroptimasi.

3. **Realtime Live Inbox:**
   * Auto-refresh polling setiap 3.5 detik sehingga pesan langsung muncul begitu tiba di server.
   * Counter badge pesan baru yang belum dibaca.
   * Fitur hapus pesan individual dan kosongkan seluruh kotak masuk.

4. **Smart OTP / Verification Code Extractor:**
   * Analisis teks pesan menggunakan pattern matching cerdas untuk mendeteksi digit kode OTP (4-8 digit angka/alfanumerik).
   * Menampilkan kartu sorotan kode OTP di bagian atas pesan dan tag badge langsung di item list dengan tombol *"Salin Kode OTP"*.

5. **Sanitized HTML Message Viewer:**
   * Render HTML email yang aman dari XSS/script injeksi berbahaya menggunakan sanitasi ketat (`DOMPurify`).
   * Switcher tab antara format **HTML View**, **Plain Text View**, dan **Raw Headers**.

### Phase 2: Enhanced Capabilities
6. **Multi-Domain Selector:**
   * Mendukung pergantian domain kustom via Settings Modal.
7. **Auto-Expiration & Auto-Cleanup:**
   * Fitur cron trigger worker (`0 */6 * * *`) untuk membersihkan email yang sudah lebih dari 48 jam secara otomatis.
8. **Interactive Mock Testing:**
   * Tombol *"Kirim Mock OTP"* untuk menguji alur aplikasi secara instan tanpa perlu mengirim email nyata terlebih dahulu.

---

## 5. 🔒 Keamanan & Non-Functional Requirements
* **Privacy & Zero Logs:** Tidak menyimpan data pribadi user yang membuka web. Session email disimpan di browser `localStorage`.
* **Cross-Origin Resource Sharing (CORS):** Worker mengembalikan header CORS lengkap (`Access-Control-Allow-Origin: *`) untuk akses API frontend.
* **XSS Sanitization:** Konten HTML dibersihkan dengan `DOMPurify` sebelum dirender.
* **Performance:** Waktu respon query D1 < 50ms di edge; ukuran bundle frontend ~30kB gzipped.
