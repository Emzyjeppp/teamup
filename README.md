# 🤝 TeamUp — Random Group Generator

> Bagi kelompok tugas secara acak — cepat, adil, dan seru!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**TeamUp** adalah aplikasi web interaktif untuk membagi daftar nama mahasiswa ke dalam kelompok tugas secara acak, dengan animasi pengacakan dramatis dan desain premium. Dibuat khusus untuk dosen, ketua kelas, atau siapa pun yang perlu membagi kelompok dengan cepat dan adil.

---

## ✨ Fitur Utama

### 🧠 Smart Parser — Paste Format Apa Pun!
Tidak perlu repot memformat ulang daftar nama. TeamUp secara otomatis mendeteksi **7 format input**:

| Format | Contoh |
|--------|--------|
| Per baris | `Ahmad↵Budi↵Citra` |
| Koma | `Ahmad, Budi, Citra` |
| Titik koma | `Ahmad; Budi; Citra` |
| Tab | `Ahmad⇥Budi⇥Citra` |
| Numbered list | `1. Ahmad, 2. Budi` |
| Bullet list | `- Ahmad, • Budi` |
| CamelCase nempel | `AhmadBudiCitraDewi` |

### 🎲 Animasi Shuffle Dramatis
- Kartu nama muncul satu per satu
- Animasi **shuffle** (bergetar acak) selama beberapa detik
- Kartu diwarnai sesuai kelompok
- **🎉 Confetti explosion** saat hasil diumumkan!

### 📋 Export Hasil
- **Salin** ke clipboard dengan satu klik
- **Download** sebagai file `.txt`
- **Acak ulang** jika belum puas dengan hasilnya

### 🎨 Desain Premium
- Dark mode dengan efek **glassmorphism**
- Animated gradient orbs di background
- Micro-animations di semua elemen interaktif
- Dibangun mengikuti prinsip **Human Interface Guidelines (HIG)**:
  - **Hierarchy** — Skala tipografi 6 level, 4 level shadow elevation
  - **Harmony** — Spacing strict kelipatan 4px/8px, natural easing
  - **Consistency** — Semua nilai di-tokenisasi sebagai CSS Custom Properties

---

## 🚀 Cara Pakai

1. **Buka** `index.html` di browser
2. **Paste** daftar nama (format apa pun!)
3. **Pilih** jumlah anggota per kelompok (2-7)
4. **Klik** tombol **"🎲 Acak Kelompok!"**
5. **Nikmati** animasinya dan lihat hasilnya!

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

## 📁 Struktur File

```
teamup/
├── index.html    # Halaman utama
├── style.css     # Design system (HIG-compliant)
├── app.js        # Logic, animasi, parser, confetti
└── README.md     # Dokumentasi
```

---

## 📸 Screenshot

<p align="center">
  <em>Dark mode premium dengan glassmorphism & gradient orbs</em>
</p>

---

## 📄 Lisensi

MIT License — Bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Made with ❤️ for Indonesian students
</p>
