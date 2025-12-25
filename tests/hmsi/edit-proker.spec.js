import { test, expect } from '@playwright/test';

test.describe('Edit Proker berdasarkan nama di Kelola Proker', () => {

  async function loginAsHMSI(page) {
    await page.goto('http://localhost:3000/auth/login');

    await page.getByPlaceholder('Masukkan username Anda (hmsi/dpa)')
      .fill('ridhooo@example.com');

    await page.getByPlaceholder('Masukkan password Anda')
      .fill('12345');

    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/hmsi/);
  }

  async function goToEditProker(page) {
    await page.goto('http://localhost:3000/hmsi/kelola-proker');
    await expect(page).toHaveURL(/\/hmsi\/kelola-proker/);
    await page.waitForLoadState('networkidle');

    const firstProkerRow = page.locator('tbody tr').first();
    await expect(firstProkerRow).toBeVisible({ timeout: 10000 });
    
    const editButton = firstProkerRow.locator('a[href*="/edit"], button:has-text("Edit"), a:has-text("Edit")').first();
    await editButton.click();
    
    await expect(page.getByRole('heading', { name: /edit program kerja/i })).toBeVisible({ timeout: 10000 });
  }

  test('Berhasil edit proker dengan nama tertentu', async ({ page }) => {
    const namaProkerBaru = `Proker Edited ${Date.now()}`;

    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill(namaProkerBaru);
    await page.locator('#deskripsi').fill('Deskripsi setelah diedit via Playwright');

    await page.getByRole('button', { name: /simpan/i }).click();

    const successModal = page.locator('#successModal');
    await expect(successModal).toBeVisible();
    await expect(successModal).toContainText(/berhasil disimpan/i);

    await page.getByRole('button', { name: /kembali/i }).click();

    await expect(page).toHaveURL(/\/hmsi\/kelola-proker/);
    await expect(page.locator('table')).toContainText(namaProkerBaru);
  });

  test('Edit proker dengan karakter spesial', async ({ page }) => {
    const namaProkerBaru = `Proker @#$% ${Date.now()}`;

    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill(namaProkerBaru);
    await page.locator('#deskripsi').fill('Deskripsi dengan @#$%^&*()');
    await page.locator('#penanggungJawab').fill('Ketua & Wakil HMSI');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan emoji', async ({ page }) => {
    const namaProkerBaru = `Proker Emoji 🎉 ${Date.now()}`;

    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill(namaProkerBaru);
    await page.locator('#deskripsi').fill('Deskripsi 📝✨🎯');
    await page.locator('#penanggungJawab').fill('Ketua 👨‍💼');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan perubahan tanggal', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#tanggal_mulai').fill('2026-06-01');
    await page.locator('#tanggal_selesai').fill('2026-06-15');
    await page.locator('#deskripsi').fill('Update tanggal pelaksanaan');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit penanggung jawab proker', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#penanggungJawab').fill('Koordinator Divisi Acara HMSI 2026');
    await page.locator('#deskripsi').fill('Update penanggung jawab');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit target kuantitatif proker', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#targetKuantitatif').fill('200 peserta mahasiswa');
    await page.locator('#deskripsi').fill('Update target kuantitatif');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit target kualitatif proker', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#targetKualitatif').fill('Meningkatkan soft skill mahasiswa');
    await page.locator('#deskripsi').fill('Update target kualitatif');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan text panjang', async ({ page }) => {
    const longText = 'Deskripsi yang panjang untuk menguji sistem. '.repeat(10);

    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker dengan nama panjang untuk testing');
    await page.locator('#deskripsi').fill(longText);

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan URL', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker Info https://hmsi.ac.id');
    await page.locator('#deskripsi').fill('Info lengkap: https://example.com/proker');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan email', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker Contact');
    await page.locator('#deskripsi').fill('Hubungi: admin@hmsi.ac.id');
    await page.locator('#penanggungJawab').fill('ketua@hmsi.ac.id');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan MiXeD CaSe', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('PROKER MiXeD CaSe');
    await page.locator('#deskripsi').fill('DeSKriPSi CaMpuRaN');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan dash dan underscore', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker-HMSI_2026');
    await page.locator('#deskripsi').fill('Program_Kerja-Utama');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan tanda kutip', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker "Unggulan"');
    await page.locator('#deskripsi').fill('Program "Terbaik" dan \'Teratas\'');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan angka', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('2026 Proker Tahun Baru');
    await page.locator('#deskripsi').fill('Proker untuk 100 peserta');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan simbol mata uang', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker Budget Rp 5.000.000');
    await page.locator('#deskripsi').fill('Dana: Rp 3.000.000 atau $500');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan persentase', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker Target 100%');
    await page.locator('#deskripsi').fill('Target 90% peserta hadir');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan newline', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('Proker Multi Line');
    await page.locator('#deskripsi').fill('Kegiatan:\n1. Pembukaan\n2. Inti\n3. Penutup');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit semua field proker sekaligus', async ({ page }) => {
    const namaProkerBaru = `Proker Complete ${Date.now()}`;

    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill(namaProkerBaru);
    await page.locator('#tanggal_mulai').fill('2026-07-01');
    await page.locator('#tanggal_selesai').fill('2026-07-15');
    await page.locator('#penanggungJawab').fill('Tim Koordinator HMSI');
    await page.locator('#deskripsi').fill('Update semua field proker');
    await page.locator('#targetKuantitatif').fill('150 peserta');
    await page.locator('#targetKualitatif').fill('Kompetensi 80%');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan spasi di awal dan akhir', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('  Proker dengan spasi  ');
    await page.locator('#deskripsi').fill('  Deskripsi dengan spasi  ');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

  test('Edit proker dengan nama singkat', async ({ page }) => {
    await loginAsHMSI(page);
    await goToEditProker(page);

    await page.locator('#namaProker').fill('ProkerX');
    await page.locator('#deskripsi').fill('Singkat');

    await page.getByRole('button', { name: /simpan/i }).click();
    await page.waitForTimeout(2000);
  });

});
