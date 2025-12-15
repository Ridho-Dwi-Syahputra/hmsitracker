# 📋 Panduan Testing Fungsional DPA - HMSI Tracker

## ✅ Persiapan Selesai

Berikut adalah ringkasan yang telah dikerjakan:

### 1. ✅ Installation & Setup
- ✅ Playwright telah diinstall
- ✅ Browser drivers (Chromium, Firefox, WebKit) telah didownload
- ✅ Konfigurasi playwright sudah siap untuk multi-browser testing

### 2. ✅ Test Files yang Telah Dibuat

Semua 5 test file DPA telah dibuat dengan lengkap:

#### 📂 `tests/dpa/cari-proker.test.js`
**7 Test Cases:**
- ✅ Pencarian berdasarkan nama program kerja
- ✅ Pencarian tanpa hasil
- ✅ Filter berdasarkan status
- ✅ Filter berdasarkan divisi
- ✅ Kombinasi pencarian dan filter
- ✅ Reset filter
- ✅ Clear pencarian

#### 📂 `tests/dpa/edit-laporan-hasil-evaluasi.test.js`
**8 Test Cases:**
- ✅ Akses form evaluasi
- ✅ Evaluasi dengan status "Selesai"
- ✅ Evaluasi dengan status "Revisi"
- ✅ Validasi komentar tidak boleh kosong
- ✅ Validasi status harus dipilih
- ✅ Pembatalan evaluasi
- ✅ Melihat detail laporan
- ✅ Melihat riwayat evaluasi

#### 📂 `tests/dpa/lihat-detail-proker.test.js`
**8 Test Cases:**
- ✅ Akses halaman detail program kerja
- ✅ Tampilan informasi lengkap
- ✅ Melihat dokumen pendukung
- ✅ Ubah status menjadi "Selesai"
- ✅ Ubah status menjadi "Gagal"
- ✅ Validasi tidak bisa ubah status tanpa laporan
- ✅ Pembatalan perubahan status
- ✅ Tampilan target kuantitatif dan kualitatif

#### 📂 `tests/dpa/menambahkan-komentar.test.js`
**8 Test Cases:**
- ✅ Tambah komentar evaluasi
- ✅ Komentar muncul di detail laporan
- ✅ Input komentar panjang
- ✅ Validasi komentar tidak boleh kosong
- ✅ Komentar dengan format khusus
- ✅ Melihat kembali komentar yang sudah dibuat
- ✅ Komentar berbeda untuk status berbeda
- ✅ Fungsionalitas textarea

#### 📂 `tests/dpa/mengunduh-laporan-proker.test.js`
**9 Test Cases:**
- ✅ Download dokumentasi laporan
- ✅ Download dokumen pendukung proker
- ✅ Verifikasi format file PDF
- ✅ Download dari laporan belum dievaluasi
- ✅ Validasi link download
- ✅ Multiple downloads
- ✅ Tombol download visible dan clickable
- ✅ Pesan error jika file tidak ada
- ✅ **Compatibility testing di berbagai browser**

### 3. ✅ Helper File
- ✅ `tests/dpa/helpers/auth-helper.js` - Helper untuk login sebagai DPA

### 4. ✅ Error Fixes
- ✅ Fixed error di `example.spec.js` (import statement → require)

---

## 🚀 Cara Menjalankan Test

### Persiapan Sebelum Test

1. **Pastikan server aplikasi berjalan:**
   ```powershell
   npm run dev
   ```
   Server harus berjalan di `http://localhost:3000`

2. **Pastikan database sudah ada data:**
   - User DPA dengan email: `dpa@example.com` dan password: `12345`
   - Program kerja (minimal 1)
   - Laporan (minimal 1)
   
   **⚠️ PENTING:** Sesuaikan kredensial di `tests/dpa/helpers/auth-helper.js` jika berbeda!

### Menjalankan Test

#### 1. Jalankan SEMUA test DPA
```powershell
npx playwright test tests/dpa/
```

#### 2. Jalankan test SPESIFIK
```powershell
# Test Cari Proker
npx playwright test tests/dpa/cari-proker.test.js

# Test Edit Evaluasi
npx playwright test tests/dpa/edit-laporan-hasil-evaluasi.test.js

# Test Detail Proker
npx playwright test tests/dpa/lihat-detail-proker.test.js

# Test Komentar
npx playwright test tests/dpa/menambahkan-komentar.test.js

# Test Download
npx playwright test tests/dpa/mengunduh-laporan-proker.test.js
```

#### 3. Jalankan test dengan BROWSER SPESIFIK
```powershell
# Chrome saja
npx playwright test tests/dpa/ --project=chromium

# Firefox saja
npx playwright test tests/dpa/ --project=firefox

# Safari/WebKit saja
npx playwright test tests/dpa/ --project=webkit
```

#### 4. Jalankan test dengan UI MODE (Recommended untuk debugging)
```powershell
npx playwright test tests/dpa/ --ui
```

#### 5. Jalankan test dengan HEADED mode (melihat browser)
```powershell
npx playwright test tests/dpa/ --headed
```

#### 6. Jalankan test dengan DEBUG mode
```powershell
npx playwright test tests/dpa/ --debug
```

---

## 📊 Compatibility Testing (Multi-Browser)

Test sudah dikonfigurasi untuk berjalan di **3 browser** secara otomatis:
- ✅ **Chromium** (Chrome/Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)

Ketika Anda menjalankan:
```powershell
npx playwright test tests/dpa/
```

Test akan dijalankan di **SEMUA 3 browser** secara otomatis! 🎉

---

## 📈 Melihat Test Report

Setelah test selesai, buka HTML report:
```powershell
npx playwright show-report
```

Report akan menampilkan:
- ✅ Test yang berhasil
- ❌ Test yang gagal
- ⏱️ Durasi eksekusi
- 🖼️ Screenshot jika ada failure
- 📹 Video recording (jika diaktifkan)

---

## 🎯 Total Test Coverage

### Total Test Cases: **40 Test Cases**
- Cari Proker: 7 tests
- Edit Evaluasi: 8 tests
- Detail Proker: 8 tests
- Komentar: 8 tests
- Download: 9 tests

### Total Execution dengan 3 Browser: **120 Test Runs** 🚀
(40 tests × 3 browsers)

---

## 🔧 Troubleshooting

### Problem: Test gagal karena element tidak ditemukan
**Solusi:** 
- Pastikan aplikasi berjalan di `http://localhost:3000`
- Cek apakah selector di test sesuai dengan element di view
- Gunakan `--headed` mode untuk melihat apa yang terjadi

### Problem: Login gagal
**Solusi:**
- Cek kredensial di `tests/dpa/helpers/auth-helper.js`
- Pastikan user DPA ada di database
- Cek URL redirect setelah login

### Problem: Test timeout
**Solusi:**
- Tambahkan `timeout` di test yang butuh waktu lama
- Pastikan server tidak lambat
- Cek koneksi database

### Problem: Download test gagal
**Solusi:**
- Pastikan ada file yang bisa didownload di database
- Cek folder `public/uploads/` ada dan accessible

---

## 📝 Customization

### Mengubah Kredensial Login
Edit file: `tests/dpa/helpers/auth-helper.js`
```javascript
await page.fill('input[name="email"]', "email_dpa_anda@example.com");
await page.fill('input[name="password"]', "password_anda");
```

### Mengubah Base URL
Edit file: `playwright.config.js`
```javascript
use: {
  baseURL: 'http://localhost:3000', // Ubah jika beda port
}
```

### Menambahkan Browser Lain
Edit file: `playwright.config.js`
```javascript
projects: [
  // ... existing browsers
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
]
```

---

## 🎓 Best Practices yang Sudah Diterapkan

✅ **Modular Test Structure** - Setiap fitur punya file terpisah
✅ **Reusable Helper Functions** - Login helper untuk avoid duplikasi
✅ **Descriptive Test Names** - Nama test jelas dan deskriptif
✅ **Proper Waits** - Menggunakan `waitForSelector` dan `waitForTimeout`
✅ **Error Handling** - Try-catch untuk situasi optional
✅ **Console Logging** - Info penting di-log untuk debugging
✅ **Multi-Browser Support** - Kompatibilitas testing built-in
✅ **Comprehensive Coverage** - 40 test cases covering semua fitur DPA

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

---

## ✨ Next Steps

1. ✅ **Jalankan test pertama kali** untuk memastikan semua berjalan
2. ✅ **Review test results** dan perbaiki jika ada yang gagal
3. ✅ **Sesuaikan selector** jika ada yang perlu disesuaikan dengan view Anda
4. ✅ **Tambahkan test case lain** jika ada fitur tambahan
5. ✅ **Integrate dengan CI/CD** (optional) untuk automated testing

---

## 🎉 Selamat!

Test fungsional DPA sudah siap digunakan! 🚀

Semua file test sudah dibuat dengan lengkap dan siap untuk:
- ✅ Functional Testing
- ✅ Compatibility Testing (Multi-Browser)
- ✅ Regression Testing
- ✅ Integration Testing

**Good luck dengan testing Anda!** 💪

---

**Dibuat oleh:** GitHub Copilot
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}
**Versi Playwright:** 1.57.0
