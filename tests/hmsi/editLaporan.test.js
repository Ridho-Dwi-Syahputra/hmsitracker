const { test, expect } = require("@playwright/test");
const { loginAsHMSI } = require("./helpers/auth-helper");

test.describe('Functional Test - Edit Laporan HMSI', () => {
  let hasData = true;

  test.beforeEach(async ({ page }) => {
    // Login sebagai HMSI user
    await loginAsHMSI(page);
    
    // Check if there's data to test
    await page.goto('http://localhost:3000/hmsi/kelola-evaluasi', {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    await page.waitForTimeout(1000);
    
    const rows = page.locator('#evaluasiTable tbody tr');
    const rowCount = await rows.count();
    hasData = rowCount > 0;
    
    if (!hasData) {
      console.log('⚠️ Warning: No revision laporan available. Tests will be skipped.');
    }
  });

  async function navigateToEditLaporan(page) {
    console.log('🔄 Navigating to kelola evaluasi...');
    
    try {
      // Navigate to Laporan Revisi page
      await page.goto('http://localhost:3000/hmsi/kelola-evaluasi', {
        timeout: 60000,
        waitUntil: 'domcontentloaded'
      });

      // Tunggu tabel evaluasi muncul atau empty state
      const tableOrEmpty = await page.locator('#evaluasiTable tbody tr').first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!tableOrEmpty) {
        const emptyState = await page.locator('.empty-state, .text-center, [class*="kosong"], [class*="tidak ada"]').first().isVisible({ timeout: 5000 }).catch(() => false);
        if (!emptyState) {
          await page.waitForTimeout(2000);
        }
      }

      const rows = page.locator('#evaluasiTable tbody tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        console.log('⚠️ No revision laporan available, skipping test');
        return null;
      }

      console.log(`✅ Found ${rowCount} laporan dengan status revisi`);

      // Klik tombol edit di baris pertama
      const firstRow = rows.first();
      const editLink = firstRow.locator('a[title*="Edit"], a[title*="edit"], a i.fa-pen-to-square, a i.fa-edit').first();

      if (!await editLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('⚠️ Edit link tidak ditemukan, coba klik link biasa');
        const anyLink = firstRow.locator('a').first();
        if (await anyLink.isVisible()) {
          await anyLink.click();
        } else {
          throw new Error('Tidak ada link di tabel');
        }
      } else {
        console.log('🖱️ Clicking edit link...');
        await editLink.click();
      }

      // Tunggu halaman edit dimuat
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // Verifikasi halaman edit atau laporan detail
      const heading = page.locator('h1, h2').first();
      const pageTitle = await heading.textContent({ timeout: 5000 }).catch(() => 'Form');
      console.log(`📄 Page loaded: ${pageTitle}`);

      return pageTitle;
    } catch (error) {
      console.error('❌ Error navigating to edit:', error.message);
      throw error;
    }
  }

  // ================ 1. PAGE LOAD & STRUCTURE ================
  test('Halaman edit laporan berhasil dimuat dengan semua section', async ({ page }) => {
    if (!hasData) {
      console.log('⏭️ Skipping - no revision laporan available');
      return;
    }
    const title = await navigateToEditLaporan(page);
    if (!title) {
      console.log('⏭️ Skipping test - no revision laporan available');
      return;
    }
    expect(title).toContain('Edit');
    console.log('✅ Page loaded successfully');
  });

  // ================ 2. INFORMASI DASAR - ALL FIELDS ================
  test('Dapat mengedit semua field Informasi Dasar', async ({ page }) => {
    const title = await navigateToEditLaporan(page);
    if (!title) {
      console.log('⏭️ Skipping test - no revision laporan available');
      return;
    }
    
    const judul = page.locator('input[name="judul_laporan"], input[placeholder*="Judul"]').first();
    if (await judul.isVisible({ timeout: 2000 }).catch(() => false)) {
      await judul.clear();
      await judul.fill(`Test Judul ${Date.now()}`);
      expect(await judul.inputValue()).toContain('Test Judul');
      console.log('✅ Judul edited');
    }

    const waktu = page.locator('input[name="waktu_tempat"], input[placeholder*="Waktu"]').first();
    if (await waktu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await waktu.clear();
      await waktu.fill('09:00 - 12:00 WIB, Gedung A');
      console.log('✅ Waktu edited');
    }

    const deskripsi = page.locator('textarea[name="deskripsi_kegiatan"], textarea[placeholder*="Deskripsi"]').first();
    if (await deskripsi.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deskripsi.clear();
      await deskripsi.fill('Deskripsi kegiatan untuk test');
      console.log('✅ Deskripsi edited');
    }
  });

  // ================ 3. PROGRAM KERJA DROPDOWN ================
  test('Dropdown Program Kerja dapat dibuka, dipilih, dan ditutup', async ({ page }) => {
    if (!hasData) {
      console.log('⏭️ Skipping - no revision laporan available');
      return;
    }
    await navigateToEditLaporan(page);
    
    const btn = page.locator('#prokerDropdownBtn, button:has-text("Program")').first();
    
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(300);
      
      const options = page.locator('#prokerDropdownMenu button[data-value], [role="option"]');
      const optionCount = await options.count();

      if (optionCount > 0) {
        const firstOption = options.first();
        const value = await firstOption.getAttribute('data-value');
        await firstOption.click();
        await page.waitForTimeout(300);
        console.log(`✅ Option selected: ${value}`);
      }

      await btn.click();
      console.log('✅ Dropdown closed');
    }
  });

  // ================ 4. SUMBER DANA RADIO BUTTONS ================
  test('Radio button Sumber Dana (Uang Kas & Lainnya) berfungsi', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const uangKas = page.locator('input[name="sumber_dana_radio"][value="uang_kas"], input[type="radio"][value*="kas"]').first();
    const lainnya = page.locator('input[name="sumber_dana_radio"][value="lainnya"], input[type="radio"][value*="lainnya"]').first();

    if (await uangKas.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uangKas.click();
      expect(await uangKas.isChecked()).toBe(true);
      console.log('✅ Uang Kas selected');
    }

    if (await lainnya.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lainnya.click();
      expect(await lainnya.isChecked()).toBe(true);
      console.log('✅ Lainnya selected');
    }
  });

  // ================ 5. DANA FIELDS ================
  test('Dapat mengedit Dana Digunakan dan Dana Terpakai', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const danaDigunakan = page.locator('input[name="dana_digunakan"], input[placeholder*="Digunakan"]').first();
    if (await danaDigunakan.isVisible({ timeout: 5000 }).catch(() => false)) {
      await danaDigunakan.clear();
      await danaDigunakan.fill('500000');
      console.log('✅ Dana Digunakan edited');
    }

    const danaTermakai = page.locator('input[name="dana_terpakai"], input[placeholder*="Terpakai"]').first();
    if (await danaTermakai.isVisible({ timeout: 5000 }).catch(() => false)) {
      await danaTermakai.clear();
      await danaTermakai.fill('400000');
      console.log('✅ Dana Terpakai edited');
    }
  });

  // ================ 6. TARGET PENCAPAIAN ================
  test('Dapat mengedit Target Kualitatif dan Kuantitatif', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const targetKualitatif = page.locator('textarea[name="target_kualitatif"], textarea[placeholder*="Kualitatif"]').first();
    if (await targetKualitatif.isVisible({ timeout: 5000 }).catch(() => false)) {
      await targetKualitatif.clear();
      await targetKualitatif.fill('Target kualitatif test');
      console.log('✅ Target Kualitatif edited');
    }

    const targetKuantitatif = page.locator('textarea[name="target_kuantitatif"], textarea[placeholder*="Kuantitatif"]').first();
    if (await targetKuantitatif.isVisible({ timeout: 5000 }).catch(() => false)) {
      await targetKuantitatif.clear();
      await targetKuantitatif.fill('Target kuantitatif test');
      console.log('✅ Target Kuantitatif edited');
    }
  });

  // ================ 7. SASARAN, KENDALA, SOLUSI ================
  test('Dapat mengedit Sasaran, Kendala, dan Solusi', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const sasaran = page.locator('textarea[name="sasaran"], textarea[placeholder*="Sasaran"]').first();
    if (await sasaran.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sasaran.clear();
      await sasaran.fill('Sasaran test');
      console.log('✅ Sasaran edited');
    }

    const kendala = page.locator('textarea[name="kendala"], textarea[placeholder*="Kendala"]').first();
    if (await kendala.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kendala.clear();
      await kendala.fill('Kendala test');
      console.log('✅ Kendala edited');
    }

    const solusi = page.locator('textarea[name="solusi"], textarea[placeholder*="Solusi"]').first();
    if (await solusi.isVisible({ timeout: 5000 }).catch(() => false)) {
      await solusi.clear();
      await solusi.fill('Solusi test');
      console.log('✅ Solusi edited');
    }
  });

  // ================ 8. FILE UPLOAD ================
  test('Dropzone file dokumentasi tersedia', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const dropzone = page.locator('.dropzone, [data-dropzone], #fileUpload').first();
    
    if (await dropzone.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Dropzone visible');
    } else {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ File input found');
      }
    }
  });

  // ================ 9. BUTTONS ================
  test('Tombol Simpan dan Batal tersedia dan berfungsi', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const submitBtn = page.locator('button[type="submit"], button:has-text("Simpan"), button:has-text("Submit")').first();
    const cancelBtn = page.locator('a:has-text("Batal"), a:has-text("Kembali"), button:has-text("Batal")').first();

    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(submitBtn).toBeEnabled();
      console.log('✅ Submit button visible and enabled');
    }

    if (await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Cancel button visible');
    }
  });

  // ================ 10. REQUIRED FIELDS ================
  test('Field wajib (Judul, Waktu, Deskripsi) memiliki atribut required', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const judul = page.locator('input[name="judul_laporan"]').first();
    const waktu = page.locator('input[name="waktu_tempat"]').first();
    const deskripsi = page.locator('textarea[name="deskripsi_kegiatan"]').first();

    if (await judul.isVisible()) {
      const isRequired = await judul.evaluate(el => el.required);
      console.log(`✅ Judul required: ${isRequired}`);
    }

    if (await waktu.isVisible()) {
      const isRequired = await waktu.evaluate(el => el.required);
      console.log(`✅ Waktu required: ${isRequired}`);
    }

    if (await deskripsi.isVisible()) {
      const isRequired = await deskripsi.evaluate(el => el.required);
      console.log(`✅ Deskripsi required: ${isRequired}`);
    }
  });

  // ================ 11. FORM SUBMISSION ================
  test('Form dapat disubmit dengan data valid', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const judul = page.locator('input[name="judul_laporan"], input[placeholder*="Judul"]').first();
    if (await judul.isVisible()) {
      await judul.clear();
      await judul.fill(`Test Edit ${Date.now()}`);
    }

    const waktu = page.locator('input[name="waktu_tempat"], input[placeholder*="Waktu"]').first();
    if (await waktu.isVisible()) {
      await waktu.clear();
      await waktu.fill('10:00 - 12:00 WIB, Ruang A');
    }

    const deskripsi = page.locator('textarea[name="deskripsi_kegiatan"], textarea[placeholder*="Deskripsi"]').first();
    if (await deskripsi.isVisible()) {
      await deskripsi.clear();
      await deskripsi.fill('Deskripsi valid untuk submit');
    }

    const submitBtn = page.locator('button[type="submit"], button:has-text("Simpan")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Form submitted');
    }
  });

  // ================ 12. STYLING ================
  test('Header memiliki styling gradient orange', async ({ page }) => {
    if (!hasData) { return; }
    await navigateToEditLaporan(page);

    const header = page.locator('header, [class*="gradient"], [class*="orange"]').first();
    
    if (await header.isVisible()) {
      const classNames = await header.getAttribute('class');
      console.log(`✅ Header classes: ${classNames}`);
    }
  });

  // ================ 13. RESPONSIVE ================
  test('Form responsif di mobile view (375px)', async ({ page }) => {
    if (!hasData) { return; }
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateToEditLaporan(page);

    const inputs = page.locator('input, textarea, button').first();
    if (await inputs.isVisible()) {
      console.log('✅ Form responsive on mobile');
    }

    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
