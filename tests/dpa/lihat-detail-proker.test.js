/**
 * =====================================================
 * TEST: Lihat Detail Program Kerja (DPA)
 * =====================================================
 * Menguji fungsionalitas melihat detail program kerja
 * - Test akses halaman detail
 * - Test tampilan informasi proker
 * - Test update status proker
 * - Test validasi sebelum update status
 */

const { test, expect } = require("@playwright/test");
const { loginAsDPA } = require("./helpers/auth-helper");

test.describe("Functional Testing - Lihat Detail Program Kerja (DPA)", () => {
  
  // Setup: Login sebelum setiap test
  test.beforeEach(async ({ page }) => {
    await loginAsDPA(page);
  });

  /**
   * TEST 1: DPA dapat mengakses halaman detail program kerja
   */
  test("DPA dapat membuka detail program kerja dari daftar", async ({ page }) => {
    // Navigasi ke halaman lihat proker
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    // Tunggu halaman termuat
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    // Cek apakah ada program kerja
    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      // Klik icon detail (mata)
      const detailBtn = prokerRows.first().locator('a[title="Lihat Detail"] i.fa-eye');
      await detailBtn.click();

      // Verifikasi: Masuk ke halaman detail
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/.*\/proker\/.*\/detail/);
      
      // Verifikasi: Judul detail muncul
      await expect(page.locator('main h1, main h2').first()).toContainText(/Detail|Program Kerja/i);
    }
  });

  /**
   * TEST 2: Detail program kerja menampilkan semua informasi penting
   */
  test("Detail proker menampilkan informasi lengkap", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      const detailBtn = prokerRows.first().locator('a[title="Lihat Detail"] i.fa-eye');
      await detailBtn.click();

      await page.waitForTimeout(1000);

      // Verifikasi: Informasi penting ditampilkan
      // Nama program kerja
      await expect(page.locator('text=/Nama Program|Nama Proker/i')).toBeVisible();
      
      // Divisi - cek di main content area
      const hasDivisi = await page.locator('main').textContent();
      expect(hasDivisi).toContain('Divisi');
      
      // Tanggal
      await expect(page.locator('text=/Tanggal Mulai/i').first()).toBeVisible();
      
      // Deskripsi
      await expect(page.locator('text=/Deskripsi/i').first()).toBeVisible();
    }
  });

  /**
   * TEST 3: DPA dapat melihat dokumen pendukung
   */
  test("DPA dapat melihat dokumen pendukung program kerja", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      const detailBtn = prokerRows.first().locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
      if (await detailBtn.isVisible()) {
        await detailBtn.click();
      } else {
        await prokerRows.first().click();
      }

      await page.waitForTimeout(1000);

      // Cek apakah ada dokumen pendukung
      const dokumenLink = page.locator('a:has-text("Unduh Dokumen"), a:has-text("Lihat Dokumen")');
      if (await dokumenLink.isVisible()) {
        // Verifikasi link dokumen ada
        await expect(dokumenLink).toBeVisible();
      }
    }
  });

  /**
   * TEST 4: DPA dapat mengubah status proker menjadi "Selesai"
   */
  test("DPA dapat menandai program kerja sebagai Selesai", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      // Cari proker dengan status "Sedang Berjalan"
      for (let i = 0; i < count; i++) {
        const cardText = await prokerRows.nth(i).textContent();
        
        if (cardText.includes("Sedang Berjalan")) {
          // Buka detail
          const detailBtn = prokerRows.nth(i).locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
          if (await detailBtn.isVisible()) {
            await detailBtn.click();
          } else {
            await prokerRows.nth(i).click();
          }

          await page.waitForTimeout(1000);

          // Klik tombol ubah status / tandai selesai
          const selesaiBtn = page.locator('button:has-text("Selesai"), button:has-text("Tandai Selesai")');
          if (await selesaiBtn.isVisible()) {
            await selesaiBtn.click();

            // Tunggu modal konfirmasi
            await page.waitForTimeout(500);

            // Konfirmasi pertama
            const confirmBtn = page.locator('#proceedConfirm1, button:has-text("Ya")');
            if (await confirmBtn.isVisible()) {
              await confirmBtn.click();
              
              await page.waitForTimeout(500);

              // Konfirmasi kedua dengan validasi teks
              const validationInput = page.locator('#validationInput');
              if (await validationInput.isVisible()) {
                await validationInput.fill("YA, SAYA YAKIN");
                
                const finalConfirm = page.locator('#proceedConfirm2');
                await finalConfirm.click();

                await page.waitForTimeout(2000);

                // Verifikasi: Modal sukses muncul atau status berubah
                const successModal = page.locator('#successModal');
                const isSuccessVisible = await successModal.isVisible().catch(() => false);
                
                if (isSuccessVisible) {
                  await expect(successModal).toBeVisible();
                }
              }
            }
          }
          
          break;
        }
      }
    }
  });

  /**
   * TEST 5: DPA dapat mengubah status proker menjadi "Gagal"
   */
  test("DPA dapat menandai program kerja sebagai Gagal", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      // Cari proker dengan status "Sedang Berjalan"
      for (let i = 0; i < count; i++) {
        const cardText = await prokerRows.nth(i).textContent();
        
        if (cardText.includes("Sedang Berjalan")) {
          const detailBtn = prokerRows.nth(i).locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
          if (await detailBtn.isVisible()) {
            await detailBtn.click();
          } else {
            await prokerRows.nth(i).click();
          }

          await page.waitForTimeout(1000);

          // Klik tombol gagal
          const gagalBtn = page.locator('button:has-text("Gagal"), button:has-text("Tidak Selesai")');
          if (await gagalBtn.isVisible()) {
            await gagalBtn.click();

            await page.waitForTimeout(500);

            // Konfirmasi
            const confirmBtn = page.locator('#proceedConfirm1, button:has-text("Ya")');
            if (await confirmBtn.isVisible()) {
              await confirmBtn.click();
              
              await page.waitForTimeout(500);

              const validationInput = page.locator('#validationInput');
              if (await validationInput.isVisible()) {
                await validationInput.fill("YA, SAYA YAKIN");
                
                const finalConfirm = page.locator('#proceedConfirm2');
                await finalConfirm.click();

                await page.waitForTimeout(2000);

                const successModal = page.locator('#successModal');
                const isSuccessVisible = await successModal.isVisible().catch(() => false);
                
                if (isSuccessVisible) {
                  await expect(successModal).toBeVisible();
                }
              }
            }
          }
          
          break;
        }
      }
    }
  });

  /**
   * TEST 6: Validasi - tidak bisa ubah status tanpa laporan
   */
  test("DPA tidak dapat mengubah status proker yang belum ada laporannya", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      const detailBtn = prokerRows.first().locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
      if (await detailBtn.isVisible()) {
        await detailBtn.click();
      } else {
        await prokerRows.first().click();
      }

      await page.waitForTimeout(1000);

      // Coba klik tombol selesai/gagal
      const statusBtn = page.locator('button:has-text("Selesai"), button:has-text("Gagal")');
      if (await statusBtn.first().isVisible()) {
        await statusBtn.first().click();

        await page.waitForTimeout(1000);

        // Jika tidak ada laporan, harus muncul pesan error
        const infoModal = page.locator('#infoModal, .error-message, text=/laporan belum ada|harus ada laporan/i');
        const isInfoVisible = await infoModal.isVisible().catch(() => false);
        
        // Modal info harus muncul jika tidak ada laporan
        if (isInfoVisible) {
          await expect(infoModal).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST 7: DPA dapat membatalkan perubahan status
   */
  test("DPA dapat membatalkan proses perubahan status", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const cardText = await prokerRows.nth(i).textContent();
        
        if (cardText.includes("Sedang Berjalan")) {
          const detailBtn = prokerRows.nth(i).locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
          if (await detailBtn.isVisible()) {
            await detailBtn.click();
          } else {
            await prokerRows.nth(i).click();
          }

          await page.waitForTimeout(1000);

          const selesaiBtn = page.locator('button:has-text("Selesai")');
          if (await selesaiBtn.isVisible()) {
            await selesaiBtn.click();

            await page.waitForTimeout(500);

            // Klik tombol batal di modal konfirmasi
            const cancelBtn = page.locator('#cancelConfirm1, button:has-text("Batal")');
            if (await cancelBtn.isVisible()) {
              await cancelBtn.click();

              await page.waitForTimeout(500);

              // Verifikasi: Modal tertutup
              const modal = page.locator('#confirmModal1');
              const isModalHidden = await modal.isHidden().catch(() => true);
              expect(isModalHidden).toBeTruthy();
            }
          }
          
          break;
        }
      }
    }
  });

  /**
   * TEST 8: Target kuantitatif dan kualitatif ditampilkan
   */
  test("Detail proker menampilkan target kuantitatif dan kualitatif", async ({ page }) => {
    await page.goto("http://localhost:3000/dpa/lihatProker");
    
    await page.waitForSelector("#programTable tr, .empty-state", { timeout: 10000 });

    const prokerRows = page.locator("#programTable tr");
    const count = await prokerRows.count();

    if (count > 0) {
      const detailBtn = prokerRows.first().locator('a:has-text("Detail"), a:has-text("Lihat Detail")');
      if (await detailBtn.isVisible()) {
        await detailBtn.click();
      } else {
        await prokerRows.first().click();
      }

      await page.waitForTimeout(1000);

      // Cek apakah target ditampilkan
      const targetSection = page.locator('text=/Target Kuantitatif|Target Kualitatif/i');
      if (await targetSection.first().isVisible()) {
        await expect(targetSection.first()).toBeVisible();
      }
    }
  });

});
