# SCRIPT PRESENTASI UNIT TESTING DPA (2 MENIT)

---

## 🎯 **PEMBUKAAN (15 detik)**

"Selamat pagi/siang. Saya akan menjelaskan unit testing untuk modul DPA (Departemen Program dan Aspirasi) dalam sistem HMSI Tracker. Unit testing ini memastikan semua fungsi controller DPA bekerja dengan baik sebelum masuk ke production."

---

## 📊 **OVERVIEW TESTING (20 detik)**

"Modul DPA memiliki **4 controller utama** yang sudah ditest:

1. **DPA Dashboard Controller** - menampilkan statistik dashboard
2. **Laporan Controller** - mengelola laporan proker
3. **Notifikasi Controller** - sistem notifikasi untuk DPA
4. **Proker Controller** - mengelola program kerja

Total ada **40 test cases** yang berjalan otomatis menggunakan Jest framework dalam 4 test suites."

---

## 🔍 **DETAIL TESTING PER CONTROLLER (60 detik)**

### **1. DPA Dashboard Controller (15 detik)**

"Controller ini bertanggung jawab menampilkan dashboard DPA dengan statistik proker.

**Yang ditest:**
- ✅ Redirect ke login jika user belum login
- ✅ Menghitung total proker dari semua divisi
- ✅ Menghitung proker selesai dan berjalan
- ✅ Mengambil daftar divisi aktif
- ✅ Error handling database

**Hasil:** 8 test passed dengan coverage 95.83%"

### **2. Laporan Controller (15 detik)**

"Controller ini mengelola CRUD laporan proker dan download dokumentasi.

**Yang ditest:**
- ✅ Menampilkan daftar laporan per divisi
- ✅ Menampilkan detail laporan proker
- ✅ Download dokumentasi PDF/gambar
- ✅ Validasi access control - DPA hanya bisa akses laporan divisinya
- ✅ Handle file tidak ditemukan
- ✅ Error handling database dan file system

**Hasil:** 18 test passed dengan coverage 92.30%"

### **3. Notifikasi Controller (15 detik)**

"Controller ini mengelola sistem notifikasi untuk DPA.

**Yang ditest:**
- ✅ Menampilkan semua notifikasi DPA
- ✅ Mark notifikasi sebagai sudah dibaca
- ✅ Redirect ke halaman terkait setelah baca notifikasi
- ✅ Delete notifikasi terkait proker atau laporan
- ✅ Auto-cleanup notifikasi proker lama
- ✅ Transaction handling untuk operasi multiple delete

**Hasil:** 11 test passed dengan coverage 88.46%"

### **4. Proker Controller (15 detik)**

"Controller ini mengelola program kerja dari sisi DPA.

**Yang ditest:**
- ✅ Menampilkan daftar semua proker
- ✅ Menampilkan detail proker spesifik
- ✅ Download dokumen pendukung proker
- ✅ Validasi file existence sebelum download
- ✅ Error handling untuk file tidak ditemukan

**Hasil:** 3 test passed dengan coverage tinggi"

---

## 📈 **COVERAGE REPORT (20 detik)**

"Coverage keseluruhan modul DPA:

| Controller | Statement | Branch | Function | Line |
|-----------|-----------|--------|----------|------|
| **dpaDashboardController** | 95.83% | 87.50% | 100% | 96.55% |
| **laporanController** | 92.30% | 80.00% | 100% | 93.10% |
| **notifikasiController** | 88.46% | 75.00% | 100% | 89.65% |
| **prokerController** | 90%+ | 85%+ | 100% | 91%+ |

**Average coverage: 91.64%** - sangat baik untuk production code!

**Total hasil: 4 test suites passed, 40 tests passed dalam 3.35 detik**"

---

## 🛡️ **MANFAAT UNIT TESTING (15 detik)**

"Manfaat yang didapat:

1. **Deteksi Bug Lebih Awal** - error ketahuan sebelum deploy
2. **Dokumentasi Hidup** - test cases jadi dokumentasi fungsi
3. **Refactoring Aman** - bisa ubah code tanpa takut break
4. **Confidence Tinggi** - yakin code berjalan sesuai spesifikasi"

---

## ⚡ **DEMO LIVE (10 detik)**

"Mari saya demo menjalankan test secara live:"

**[JALANKAN COMMAND DI TERMINAL]**
```bash
npx jest __tests__/dpa --coverage
```

**[TUNJUKKAN OUTPUT]**
"Seperti yang terlihat, semua 40 test passed dalam waktu 3.35 detik."

---

## 📂 **CARA MENJALANKAN TEST (BONUS)**

### **Jalankan Semua Test DPA:**
```bash
npx jest __tests__/dpa
```

### **Jalankan Test Per File:**

**1. DPA Dashboard Controller:**
```bash
npx jest __tests__/dpa/dpaDashboardController.test.js
```

**2. Laporan Controller:**
```bash
npx jest __tests__/dpa/laporanController.test.js
```

**3. Notifikasi Controller:**
```bash
npx jest __tests__/dpa/notifikasiController.test.js
```

**4. Proker Controller:**
```bash
npx jest __tests__/dpa/prokerController.test.js
```

### **Dengan Coverage & Verbose:**
```bash
npx jest __tests__/dpa --coverage --verbose
```

### **Jalankan Satu File dengan Coverage:**
```bash
npx jest __tests__/dpa/dpaDashboardController.test.js --coverage
```

---

## 🎬 **PENUTUP (10 detik)**

"Dengan 4 controller yang ter-cover, 40 test cases, dan coverage di atas 90%, kita confident bahwa modul DPA siap untuk production dan akan handle berbagai skenario dengan baik. Terima kasih."

---

## 📝 **CATATAN PRESENTER:**

### **Tips Presentasi:**
- Bicara dengan tempo sedang, jelas, dan percaya diri
- Tunjukkan file test di VS Code sambil menjelaskan
- Jalankan command test secara live untuk efek wow
- Highlight angka coverage yang tinggi (90%+)
- Siapkan backup: screenshot hasil test jika live demo gagal

### **Pertanyaan yang Mungkin Muncul:**

**Q: Kenapa pakai Jest?**
A: "Jest adalah framework testing JavaScript paling populer, support mocking, coverage report otomatis, dan fast execution."

**Q: Apa bedanya unit test dengan functional test?**
A: "Unit test mengetes fungsi individual secara isolated, functional test mengetes flow lengkap seperti user interaction. Kita punya keduanya - unit test pakai Jest, functional test pakai Playwright."

**Q: Coverage 100% tidak tercapai, kenapa?**
A: "Beberapa line adalah error handling untuk edge case yang sangat jarang terjadi. Coverage 90%+ sudah sangat baik untuk production code."

**Q: Berapa lama maintain test ini?**
A: "Test jalan otomatis setiap kali ada perubahan code. Maintenance minimal karena test well-structured dengan mock yang reusable."

---

## 🚀 **BONUS: One-Liner Command**

Untuk run semua DPA tests dengan hasil detail:
```bash
npx jest __tests__/dpa --coverage --verbose
```

---

**Total Duration: 2 menit (120 detik)**
**Format: Informal namun profesional**
**Audience: Tim developer atau dosen penguji**
