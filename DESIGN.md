# Design System: Kilat Mail (⚡)
**Project:** Kilat Mail  
**Repository:** [zzdree/kilat-mail](https://github.com/zzdree/kilat-mail)  

---

## 1. Visual Theme & Atmosphere
**Kilat Mail** mengusung filosofi desain *"Electric Precision Minimalist"*. 
Antarmuka dirancang untuk memancarkan kesan kecepatan super tinggi (*lightning fast*), kebersihan ekstrem tanpa gangguan visual atau banner iklan, serta kejelasan informasi instan.

* **Mood:** Snappy, Modern, High-Tech, Crisp, Trusted.
* **Density:** Balanced & Focused. Area kerja utama langsung menampilkan alamat email aktif dan feed inbox tanpa scrolling berlebih.
* **Depth & Elevation:** Menggunakan *subtle glass-morphism*, layer *whisper-soft borders*, dan elevasi bayangan halus (*whisper diffused shadows*) yang memberikan kesan taktil tanpa terasa berat.

---

## 2. Color Palette & Roles

| Token Name | Hex Code | Descriptive Name | Functional Role |
| :--- | :--- | :--- | :--- |
| `--color-primary-brand` | `#F59E0B` | Electric Amber Lightning | Aksen utama logo, status kilat, dan elemen high-priority |
| `--color-primary-brand-hover` | `#D97706` | Deep Golden Surge | Hover state tombol aksi utama & badge aktif |
| `--color-accent-cyan` | `#06B6D4` | Kinetic Neon Cyan | Indikator live status, streaming indicator, dan highlight OTP |
| `--color-bg-dark` | `#0B0F19` | Deep Obsidian Void | Background utama tema gelap (Dark mode default) |
| `--color-surface-dark` | `#111827` | Midnight Slate | Container card, inbox list item, modal surface |
| `--color-surface-dark-elevated`| `#1F2937` | Elevated Charcoal | Card hover state, input fields, header bar |
| `--color-border-dark` | `#374151` | Subtle Steel Wire | Border pembatas tipis berpresisi tinggi |
| `--color-text-primary` | `#F9FAFB` | Pure Starlight White | Teks judul utama, isi email, dan angka OTP |
| `--color-text-secondary`| `#9CA3AF` | Neutral Cool Slate | Subtitle, metadata pengirim, tanggal, dan placeholder |
| `--color-text-muted` | `#6B7280` | Muted Gunmetal | Label kecil, timestamp sekunder, footer notes |
| `--color-success` | `#10B981` | Emerald Surge | Notifikasi berhasil disalin (*Copied!*), status email terhubung |
| `--color-danger` | `#EF4444` | Crimson Flame | Tombol hapus inbox, reset alamat email, error state |

---

## 3. Typography Rules
* **Display & Body Font:** `Inter`, `Plus Jakarta Sans`, atau system fallback modern (`system-ui, -apple-system, sans-serif`).
* **Monospace Token Font:** `JetBrains Mono`, `Fira Code`, atau `ui-monospace` untuk alamat email, kode OTP, header MIME, dan payload data.
* **Typographic Hierarchy:**
  * **Hero / Title:** `text-2xl` sampai `text-3xl`, Font Weight `700 (Bold)`, tight letter-spacing (`-0.02em`).
  * **Email Bar Address:** `text-lg` sampai `text-xl`, Font Weight `600 (Semibold)`, Monospace.
  * **OTP Highlight Code:** `text-3xl` sampai `text-4xl`, Font Weight `800 (Extra Bold)`, Monospace, tracked out (`0.15em`).
  * **Body & Email Content:** `text-sm` sampai `text-base`, Line Height `1.6`, Font Weight `400 (Regular)`.

---

## 4. Component Stylings

### 🔘 1. Email Action Bar (The Hero Widget)
* **Container:** Subtly rounded pill-shaped box (`rounded-xl`), background `surface-dark-elevated` dengan aksen border tipis emas/amber.
* **Email Display:** Terlihat jelas di tengah dengan indikator titik hijau berkedip (*pulsing live indicator*) yang menandakan email aktif & siap menerima pesan.
* **Action Buttons:**
  * **Copy Button:** Tombol aksen amber dengan ikon kilat/salin. Menghasilkan animasi feedback *"Tersalin!"* saat diklik.
  * **Refresh Button:** Ikon putar halus yang berputar saat fetching realtime.
  * **Change / Randomize:** Tombol minimalis untuk mengganti username.

### 📬 2. Live Inbox List & Item Cards
* **Cards:** Rectangular cards dengan sudut melengkung halus (`rounded-lg`), transisi hover lembut dengan border glow warna aksen.
* **Unread State:** Ditandai dengan aksen garis vertikal di sebelah kiri berwarna `#06B6D4` (Neon Cyan) dan font pengirim tebal.
* **Item Metadata:** Menampilkan avatar monogram pengirim, nama pengirim, subjek yang terpotong rapi (*single line truncation*), dan relative time (misal: "2 detik lalu", "5 menit lalu").

### 🔑 3. Smart OTP Highlight Card (Special Component)
* **Card Design:** Ditempatkan di bagian atas saat detail email dibuka jika sistem mendeteksi kode OTP.
* **Atmosphere:** Aksen latar belakang transparan berpendar gradasi cyan ke amber (`bg-gradient-to-r`).
* **Content:** Label *"KODE VERIFIKASI TERDETEKSI"*, angka OTP berukuran besar di tengah, dan tombol instan *"Salin OTP"*.

### 📖 4. Sanitized Email Viewer
* **Header Detail:** Subjek besar, pengirim lengkap (name & address), tanggal/jam lengkap.
* **View Switcher:** Segmented control mini untuk beralih antara tampilan **Preview (HTML)** dan **Teks Polos (Plain Text)**.
* **Content Container:** Background kontras yang ramah mata dengan styling responsif untuk newsletter maupun plain text receipt.

---

## 5. Layout Principles
* **Max Width Container:** `max-w-4xl` (sekitar 896px) di tengah layar (*centered layout*) untuk memastikan fokus pengguna tetap pada email bar & inbox list.
* **Fluid Responsiveness:** Pada layar mobile (< 640px), layout bertransformasi menjadi *full width* dengan padding horizontal `16px`. Detail pesan membuka drawer/view penuh yang mulus.
* **Whitespace Strategy:** Spasi vertikal yang lega antar-section (`gap-6` / `gap-8`) untuk memastikan tidak terasa sempit atau membingungkan.
