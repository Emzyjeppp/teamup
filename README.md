# 🤝 TeamUp — Random Group & Task Generator

> Bagi kelompok dan tugas secara acak — cepat, adil, dan seru!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**TeamUp** adalah aplikasi web interaktif untuk membagi daftar nama mahasiswa ke dalam kelompok tugas atau menugaskan peran tertentu secara acak, lengkap dengan animasi pengacakan dramatis, confetti, dan desain premium. 

---

## ✨ Fitur Utama

### 🧠 Smart Parser — Paste Format Apa Pun!
Tidak perlu repot memformat ulang daftar nama. TeamUp secara otomatis mendeteksi **7 format input**:
- **Per baris** (`Ahmad↵Budi↵Citra`)
- **Koma** (`Ahmad, Budi, Citra`)
- **Titik koma** (`Ahmad; Budi; Citra`)
- **Tab** (`Ahmad⇥Budi⇥Citra`)
- **Numbered list** (`1. Ahmad  2. Budi`)
- **Bullet list** (`- Ahmad  • Budi`)
- **CamelCase nempel** (`AhmadBudiCitraDewi`)

### ⚡ Smart Context Import (New in v1.1.0)
Jika Anda memiliki daftar tugas dengan jumlah slot orang yang sudah terencana (misal: Kerja Bakti atau Masak-Masak), Anda cukup menempelkan (*paste*) teks konteks tersebut. TeamUp akan **otomatis mendeteksi, menawarkan impor, dan mengisi form Custom Mode secara instan!**
- Mengambil **Nama Kegiatan** (e.g. `Kerja Bakti`)
- Mengambil **Nama Tugas & Jumlah Slot** (e.g. `Membeli Barang (2 orang)`)
- Mengambil **Daftar Anggota** yang tertera inline dalam tanda kurung maupun baris di bawahnya.

### 🎲 Animasi Shuffle Dramatis
- Kartu nama muncul satu per satu.
- Animasi **shuffle** (bergetar acak) selama beberapa detik.
- Kartu diwarnai sesuai kelompok/tugas yang didapat.
- **🎉 Confetti explosion** saat hasil diumumkan!

### 📋 Export Hasil
- **Salin** ke clipboard dengan format yang rapi dan indah.
- **Download** sebagai file `.txt`.
- **Acak ulang** jika belum puas dengan pembagiannya.

### 🎨 Desain Premium (HIG-Compliant)
- Dark mode dengan efek **glassmorphism** yang mewah.
- Background dengan animated gradient orbs.
- Micro-animations pada tombol hover, focus, dan klik.
- Dibangun mengikuti prinsip **Human Interface Guidelines (HIG)**:
  - **Hierarchy** — Skala tipografi 6 level, 4 level shadow elevation.
  - **Harmony** — Spacing strict kelipatan 4px/8px, natural easing.
  - **Consistency** — Semua nilai di-tokenisasi sebagai CSS Custom Properties.

---

## 🚀 Cara Pakai

### Mode Simple (Kelompok Biasa)
1. **Pilih mode Simple** di bagian atas.
2. **Paste** daftar nama pada textarea.
3. **Pilih** jumlah anggota per kelompok (2-7 orang).
4. **Klik** tombol **"🎲 Acak Kelompok!"**.

### Mode Custom Task (Pembagian Peran/Tugas)
1. **Pilih mode Custom Task** di bagian atas.
2. **Masukkan Nama Kegiatan** (opsional) dan **Daftar Tugas** beserta kapasitas slotnya (misal: *Memasak [3 orang]*, *Mencuci [2 orang]*).
3. **Paste** daftar nama sejumlah total slot tugas.
4. **Klik** tombol **"🎲 Acak Tugas!"**.
5. *Atau*, cukup **paste teks pembagian tugas Anda** di textarea nama untuk memicu **Smart Context Import** secara otomatis!

> 💡 **Shortcut**: Tekan `Ctrl + Enter` di textarea untuk langsung mengacak.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Structure | HTML5 Semantic |
| Styling | Vanilla CSS (Custom Properties, Glassmorphism, Keyframe Animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Font | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |
| Icons | Inline SVG (Lucide) |
| Framework | ❌ Tanpa framework — murni vanilla |

---

## 📄 Lisensi

MIT License — Bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Made with ❤️ for Indonesian students
</p>
