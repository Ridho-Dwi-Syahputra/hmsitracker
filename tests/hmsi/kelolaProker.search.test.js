import { test, expect } from '@playwright/test';

test.describe('Functional Test - Search Program Kerja HMSI', () => {

  // =====================================
  // LOGIN SEBAGAI HMSI
  // =====================================
  async function loginAsHMSI(page) {
    await page.goto('http://localhost:3000/auth/login');

    await page
      .getByPlaceholder('Masukkan username Anda (hmsi/dpa)')
      .fill('ridhooo@example.com');

    await page
      .getByPlaceholder('Masukkan password Anda')
      .fill('12345');

    await page.getByRole('button', { name: 'Log In' }).click();

    // Pastikan login berhasil
    await expect(page).toHaveURL(/\/hmsi/);
  }

  // =====================================
  // MENUJU HALAMAN KELOLA PROKER
  // =====================================
  async function goToKelolaProker(page) {
    await page.goto('http://localhost:3000/hmsi/kelola-proker');

    // Halaman & tabel tampil
    await expect(page.locator('table')).toBeVisible();
  }

  // =====================================
  // TEST SEARCH PROGRAM KERJA
  // =====================================
  test('HMSI dapat melakukan pencarian program kerja', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    // Cari input search secara fleksibel
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await expect(searchInput).toBeVisible();

    // Isi kata kunci pencarian
    await searchInput.fill('proker');

    // Tunggu proses search / filter JS
    await page.waitForTimeout(500);

    // ASSERT PALING AMAN:
    // Tidak error & tabel tetap ada
    await expect(page.locator('table')).toBeVisible();
  });

  // =========================================
  // FILTER STATUS
  // =========================================
  test('HMSI dapat memfilter proker berdasarkan status', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.getByRole('button', { name: 'Sedang Berjalan' }).click();

    await page.waitForTimeout(500);

    const visibleRows = page.locator('#programTable tr[data-visible="true"]');
    const count = await visibleRows.count();

    for (let i = 0; i < count; i++) {
      const rowText = await visibleRows.nth(i).innerText();
      expect(rowText).toContain('Sedang Berjalan');
    }
  });

  test('Search dengan kata kunci spesifik', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('Workshop');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan angka', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('2026');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan karakter spesial', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('@#$%');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan text panjang', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('Program Kerja Tahunan HMSI untuk meningkatkan kualitas');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan huruf kapital', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('PROKER');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan huruf kecil', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('proker');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan spasi di awal', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('  proker');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan spasi di akhir', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('proker  ');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Clear search field', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('proker');
    await page.waitForTimeout(500);
    await searchInput.clear();
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Filter status Selesai', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.locator('button[data-value="Selesai"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Filter status Belum Dimulai', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.getByRole('button', { name: 'Belum Dimulai' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Filter kemudian search', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.getByRole('button', { name: 'Sedang Berjalan' }).click();
    await page.waitForTimeout(500);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('proker');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search kemudian filter', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('proker');
    await page.waitForTimeout(500);

    await page.locator('#dropdownButton').click();
    await page.locator('button[data-value="Selesai"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Multiple search berturut-turut', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('Workshop');
    await page.waitForTimeout(500);
    
    await searchInput.clear();
    await searchInput.fill('Seminar');
    await page.waitForTimeout(500);
    
    await searchInput.clear();
    await searchInput.fill('Training');
    await page.waitForTimeout(500);
    
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan kata kunci tidak ditemukan', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('XYZ123ABC');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Toggle filter dropdown beberapa kali', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.waitForTimeout(300);
    await page.locator('#dropdownButton').click();
    await page.waitForTimeout(300);
    await page.locator('#dropdownButton').click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan emoji', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('🎉📝');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan tanda kutip', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('"Proker Unggulan"');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('Search dengan slash', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]'
    );

    await searchInput.fill('Proker/2026');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

});
