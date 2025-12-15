# 🗄️ Setup Data untuk Testing DPA

## Persiapan Database

Sebelum menjalankan test, pastikan database memiliki data yang diperlukan.

## 1. User DPA

Buat user DPA dengan kredensial berikut di database:

```sql
-- Contoh insert user DPA
INSERT INTO User (id_anggota, email, password, nama, role, id_divisi) 
VALUES (
  UUID(),
  'dpa@example.com',
  -- Hash untuk password '12345' menggunakan bcrypt
  '$2a$10$YourHashedPasswordHere',
  'DPA Testing User',
  'DPA',
  NULL
);
```

**PENTING:** Jika email atau password berbeda, update file `tests/dpa/helpers/auth-helper.js`

## 2. Program Kerja (Minimal 3-5 untuk testing)

```sql
-- Contoh insert program kerja dengan berbagai status
INSERT INTO Program_kerja (
  id_ProgramKerja, 
  Nama_ProgramKerja, 
  Deskripsi, 
  Tanggal_mulai, 
  Tanggal_selesai, 
  Penanggung_jawab,
  Status,
  Target_Kuantitatif,
  Target_Kualitatif,
  Dokumen_pendukung,
  id_anggota
) VALUES 
(
  UUID(),
  'Webinar Teknologi Terkini',
  'Webinar tentang perkembangan teknologi',
  '2024-01-15',
  '2024-01-20',
  'John Doe',
  'Belum Dimulai',
  '100 peserta',
  'Meningkatkan pengetahuan teknologi mahasiswa',
  'proposal.pdf',
  'id_anggota_hmsi'
),
(
  UUID(),
  'Kegiatan Bakti Sosial',
  'Program bakti sosial untuk masyarakat',
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  DATE_ADD(NOW(), INTERVAL 5 DAY),
  'Jane Smith',
  'Sedang Berjalan',
  '50 relawan',
  'Membantu masyarakat sekitar',
  NULL,
  'id_anggota_hmsi'
),
(
  UUID(),
  'Workshop Programming',
  'Workshop dasar-dasar programming',
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 25 DAY),
  'Bob Johnson',
  'Selesai',
  '30 peserta',
  'Peserta mampu membuat program sederhana',
  'workshop-doc.pdf',
  'id_anggota_hmsi'
);
```

## 3. Laporan (Minimal 3-5 untuk testing)

```sql
-- Contoh insert laporan
INSERT INTO Laporan (
  id_laporan,
  judul_laporan,
  tanggal,
  deskripsi_laporan,
  dokumentasi,
  realisasi_kuantitatif,
  realisasi_kualitatif,
  total_anggaran,
  total_pengeluaran,
  id_ProgramKerja,
  id_divisi
) VALUES
(
  UUID(),
  'Laporan Webinar Teknologi',
  '2024-01-21',
  'Laporan pelaksanaan webinar',
  'laporan-webinar.pdf',
  '120 peserta hadir',
  'Feedback positif dari 95% peserta',
  5000000,
  4800000,
  'id_proker_webinar',
  'id_divisi'
),
(
  UUID(),
  'Laporan Bakti Sosial',
  NOW(),
  'Laporan kegiatan bakti sosial',
  'baksos-doc.pdf',
  '55 relawan berpartisipasi',
  'Membantu 100 keluarga',
  3000000,
  2900000,
  'id_proker_baksos',
  'id_divisi'
);
```

## 4. Evaluasi (Untuk testing laporan yang sudah dievaluasi)

```sql
-- Contoh insert evaluasi
INSERT INTO Evaluasi (
  id_evaluasi,
  id_laporan,
  pemberi_evaluasi,
  komentar,
  status_konfirmasi,
  tanggal_evaluasi,
  komentar_hmsi
) VALUES
(
  UUID(),
  'id_laporan_webinar',
  'id_user_dpa',
  'Laporan sudah sangat baik dan lengkap. Dokumentasi jelas dan sesuai dengan standar.',
  'Selesai',
  NOW(),
  NULL
),
(
  UUID(),
  'id_laporan_workshop',
  'id_user_dpa',
  'Laporan perlu diperbaiki pada bagian dokumentasi foto. Mohon tambahkan foto kegiatan.',
  'Revisi',
  NOW(),
  'Terima kasih atas masukannya. Kami akan segera melengkapi dokumentasi.'
);
```

## 5. Divisi (Untuk filter testing)

```sql
-- Contoh insert divisi
INSERT INTO Divisi (id_divisi, nama_divisi) VALUES
('DIV001', 'Pengembangan Teknologi'),
('DIV002', 'Sosial dan Kemasyarakatan'),
('DIV003', 'Pendidikan dan Pelatihan'),
('DIV004', 'Keuangan');
```

## 6. File Upload (Untuk testing download)

Pastikan folder berikut ada dan berisi file sample:

```
public/uploads/
├── proker/
│   ├── proposal.pdf
│   └── workshop-doc.pdf
└── laporan/
    ├── laporan-webinar.pdf
    └── baksos-doc.pdf
```

### Membuat Sample PDF untuk Testing

Jika tidak ada file PDF, buat file dummy:

**Windows PowerShell:**
```powershell
# Buat folder jika belum ada
New-Item -ItemType Directory -Force -Path "public/uploads/proker"
New-Item -ItemType Directory -Force -Path "public/uploads/laporan"

# Buat file dummy
"Sample PDF Content for Testing" | Out-File -FilePath "public/uploads/proker/proposal.pdf"
"Sample PDF Content for Testing" | Out-File -FilePath "public/uploads/laporan/laporan-webinar.pdf"
```

## Checklist Sebelum Testing

- [ ] User DPA sudah dibuat dengan email: `dpa@example.com`
- [ ] Password user DPA: `12345` (atau sesuaikan di auth-helper.js)
- [ ] Ada minimal 3 program kerja dengan status berbeda
- [ ] Ada minimal 3 laporan
- [ ] Ada minimal 1 evaluasi dengan status "Selesai"
- [ ] Ada minimal 1 evaluasi dengan status "Revisi"
- [ ] Folder `public/uploads/` ada dan berisi sample files
- [ ] Server aplikasi berjalan di `http://localhost:3000`
- [ ] Database connection aktif

## Script SQL Lengkap (All-in-One)

Simpan dan jalankan script ini untuk setup data testing lengkap:

```sql
-- File: setup_test_data.sql
-- Jalankan dengan: mysql -u root -p hmsi_tracker < setup_test_data.sql

USE hmsi_tracker;

-- 1. Buat user DPA
INSERT INTO User (id_anggota, email, password, nama, role, id_divisi) 
VALUES (
  'DPA-TEST-001',
  'dpa@example.com',
  '$2a$10$YourHashedPasswordHere', -- Ganti dengan hash password '12345'
  'DPA Testing User',
  'DPA',
  NULL
) ON DUPLICATE KEY UPDATE email=email;

-- 2. Buat divisi
INSERT INTO Divisi (id_divisi, nama_divisi) VALUES
('DIV001', 'Pengembangan Teknologi'),
('DIV002', 'Sosial dan Kemasyarakatan'),
('DIV003', 'Pendidikan dan Pelatihan')
ON DUPLICATE KEY UPDATE nama_divisi=nama_divisi;

-- 3. Buat program kerja
-- (Sesuaikan dengan struktur tabel Anda)

-- 4. Buat laporan
-- (Sesuaikan dengan struktur tabel Anda)

-- 5. Buat evaluasi
-- (Sesuaikan dengan struktur tabel Anda)
```

## Verifikasi Data

Setelah setup, verifikasi data dengan query berikut:

```sql
-- Cek user DPA
SELECT * FROM User WHERE email = 'dpa@example.com';

-- Cek jumlah program kerja
SELECT COUNT(*) as total_proker FROM Program_kerja;

-- Cek jumlah laporan
SELECT COUNT(*) as total_laporan FROM Laporan;

-- Cek jumlah evaluasi
SELECT COUNT(*) as total_evaluasi FROM Evaluasi;

-- Cek program kerja berdasarkan status
SELECT Status, COUNT(*) as jumlah 
FROM Program_kerja 
GROUP BY Status;
```

## Troubleshooting Data

### Problem: User tidak bisa login
```sql
-- Cek password hash
SELECT email, password FROM User WHERE email = 'dpa@example.com';

-- Update password (ganti dengan hash yang benar)
UPDATE User 
SET password = '$2a$10$YourHashedPasswordHere' 
WHERE email = 'dpa@example.com';
```

### Problem: Tidak ada data untuk ditest
```sql
-- Cek apakah ada foreign key constraint
SHOW CREATE TABLE Laporan;
SHOW CREATE TABLE Evaluasi;

-- Pastikan id_ProgramKerja, id_divisi, dll valid
```

---

**Setelah data siap, jalankan test dengan:**
```powershell
npx playwright test tests/dpa/ --headed
```

Happy Testing! 🚀
