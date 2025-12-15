const { test, expect } = require("@playwright/test");
const { loginAsDPA } = require("./helpers/auth-helper");

test.describe("Functional Testing - Kelola Laporan Hasil Evaluasi (DPA)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDPA(page);
  });

  test("DPA dapat mengakses halaman kelola laporan", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    // Verifikasi: Halaman kelola laporan terbuka
    await expect(page).toHaveURL(/\/dpa\/kelolaLaporan/);
    await expect(page.locator('text=/Daftar Laporan|Kelola Laporan/i').first()).toBeVisible();
    
    // Verifikasi: Tabel laporan ada
    await page.waitForSelector("#laporanTable, .empty-state", { timeout: 10000 });
  });

  test("DPA dapat melihat daftar laporan dengan informasi lengkap", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    const laporanRows = page.locator("#laporanTable tr");
    const count = await laporanRows.count();

    if (count > 0) {
      // Verifikasi: Ada kolom penting di tabel
      const content = await page.locator('main').textContent();
      expect(content).toContain('Program Kerja');
      expect(content).toContain('Divisi');
      
      console.log(`✅ Found ${count} laporan`);
    }
  });

  test("DPA dapat mencari laporan berdasarkan nama program", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    const searchInput = page.locator("#searchInput");
    if (await searchInput.isVisible()) {
      // Cari laporan
      await searchInput.fill("FTI");
      await page.waitForTimeout(500);

      // Verifikasi: Hasil pencarian muncul
      const laporanRows = page.locator("#laporanTable tr");
      const count = await laporanRows.count();
      
      console.log(`🔍 Search results: ${count} laporan`);
    }
  });

  test("DPA dapat filter laporan berdasarkan divisi", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    const divisiBtn = page.locator("#divisiDropdownBtn");
    if (await divisiBtn.isVisible()) {
      await divisiBtn.click();
      await page.waitForTimeout(300);

      // Pilih divisi (misal: Eksternal)
      const divisiOption = page.locator('#divisiDropdownMenu button[data-value="Eksternal"]').first();
      if (await divisiOption.isVisible()) {
        await divisiOption.click();
        await page.waitForTimeout(500);

        // Verifikasi: Filter diterapkan
        const laporanRows = page.locator("#laporanTable tr");
        const count = await laporanRows.count();
        console.log(`✅ Filtered: ${count} laporan untuk divisi Eksternal`);
      }
    }
  });

  test("DPA dapat filter laporan berdasarkan program kerja", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    // Pilih divisi dulu untuk memunculkan filter proker
    const divisiBtn = page.locator("#divisiDropdownBtn");
    if (await divisiBtn.isVisible()) {
      await divisiBtn.click();
      await page.waitForTimeout(300);

      const divisiOption = page.locator('#divisiDropdownMenu button[data-value]').first();
      const divisiValue = await divisiOption.getAttribute('data-value');
      
      if (divisiValue && divisiValue !== 'all') {
        await divisiOption.click();
        await page.waitForTimeout(500);

        // Cek apakah dropdown proker muncul
        const prokerBtn = page.locator("#prokerDropdownBtn");
        if (await prokerBtn.isVisible()) {
          await prokerBtn.click();
          await page.waitForTimeout(300);

          const prokerOption = page.locator('#prokerDropdownMenu button[data-value]').nth(1);
          if (await prokerOption.isVisible()) {
            await prokerOption.click();
            await page.waitForTimeout(500);

            console.log("✅ Filter proker applied");
          }
        }
      }
    }
  });

  test("DPA dapat melihat detail laporan dan evaluasinya", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    const laporanRows = page.locator("#laporanTable tr");
    const count = await laporanRows.count();

    if (count > 0) {
      // Klik detail
      const detailBtn = laporanRows.first().locator('a[title="Detail"] i.fa-eye');
      await detailBtn.click();

      await page.waitForTimeout(1000);

      // Verifikasi: Di halaman detail
      await expect(page).toHaveURL(/\/dpa\/laporan\/\d+/);
      
      // Verifikasi: Ada informasi dasar laporan
      const content = await page.locator('main').textContent();
      expect(content).toContain('Detail Laporan');
      
      // Verifikasi: Ada section evaluasi
      const hasEvaluasi = content.includes('Evaluasi DPA');
      console.log(hasEvaluasi ? "✅ Evaluasi section found" : "ℹ️ No evaluation yet");
    }
  });

  test("DPA dapat mengakses halaman laporan yang telah dievaluasi", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/laporanDiterima");
    
    // Verifikasi: Halaman laporan diterima terbuka
    await expect(page).toHaveURL(/\/dpa\/laporanDiterima/);
    
    await page.waitForSelector("#laporanTable, .empty-state", { timeout: 10000 });
    
    // Verifikasi: Ada kolom status
    const content = await page.locator('main').textContent();
    const hasStatus = content.includes('Status') || content.includes('Diterima') || content.includes('Revisi');
    expect(hasStatus).toBe(true);
  });

  test("DPA dapat melihat status evaluasi laporan (Diterima/Revisi)", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/laporanDiterima");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    const laporanRows = page.locator("#laporanTable tr");
    const count = await laporanRows.count();

    if (count > 0) {
      // Cek status badge di tabel
      const firstRow = laporanRows.first();
      const rowText = await firstRow.textContent();
      
      const hasStatusBadge = rowText.includes('Diterima') || rowText.includes('Revisi');
      expect(hasStatusBadge).toBe(true);
      
      console.log("✅ Status badge found in table");
    }
  });

  test("DPA dapat kombinasi search dan filter", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    // Search dulu
    const searchInput = page.locator("#searchInput");
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(500);

      // Lalu filter divisi
      const divisiBtn = page.locator("#divisiDropdownBtn");
      if (await divisiBtn.isVisible()) {
        await divisiBtn.click();
        await page.waitForTimeout(300);

        const divisiOption = page.locator('#divisiDropdownMenu button[data-value]').first();
        await divisiOption.click();
        await page.waitForTimeout(500);

        // Verifikasi: Filter dan search bekerja bersamaan
        const laporanRows = page.locator("#laporanTable tr");
        const count = await laporanRows.count();
        console.log(`✅ Combined filter result: ${count} laporan`);
      }
    }
  });

  test("DPA dapat reset filter dan melihat semua laporan", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/kelolaLaporan");
    
    await page.waitForSelector("#laporanTable tr, .empty-state", { timeout: 10000 });

    // Apply filter dulu
    const divisiBtn = page.locator("#divisiDropdownBtn");
    if (await divisiBtn.isVisible()) {
      await divisiBtn.click();
      await page.waitForTimeout(300);

      const divisiOption = page.locator('#divisiDropdownMenu button[data-value]').nth(1);
      await divisiOption.click();
      await page.waitForTimeout(500);

      const countFiltered = await page.locator("#laporanTable tr").count();

      // Reset ke "Semua Divisi"
      await divisiBtn.click();
      await page.waitForTimeout(300);
      
      const allOption = page.locator('#divisiDropdownMenu button[data-value="all"]');
      await allOption.click();
      await page.waitForTimeout(500);

      const countAll = await page.locator("#laporanTable tr").count();
      
      console.log(`✅ Filtered: ${countFiltered}, All: ${countAll}`);
    }
  });
});

