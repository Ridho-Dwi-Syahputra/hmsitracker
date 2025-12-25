# 🎯 Quick Start - Testing DPA

## ⚡ TL;DR

```powershell
# 1. Pastikan server berjalan
npm run dev

# 2. Jalankan semua test DPA di 3 browser
npx playwright test tests/dpa/

# 3. Lihat report
npx playwright show-report
```

## 📁 Test Files

| File | Test Cases | Deskripsi |
|------|-----------|-----------|
| `cari-proker.test.js` | 7 | Pencarian & filter program kerja |
| `edit-laporan-hasil-evaluasi.test.js` | 8 | Form evaluasi laporan |
| `lihat-detail-proker.test.js` | 8 | Detail & update status proker |
| `menambahkan-komentar.test.js` | 8 | Input komentar evaluasi |
| `mengunduh-laporan-proker.test.js` | 9 | Download dokumentasi |

**Total:** 40 test cases × 3 browsers = **120 test runs** 🚀

## 🌐 Browser Support

✅ Chromium (Chrome/Edge)
✅ Firefox
✅ WebKit (Safari)

## 🔑 Kredensial Default

Edit di `tests/dpa/helpers/auth-helper.js` jika berbeda:
- Email: `dpa@example.com`
- Password: `12345`

## 📚 Dokumentasi Lengkap

- [PANDUAN_TESTING_DPA.md](./PANDUAN_TESTING_DPA.md) - Panduan lengkap testing
- [SETUP_DATA_TESTING.md](./SETUP_DATA_TESTING.md) - Setup data untuk testing

## 🚀 Commands Penting

```powershell
# Test semua file
npx playwright test tests/dpa/

# Test file spesifik
npx playwright test tests/dpa/cari-proker.test.js

# Test di browser spesifik
npx playwright test tests/dpa/ --project=chromium

# Mode UI (recommended)
npx playwright test tests/dpa/ --ui

# Mode headed (lihat browser)
npx playwright test tests/dpa/ --headed

# Debug mode
npx playwright test tests/dpa/ --debug

# Show report
npx playwright show-report
```

## ✅ Checklist Sebelum Test

- [ ] Server running di `http://localhost:3000`
- [ ] User DPA ada di database
- [ ] Ada data: Program Kerja, Laporan
- [ ] File upload tersedia di `public/uploads/`

## 🎉 Status

✅ Playwright installed
✅ Browsers downloaded
✅ 5 test files created (40 test cases)
✅ Helper functions ready
✅ Multi-browser support configured
✅ Documentation complete

**Ready to test!** 🚀
