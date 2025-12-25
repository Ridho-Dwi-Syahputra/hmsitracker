import { test, expect } from '@playwright/test';

test.describe('Functional Test - Kelola Proker HMSI', () => {

  async function loginAsHMSI(page) {
    await page.goto('http://localhost:3000/auth/login');

    await page
      .getByPlaceholder('Masukkan username Anda (hmsi/dpa)')
      .fill('ridhooo@example.com');

    await page
      .getByPlaceholder('Masukkan password Anda')
      .fill('12345');

    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/hmsi/);
  }

  async function goToKelolaProker(page) {
    await page.goto('http://localhost:3000/hmsi/kelola-proker');

    await expect(
      page.getByRole('heading', { name: /kelola program kerja/i })
    ).toBeVisible();
  }

  // =====================================================
  // CASE 1: LIHAT DETAIL PROKER DAN KEMBALI
  // =====================================================
  test('Berhasil melihat detail proker lalu kembali ke halaman kelola proker', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await expect(page.locator('table')).toBeVisible();

    const viewButton = page.locator('a[title="Lihat Detail"]').first();
    await viewButton.click({ force: true });

    await expect(page).toHaveURL(/\/hmsi\/proker\//);

    const backButton = page.getByRole('link', { name: /kembali ke kelola proker/i });
    await backButton.click();

    await expect(page).toHaveURL(/\/hmsi\/kelola-proker/);
  });

  // =====================================================
  // CASE 2: MASUK HALAMAN EDIT PROKER
  // =====================================================
  test('Berhasil masuk halaman edit proker', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await expect(page.locator('table')).toBeVisible();

    const editButton = page.locator('a[title="Edit"]:not([disabled])').first();
    await editButton.click();

    await expect(page).toHaveURL(/\/edit/);
    await expect(
      page.getByRole('heading', { name: /edit program kerja/i })
    ).toBeVisible();
  });

  // =====================================================
  // CASE 3: EDIT PROKER DAN SIMPAN (AKSI FORM)
  // =====================================================
  test('Berhasil mengedit proker dan menyimpan perubahan', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await expect(page.locator('table')).toBeVisible();

    const editButton = page.locator('a[title="Edit"]:not([disabled])').first();
    await editButton.click();

    // Pastikan halaman edit terbuka
    await page.waitForURL(/\/edit/);
    await expect(page.getByRole('heading', { name: /edit/i })).toBeVisible({ timeout: 10000 });

    // ===== ISI FORM =====
    await page.fill('#namaProker', 'Proker Playwright Updated');
    await page.fill('#tanggal_mulai', '2025-01-10');
    await page.fill('#tanggal_selesai', '2025-01-20');
    await page.fill('#penanggungJawab', 'Divisi IT');
    await page.fill('#deskripsi', 'Deskripsi diupdate oleh Playwright');
    await page.fill('#targetKuantitatif', '100 peserta');
    await page.fill('#targetKualitatif', 'Meningkatkan kualitas anggota');

    // ===== SUBMIT =====
    await page.click('#submitBtn');

    // Tunggu response
    await page.waitForTimeout(2000);

    // Validasi: bisa modal sukses atau redirect ke kelola proker
    const successModal = page.locator('#successModal');
    const isModalVisible = await successModal.isVisible();
    
    if (isModalVisible) {
      await expect(successModal).toContainText(/berhasil/i);
      await page.click('#closeSuccessModal');
    }

    // Pastikan kembali ke halaman kelola proker
    await expect(page).toHaveURL(/\/hmsi\/kelola-proker/);
  });

  // =====================================================
  // CASE 4: HAPUS PROKER (FLOW MODAL)
  // =====================================================
  test('Berhasil menghapus program kerja', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await expect(page.locator('table')).toBeVisible();

    const deleteButton = page.locator('.delete-btn:not([disabled])').first();
    await deleteButton.click();

    const deleteModal = page.locator('#deleteModal');
    await expect(deleteModal).toBeVisible();

    await page.locator('#confirmDelete').click();

    // Tunggu proses delete
    await page.waitForTimeout(2000);

    // Validasi: modal sukses atau langsung update tabel
    const successModal = page.locator('#successDeleteModal');
    const isModalVisible = await successModal.isVisible();
    
    if (isModalVisible) {
      await page.locator('#closeSuccessDeleteModal').click();
    }

    // Pastikan masih di halaman kelola proker
    await expect(page).toHaveURL(/\/hmsi\/kelola-proker/);
  });

    // =====================================================
  // CASE 5: CARI PROGRAM KERJA (SEARCH)
  // =====================================================
  test('Berhasil mencari program kerja melalui search', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await expect(page.locator('table')).toBeVisible();

    // Isi search input
    const searchInput = page.locator('input[placeholder*="Cari"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Proker');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Pastikan ada hasil yang visible di tabel (gunakan selector untuk row yang visible)
    const visibleRows = page.locator('table tbody tr[data-visible="true"]');
    await expect(visibleRows.first()).toBeVisible();

    // Minimal ada teks "Proker" di hasil
    await expect(page.locator('table')).toContainText(/proker/i);
  });

  // =====================================================
  // CASE 6: VALIDASI TABEL KELOLA PROKER
  // =====================================================
  test('Berhasil menampilkan tabel program kerja', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    // Pastikan tabel dan baris ada
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  // =====================================================
  // CASE 7: FILTER PROKER - STATUS TERTENTU
  // =====================================================
  test('Berhasil memfilter program kerja berdasarkan status', async ({ page }) => {
    await loginAsHMSI(page);
    await goToKelolaProker(page);

    await page.locator('#dropdownButton').click();
    await page.getByRole('button', { name: 'Sedang Berjalan' }).click();

    // Tunggu data terfilter
    await page.waitForTimeout(500);

    const visibleRows = page.locator('#programTable tr[data-visible="true"]');
    const count = await visibleRows.count();

    for (let i = 0; i < count; i++) {
      const rowText = await visibleRows.nth(i).innerText();
      expect(rowText).toContain('Sedang Berjalan');
    }
  });

});
