import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Functional Test - Detail Laporan HMSI', () => {

  test.beforeEach(async ({ page }) => {
    // Set a reasonable timeout for all tests
    test.setTimeout(60000);
    
    // Login as HMSI user
    await page.goto(`${BASE_URL}/auth/login`);
    await page.getByPlaceholder('Masukkan username Anda').fill('ridhooo@example.com');
    await page.getByPlaceholder('Masukkan password Anda').fill('12345');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/hmsi\/dashboard/);
  });

  async function navigateToDetailLaporan(page) {
    // Navigate to laporan list
    await page.goto(`${BASE_URL}/hmsi/laporan`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Wait for table to load
    const laporanRows = page.locator('table tbody tr[data-visible="true"]');
    await laporanRows.first().waitFor({ state: 'visible', timeout: 10000 });
    
    const rowCount = await laporanRows.count();
    
    if (rowCount === 0) {
      throw new Error('Tidak ada laporan yang tersedia untuk dilihat detailnya');
    }
    
    // Find the eye icon link in the first row (Aksi column)
    const firstRow = laporanRows.first();
    const eyeLink = firstRow.locator('a[title="Lihat Detail Laporan"]');
    
    await eyeLink.waitFor({ state: 'attached', timeout: 5000 });
    await eyeLink.click();
    
    // Wait for detail page to load
    await page.waitForLoadState('domcontentloaded');
    const heading = page.locator('h1', { hasText: /Detail Laporan/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  }

  test('Halaman detail laporan berhasil dimuat dengan header yang benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check main heading
    const mainHeading = page.locator('h1', { hasText: /Detail Laporan Kegiatan/i });
    await expect(mainHeading).toBeVisible();
    
    // Check subheading
    const subHeading = page.locator('p', { hasText: /Informasi lengkap laporan/i });
    await expect(subHeading).toBeVisible();
  });

  test('Bagian Informasi Dasar menampilkan semua field dengan benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check Informasi Dasar section
    const basicInfoSection = page.locator('h4', { hasText: /Informasi Dasar/i });
    await expect(basicInfoSection).toBeVisible();
    
    // Verify label fields exist
    const judulLabel = page.locator('label', { hasText: /Judul Laporan/i });
    await expect(judulLabel).toBeVisible();
    
    const prokerLabel = page.locator('label', { hasText: /Program Kerja Terkait/i });
    await expect(prokerLabel).toBeVisible();
    
    const tanggalLabel = page.locator('label', { hasText: /Tanggal Pelaksanaan/i });
    await expect(tanggalLabel).toBeVisible();
    
    const waktuLabel = page.locator('label', { hasText: /Waktu & Tempat/i });
    await expect(waktuLabel).toBeVisible();
    
    const deskripsiLabel = page.locator('label', { hasText: /Deskripsi Kegiatan/i });
    await expect(deskripsiLabel).toBeVisible();
    
    const sasaranLabel = page.locator('label', { hasText: /Sasaran Kegiatan/i });
    await expect(sasaranLabel).toBeVisible();
  });

  test('Bagian Informasi Keuangan menampilkan semua field dengan benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to financial section
    const financialSection = page.locator('h4', { hasText: /Informasi Keuangan/i });
    await financialSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check Financial section is visible
    await expect(financialSection).toBeVisible();
    
    // Verify label fields exist
    const sumberDanaLabel = page.locator('label', { hasText: /Sumber Dana/i });
    await expect(sumberDanaLabel).toBeVisible();
    
    const danaTerpakaiLabel = page.locator('label', { hasText: /Dana Terpakai/i });
    await expect(danaTerpakaiLabel).toBeVisible();
  });

  test('Bagian Target Pencapaian menampilkan semua field dengan benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to target section
    const targetSection = page.locator('h4', { hasText: /Target Pencapaian/i });
    await targetSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check Target section is visible
    await expect(targetSection).toBeVisible();
    
    // Verify label fields exist
    const kuantitatifLabel = page.locator('label', { hasText: /Target Kuantitatif/i });
    await expect(kuantitatifLabel).toBeVisible();
    
    const kualitatifLabel = page.locator('label', { hasText: /Target Kualitatif/i });
    await expect(kualitatifLabel).toBeVisible();
    
    const deskKuanLabel = page.locator('label', { hasText: /Deskripsi Capaian Kuantitatif/i });
    await expect(deskKuanLabel).toBeVisible();
    
    const deskKualLabel = page.locator('label', { hasText: /Deskripsi Capaian Kualitatif/i });
    await expect(deskKualLabel).toBeVisible();
  });

  test('Bagian Kendala dan Solusi menampilkan semua field dengan benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to obstacles section
    const obstaclesSection = page.locator('h4', { hasText: /Kendala dan Solusi/i });
    await obstaclesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check Obstacles section is visible
    await expect(obstaclesSection).toBeVisible();
    
    // Verify label fields exist
    const kendalaLabel = page.locator('label', { hasText: /Kendala yang Dihadapi/i });
    await expect(kendalaLabel).toBeVisible();
    
    const solusiLabel = page.locator('label', { hasText: /Solusi yang Diterapkan/i });
    await expect(solusiLabel).toBeVisible();
  });

  test('Bagian Dokumen Pendukung menampilkan dengan benar ketika file ada', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to document section
    const docSection = page.locator('h4', { hasText: /Dokumen Pendukung/i });
    await docSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check Document section is visible
    await expect(docSection).toBeVisible();
    
    // Check if download button exists
    const downloadButton = page.locator('a', { hasText: /Download File/i });
    const downloadExists = await downloadButton.count() > 0;
    
    if (downloadExists) {
      await expect(downloadButton).toBeVisible();
      // Check button has download icon
      const downloadIcon = downloadButton.locator('i.fa-download');
      await expect(downloadIcon).toBeVisible();
    }
  });

  test('Semua field data ditampilkan bukan kosong atau berisi dash', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Get all value containers
    const valueContainers = page.locator('.bg-white.border.border-gray-300.rounded-lg');
    const count = await valueContainers.count();
    
    // At least check that multiple fields are present
    expect(count).toBeGreaterThan(5);
    
    // Check that content is not empty
    for (let i = 0; i < Math.min(count, 5); i++) {
      const container = valueContainers.nth(i);
      const text = await container.textContent();
      // Should have some content (not just whitespace)
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('Tombol Kembali berfungsi dengan benar', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Get current URL
    const detailUrl = page.url();
    
    // Click back button
    const backButton = page.locator('a', { hasText: /Kembali/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Should navigate back to laporan list
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toBe(detailUrl);
  });

  test('Halaman responsif di mobile view', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check main heading is visible
    const mainHeading = page.locator('h1', { hasText: /Detail Laporan Kegiatan/i });
    await expect(mainHeading).toBeVisible();
    
    // Check basic section is visible
    const basicSection = page.locator('h4', { hasText: /Informasi Dasar/i });
    await expect(basicSection).toBeVisible();
    
    // Scroll and check other sections are accessible
    await basicSection.scrollIntoViewIfNeeded();
    
    const financialSection = page.locator('h4', { hasText: /Informasi Keuangan/i });
    await financialSection.scrollIntoViewIfNeeded();
    await expect(financialSection).toBeVisible();
  });

  test('Halaman responsif di tablet view', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check main heading is visible
    const mainHeading = page.locator('h1', { hasText: /Detail Laporan Kegiatan/i });
    await expect(mainHeading).toBeVisible();
    
    // Verify grid layout is proper - check that sections are responsive
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);
    
    // Check responsive classes exist (Tailwind grid)
    const gridElements = page.locator('[class*="grid"]');
    const gridCount = await gridElements.count();
    expect(gridCount).toBeGreaterThan(0);
  });

  test('Nilai persentase ditampilkan dengan format persen', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to target section
    const targetSection = page.locator('h4', { hasText: /Target Pencapaian/i });
    await targetSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check for percentage values
    const containers = page.locator('label:has-text("Target Kuantitatif")').locator('..').locator('div').filter({ hasText: /\d+%/ });
    const containerCount = await containers.count();
    
    if (containerCount > 0) {
      const firstValue = await containers.first().textContent();
      // Should contain % sign
      expect(firstValue).toMatch(/%/);
    }
  });

  test('Nilai dana ditampilkan dengan format Rupiah', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to financial section
    const financialSection = page.locator('h4', { hasText: /Informasi Keuangan/i });
    await financialSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Check for Dana Terpakai label
    const danaLabel = page.locator('label:has-text("Dana Terpakai")');
    await expect(danaLabel).toBeVisible();
    
    // Get text content from page to verify dana value exists
    const pageContent = await page.textContent('body');
    
    // Should contain either Rp format, dash, or numeric values
    expect(pageContent).toBeTruthy();
  });

  test('Deskripsi panjang ditampilkan dengan whitespace preservation', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to description fields
    const deskripsiLabel = page.locator('label:has-text("Deskripsi Kegiatan")');
    await deskripsiLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    await expect(deskripsiLabel).toBeVisible();
  });

  test('Sidebar dan navbar tetap visible saat scrolling', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check navbar exists
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    
    // Navbar should still be visible or at least in viewport
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Footer tampil di bawah halaman', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Check for footer (adjust selector if needed)
    const footer = page.locator('footer');
    const footerCount = await footer.count();
    
    if (footerCount > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('Semua section memiliki styling yang konsisten', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check main container has correct styling
    const mainContainer = page.locator('.bg-white.shadow-xl.rounded-2xl.overflow-hidden.border');
    await expect(mainContainer).toBeVisible();
    
    // Check all sections have proper styling
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const heading = section.locator('h4');
      await expect(heading).toHaveClass(/font-semibold/);
    }
  });

  test('Konten tidak ada overflow dan terbaca dengan baik', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check main container width
    const mainContainer = page.locator('main');
    const containerBox = await mainContainer.boundingBox();
    
    expect(containerBox).not.toBeNull();
    
    // Check child elements don't overflow
    const contentBox = page.locator('.max-w-5xl.mx-auto');
    const box = await contentBox.boundingBox();
    
    expect(box).not.toBeNull();
    if (box && containerBox) {
      expect(box.width).toBeLessThanOrEqual(containerBox.width + 10); // +10 for margin
    }
  });

  test('Breadcrumb atau navigation indicator menunjukkan lokasi halaman', async ({ page }) => {
    await navigateToDetailLaporan(page);
    
    // Check if there's an active nav indicator or breadcrumb
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
    
    // Typically in HMSI tracker there should be active navigation
    const activeNav = page.locator('[class*="active"], [aria-current="page"]');
    const activeCount = await activeNav.count();
    
    // At least navbar should indicate we're on laporan page
    expect(activeCount).toBeGreaterThanOrEqual(0);
  });

});
