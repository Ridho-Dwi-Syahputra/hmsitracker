# PETUNJUK PERBAIKAN TEST DPA

## Masalah yang Ditemukan

Semua test file (kecuali `cari-proker.test.js`) menggunakan selector yang salah:
- ❌ `.laporan-card` - TIDAK ADA di HTML
- ❌ `.proker-card` - TIDAK ADA di HTML

Halaman DPA menggunakan **TABLE** bukan CARDS!

## Selector yang Benar

### 1. Halaman Kelola Laporan (`kelolaLaporan.ejs`)
```javascript
// SALAH
await page.waitForSelector(".laporan-card");
const laporanCards = page.locator(".laporan-card");

// BENAR
await page.waitForSelector("#laporanTable tr, .empty-state");
const laporanRows = page.locator("#laporanTable tr");
```

### 2. Halaman Lihat Proker (`lihatProker.ejs`)
```javascript
// SALAH
await page.waitForSelector(".proker-card");
const prokerCards = page.locator(".proker-card");

// BENAR  
await page.waitForSelector("tbody tr, .empty-state");
const prokerRows = page.locator("tbody tr");
```

### 3. Halaman Laporan Diterima (`laporanDiterima.ejs`)
```javascript
// SALAH
await page.waitForSelector(".laporan-card");
const laporanCards = page.locator(".laporan-card");

// BENAR
await page.waitForSelector("tbody tr, .empty-state");
const laporanRows = page.locator("tbody tr");
```

## File yang Perlu Diperbaiki

1. ✅ **cari-proker.test.js** - SUDAH BENAR (7/7 passed)
2. ❌ **edit-laporan-hasil-evaluasi.test.js** - Ganti `.laporan-card` → `#laporanTable tr`
3. ❌ **lihat-detail-proker.test.js** - Ganti `.proker-card` → `tbody tr`
4. ❌ **menambahkan-komentar.test.js** - Ganti `.laporan-card` → `#laporanTable tr` atau `tbody tr`
5. ❌ **mengunduh-laporan-proker.test.js** - Ganti `.laporan-card`/`.proker-card` → `tbody tr`

## Template Perbaikan

### Pattern Find & Replace

**FIND (di semua file):**
```javascript
await page.waitForSelector(".laporan-card, .empty-state", { timeout: 10000 });
const laporanCards = page.locator(".laporan-card");
const count = await laporanCards.count();
```

**REPLACE WITH:**
```javascript
await page.waitForLoadState('networkidle');
await page.waitForSelector("#laporanTable tr, tbody tr, .empty-state", { timeout: 10000 });
const laporanRows = page.locator("#laporanTable tr, tbody tr");
const count = await laporanRows.count();
```

## Contoh Perbaikan Lengkap

```javascript
// SEBELUM
test("DPA dapat mengakses form evaluasi dari daftar laporan", async ({ page }) => {
  await page.goto("http://localhost:3000/dpa/kelolaLaporan");
  await page.waitForSelector(".laporan-card, .empty-state", { timeout: 10000 });
  
  const laporanCards = page.locator(".laporan-card");
  const count = await laporanCards.count();
  
  if (count > 0) {
    const evaluasiBtn = laporanCards.first().locator('a:has-text("Evaluasi")');
    await evaluasiBtn.click();
  }
});

// SESUDAH
test("DPA dapat mengakses form evaluasi dari daftar laporan", async ({ page }) => {
  await page.goto("http://localhost:3000/dpa/kelolaLaporan");
  await page.waitForLoadState('networkidle');
  await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });
  
  const laporanRows = page.locator("#laporanTable tr");
  const count = await laporanRows.count();
  
  if (count > 0) {
    const evaluasiBtn = laporanRows.first().locator('a:has-text("Evaluasi")');
    await evaluasiBtn.click();
  }
});
```

## Langkah Selanjutnya

1. Buka setiap file test satu per satu
2. Find & Replace semua occurrence dari:
   - `.laporan-card` → `#laporanTable tr` atau `tbody tr`
   - `.proker-card` → `tbody tr`
   - `laporanCards` → `laporanRows`
   - `prokerCards` → `prokerRows`
3. Tambahkan `await page.waitForLoadState('networkidle');` setelah `goto()`
4. Test ulang setelah semua diperbaiki

## Helper Function Tersedia

Sudah ditambahkan ke `auth-helper.js`:
```javascript
const { loginAsDPA, waitForTableOrEmpty } = require("./helpers/auth-helper");

// Gunakan:
await waitForTableOrEmpty(page, '#laporanTable tr');
```
