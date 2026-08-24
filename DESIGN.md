# Design System: Kilat Mail (⚡)

**Project:** Kilat Mail  
**Repository:** [zzdree/kilat-mail](https://github.com/zzdree/kilat-mail)  
**Live URL:** [https://kilat-mail.pages.dev](https://kilat-mail.pages.dev)  

---

## 1. Visual Theme & Philosophy
**Kilat Mail** mengusung filosofi desain *"Electric Precision Minimalist"*. 
Antarmuka dirancang untuk memberikan sudut pandang (POV) pengunjung yang **simpel, frictionless, dan cepat**:
1. Pengunjung datang langsung melihat alamat email siap pakai.
2. Tombol salin email berukuran besar dengan feedback visual *"Tersalin!"*.
3. Feed kotak masuk responsif dengan indikator realtime dan deteksi otomatis kode OTP.
4. Nilai manfaat (value propositions) yang jelas dan menenangkan bagi pengguna privasi.

* **Mood:** Snappy, Modern, High-Tech, Crisp, Trusted.
* **Density:** Balanced & Focused (`max-w-5xl` centered container).
* **Depth & Elevation:** Menggunakan *subtle glass-morphism*, layer *whisper-soft borders* (`border-gray-800`), dan aksen pendaran amber (`glow-amber-subtle`).

---

## 2. Color Palette & Roles

| Token Name | Hex Code | Descriptive Name | Functional Role |
| :--- | :--- | :--- | :--- |
| `--color-primary-brand` | `#F59E0B` | Electric Amber Lightning | Aksen utama logo, tombol utama, dan sorotan OTP |
| `--color-primary-brand-hover` | `#D97706` | Deep Golden Surge | Hover state tombol aksi utama & badge aktif |
| `--color-accent-cyan` | `#06B6D4` | Kinetic Neon Cyan | Indikator live status, streaming indicator, dan border unread |
| `--color-bg-dark` | `#0B0F19` | Deep Obsidian Void | Background utama aplikasi (Dark mode default) |
| `--color-surface-dark` | `#111827` | Midnight Slate | Container card, inbox list item, modal surface |
| `--color-surface-dark-elevated`| `#1F2937` | Elevated Charcoal | Card hover state, input fields, header bar |
| `--color-border-dark` | `#374151` | Subtle Steel Wire | Border pembatas tipis berpresisi tinggi |
| `--color-text-primary` | `#F9FAFB` | Pure Starlight White | Judul utama, isi email, dan angka OTP |
| `--color-text-secondary`| `#9CA3AF` | Neutral Cool Slate | Subtitle, metadata pengirim, tanggal, dan placeholder |
| `--color-text-muted` | `#6B7280` | Muted Gunmetal | Label kecil, timestamp sekunder, footer notes |
| `--color-success` | `#10B981` | Emerald Surge | Notifikasi berhasil disalin (*Copied!*), status live |
| `--color-danger` | `#EF4444` | Crimson Flame | Tombol hapus inbox, reset alamat email |

---

## 3. Typography & Spacing
* **Display & Body Font:** `Inter`, `system-ui, -apple-system, sans-serif`.
* **Monospace Token Font:** `JetBrains Mono`, `ui-monospace, Consolas` untuk alamat email, kode OTP, dan raw headers.
* **Typographic Scale:**
  * **Hero Headline:** `text-2xl` sampai `text-4xl`, Font Weight `800 (Extra Bold)`.
  * **Email Address Box:** `text-base` sampai `text-xl`, Font Weight `700 (Bold)`, Monospace.
  * **OTP Highlight Code:** `text-3xl` sampai `text-4xl`, Font Weight `800 (Extra Bold)`, Monospace, tracked out (`0.15em`).
  * **Body & Email Content:** `text-xs` sampai `text-sm`, Line Height `1.6`.

---

## 4. Visitor-First Component Layout

### 🔘 1. Hero Email Bar Widget
* **Container:** Card `bg-[#111827]` dengan border `border-gray-800/90` dan pendaran gradasi amber tipis di garis atas.
* **Email Address Input:** Background `#0B0F19` berbayang ke dalam (*shadow-inner*) dengan font amber tebal yang dapat disalin satu klik.
* **Action Buttons:**
  * **"Salin Email" Button:** Aksen amber cerah yang bertransformasi menjadi hijau zamrud (`#10B981`) saat disalin.
  * **"Acak" & "Kustom" Buttons:** Tombol sekunder dengan ikon intuitif.
  * **"Kirim Mock OTP" Button:** Tombol uji coba instan dengan aksen pendaran lembut.

### 📬 2. Kotak Masuk (Feed & Empty State)
* **Unread Indicator:** Aksen garis vertikal kiri cyan `#06B6D4` dan avatar monogram pengirim.
* **OTP Tag Chip:** Tag badge di dalam baris email `KeyRound + OTP: XXXXXX` sehingga pengunjung tidak perlu membuka email jika hanya butuh kodenya.
* **Empty State:** Ikon kotak masuk berongga dengan teks penjelasan yang ramah dan status live checking berdenyut.

### 🔑 3. Smart OTP Highlight Card
* Muncul di bagian teratas panel pembaca email jika terdeteksi kode verifikasi.
* Menyajikan kode dalam font monospaced besar dengan tombol salin instan.

### 🛡️ 4. Feature Highlights & Value Props
* 3 kartu benefit di bagian bawah:
  1. **Smart OTP Extractor** (Ikon Kunci Amber)
  2. **100% Privasi & Tanpa Login** (Ikon Perisai Cyan)
  3. **Serverless Edge Cloudflare** (Ikon Kilat Zamrud)
