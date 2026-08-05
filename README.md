# SmartGovMeeting PMTG 🚀
### Sistem Pengurusan Mesyuarat Pintar Kerajaan (Politeknik METrO Tasek Gelugor)

SmartGovMeeting PMTG ialah sebuah portal pengurusan mesyuarat jawatankuasa kerja rasmi sektor awam bersepadu. Sistem ini dibina khusus untuk merekayasa kitaran hayat mesyuarat (pra, semasa, dan pasca) di Politeknik METrO Tasek Gelugor (PMTG), Kementerian Pendidikan Tinggi, bagi membudayakan amalan pentadbiran tanpa kertas (*paperless office*) serta meningkatkan kecekapan tadbir urus jabatan.

---

## 🌟 Ciri-Ciri Utama Sistem

1. **Penjanaan Memo Pintar & Kod QR:** Penjanaan memo rasmi kerajaan mengikut format standard berserta kod QR pendaftaran kehadiran automatik.
2. **Pendaftaran Kehadiran Hibrid:** Menyokong penapisan IP fizikal rangkaian lokal pelayan (`10.141.3.73`) bagi Wi-Fi pejabat, dan integrasi terowong awan awam (*localtunnel*) bagi rangkaian mudah alih (4G/5G).
3. **Pangkalan Data Kakitangan & Import Kelompok:** Pengurusan maklumat 55 kakitangan PMTG dengan modul import data pukal terus daripada fail Excel (.xlsx, .xls) dan CSV menggunakan SheetJS.
4. **Penulisan Minit Bersegmen (27 Unit):** Membolehkan setiausaha mesyuarat merakam draf laporan pembentangan dan mengagihkan tugasan tindakan susulan pegawai mengikut unit spesifik.
5. **Kitaran Kelulusan Digital 4 Peringkat (Workflow Kunci Minit):**
   * **Draf** (Penyuntingan oleh Setiausaha)
   * **Selesai** (Draf sedia untuk disemak)
   * **Disemak** (Semakan oleh Penyemak Minit - Pn. Norhasaliza)
   * **Diluluskan** (Kelulusan Pengerusi - En. Mohd Yusaini) dengan kemasukan tandatangan digital automatik.
6. **Portal Cabutan Minit Interaktif:** Membolehkan pegawai tindakan susulan memberikan maklum balas secara dalam talian. Mengandungi paparan cetak PDF A4 pintar yang menyembunyikan kotak teks input semasa mencetak.
7. **Dashboard KPI Real-Time:** Analisis visual peratusan status komitmen tindakan unit/jabatan.
8. **Kertas Kerja Inovasi & Abstrak Bersepadu:** Menyediakan dokumentasi Laporan Inovasi 10 Halaman Lengkap dan Abstrak Dwi-Bahasa Akademik yang sedia dicetak dengan layout kemas.

---

## 🛠️ Pustaka Teknologi (Tech Stack)

* **Backend:** Node.js (Pure HTTP Server & Router)
* **Database:** Flat-File JSON Database (`db.json`)
* **Frontend:** HTML5, Vanilla CSS3 (Gaya Moden & Responsif), JavaScript (ES6+), Lucide Icons, Chart.js
* **Excel Parsing:** SheetJS (xlsx.mini.min.js)

---

## 🚀 Panduan Pemasangan & Menjalankan Pelayan

###Prasyarat
* Pasang **Node.js** (Versi 16 atau ke atas) pada PC pelayan.

### Langkah Menjalankan Pelayan
1. Muat turun atau clone repositori ini:
   ```bash
   git clone https://github.com/masterazrul2013-design/smartgovmeeting.git
   ```
2. Masuk ke folder projek:
   ```bash
   cd smartgovmeeting
   ```
3. Pasang dependensi (jika ada):
   ```bash
   npm install
   ```
4. Jalankan aplikasi:
   ```bash
   node server.js
   ```
5. Buka pelayar web dan layari port tempatan:
   * **`http://localhost:8092`**

---

## 🛜 Konfigurasi Rangkaian & Akses PC Lain (Local Network)

Agar portal ini boleh dicapai oleh PC atau telefon mudah alih lain di dalam rangkaian Wi-Fi/LAN pejabat yang sama (`http://10.141.3.73:8092/`), sila buka sekatan port pada Windows Defender Firewall anda:

1. Buka **PowerShell** sebagai **Administrator** (Run as Administrator).
2. Tampal arahan di bawah dan tekan **Enter**:
   ```powershell
   New-NetFirewallRule -DisplayName "SmartGovMeeting Port 8092" -Direction Inbound -LocalPort 8092 -Protocol TCP -Action Allow
   ```

---

## 👤 Pembangun Sistem & Kelayakan

* **Disediakan oleh:** Mohd Azrulnizam bin Mohd Kamarudin (Pembangun Sistem / Pegawai Teknologi Maklumat)
* **Jabatan:** Jabatan Sokongan Akademik, Politeknik METrO Tasek Gelugor
* **Kementerian:** Kementerian Pendidikan Tinggi
* **E-mel:** azrulnizam@pmtg.edu.my
* **Disahkan oleh:** En. Mohd Yusaini bin Mohamed Ali (Pengarah, Politeknik METrO Tasek Gelugor)
