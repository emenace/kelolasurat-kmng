# Aplikasi Layanan Kepegawaian - Kemenag Kota Metro

Sistem manajemen administrasi surat menyurat dan data kepegawaian internal untuk Kantor Kementerian Agama Kota Metro. Aplikasi ini dirancang untuk mempermudah pencatatan surat keluar, legalisir, serta pembuatan Surat Tugas secara otomatis dalam format PDF standar F4.

## 🚀 Fitur Utama

- **Dashboard Interaktif**: Tampilan modern dengan akses cepat ke seluruh layanan.
- **Manajemen Surat Keluar**: Pencatatan nomor urut, tanggal, asal, tujuan, dan perihal surat secara terorganisir.
- **Manajemen Legalisir**: Registrasi data legalisir dokumen dengan pencarian cepat.
- **Data Pegawai**: Database pegawai yang terintegrasi (NIP, Nama, Pangkat, Golongan, Jabatan) untuk mempermudah pengisian form.
- **Generate Surat Tugas**: 
    - Input data kegiatan dan dasar surat.
    - Autocomplete data pegawai langsung dari database.
    - Export dokumen otomatis ke PDF dengan layout resmi (Kop Surat, QR Code, dan Stempel Digital).
    - Format kertas standar F4 (8.5" x 13").
- **Ekspor Data**: Mendukung ekspor tabel ke format PDF dan Excel (XLSX) melalui antarmuka web.

## 🛠️ Teknologi yang Digunakan

- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [SQLite3](https://www.sqlite.org/index.html) (Local Database)
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6)
- **Library Utama**:
    - [Tabulator.js](http://tabulator.info/): Untuk manajemen tabel data yang responsif.
    - [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/): Untuk konversi layout HTML ke PDF.
    - [Bootstrap 5](https://getbootstrap.com/): Untuk desain UI yang bersih dan responsif.
    - [SheetJS](https://sheetjs.com/): Untuk fitur ekspor Excel.

## 📁 Struktur Direktori

Proyek ini menggunakan struktur modular untuk mempermudah pemeliharaan:

```text
├── database/           # Manajemen Database
│   ├── data/           # File fisik .sqlite
│   └── logic/          # Konfigurasi & koneksi database (Node.js)
├── public/             # File statis (Frontend)
│   ├── assets/         # Gambar (logo, stempel, qr) & font
│   ├── data-pegawai/   # Modul Data Pegawai
│   ├── legalisir/      # Modul Legalisir
│   ├── surat-keluar/   # Modul Surat Keluar
│   ├── surat-tugas/    # Modul Pembuatan Surat Tugas
│   ├── index.html      # Halaman Utama (Dashboard)
│   └── style.css       # Styling global
├── server.js           # Entry point aplikasi (Express Server)
└── package.json        # Dependensi proyek
```

## ⚙️ Cara Instalasi & Menjalankan

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/emenace/kelolasurat-kmng.git
   cd kelolasurat-kmng
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**:
   - Mode Produksi:
     ```bash
     node server.js
     ```
   - Mode Pengembangan (dengan auto-restart):
     ```bash
     npm run dev
     ```

4. **Akses di Browser**:
   Buka alamat `http://localhost:3000` pada web browser Anda.

## 📝 Lisensi

Proyek ini dikembangkan khusus untuk lingkungan internal Kantor Kementerian Agama Kota Metro.
