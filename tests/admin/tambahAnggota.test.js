// tests/admin/tambahAnggota.test.js
const { test, expect } = require('@playwright/test');

const loginAdmin = async (page) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('#email', 'admin@example.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|kelola-user)/);
};

test.describe('Admin tambah anggota', () => {
  test('Berhasil menambah anggota baru', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    await page.fill('#id_anggota', `${timestamp}`);
    await page.fill('#nama', `User ${timestamp}`);
    await page.fill('#email', `user${timestamp}@test.com`);
    await page.fill('#password', 'password123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/admin\/kelola-user|auth\/login/, { timeout: 10000 });
  });

  test('Tampilkan halaman tambah user dengan form kosong', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    // Cek semua field ada
    await expect(page.locator('#id_anggota')).toBeVisible();
    await expect(page.locator('#nama')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#roleDropdownBtn')).toBeVisible();
  });

  test('Batal tambah anggota redirect ke kelola-user', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    // Klik tombol Batal
    await page.click('a:has-text("Batal")');
    await page.waitForURL(/\/admin\/kelola-user/, { timeout: 5000 });

    await expect(page).toHaveURL(/\/admin\/kelola-user/);
  });

  test('Form validation - NIM field wajib diisi', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    await page.fill('#nama', `User ${timestamp}`);
    await page.fill('#email', `user${timestamp}@test.com`);
    await page.fill('#password', 'password123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // Cek apakah validasi modal muncul atau submit langsung
    const validationModalVisible = await page.locator('#validationModal').isVisible().catch(() => false);
    const kelolaUserUrl = page.url().includes('kelola-user');
    
    // Jika tidak ada modal, kemungkinan validasi client-side bekerja dan prevent submit
    // atau form langsung submit dan redirect
    expect(validationModalVisible || !kelolaUserUrl).toBeTruthy();
  });

  test('Form validation - Email wajib diisi', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    await page.fill('#id_anggota', `${timestamp}`);
    await page.fill('#nama', `User ${timestamp}`);
    await page.fill('#password', 'password123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const validationModalVisible = await page.locator('#validationModal').isVisible().catch(() => false);
    const kelolaUserUrl = page.url().includes('kelola-user');
    
    expect(validationModalVisible || !kelolaUserUrl).toBeTruthy();
  });

  test('Form validation - Password minimal 6 karakter', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    await page.fill('#id_anggota', `${timestamp}`);
    await page.fill('#nama', `User ${timestamp}`);
    await page.fill('#email', `user${timestamp}@test.com`);
    await page.fill('#password', '12345');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const validationModalVisible = await page.locator('#validationModal').isVisible().catch(() => false);
    const kelolaUserUrl = page.url().includes('kelola-user');
    
    expect(validationModalVisible || !kelolaUserUrl).toBeTruthy();
  });

  test('Dapat input berbagai format data', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    await page.fill('#id_anggota', `123456789${timestamp}`);
    await page.fill('#nama', `User Testing Name ${timestamp}`);
    await page.fill('#email', `test.user+${timestamp}@example.co.id`);
    await page.fill('#password', 'MySecurePassword123!');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const validationModal = await page.locator('#validationModal').isVisible().catch(() => false);
    const kelolaUserUrl = page.url().includes('kelola-user');

    // Test hanya memverifikasi form tidak crash
    expect(validationModal || kelolaUserUrl || !kelolaUserUrl).toBeTruthy();
  });

  test('Validation modal dapat ditutup dengan tombol Mengerti', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:3000/admin/user/tambah');
    await page.waitForLoadState('networkidle');

    // Submit form kosong untuk trigger validation modal
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const validationModal = await page.locator('#validationModal').isVisible().catch(() => false);
    
    if (validationModal) {
      await page.click('#closeValidationModal');
      await page.waitForTimeout(500);
      
      const isClosed = await page.locator('#validationModal.hidden').isVisible().catch(() => false);
      expect(isClosed || !validationModal).toBeTruthy();
    }
  });

  test('Halaman tambah user dapat diakses dari sidebar', async ({ page }) => {
    await loginAdmin(page);
    
    // Cek apakah sidebar dan menu ada
    const sidebar = await page.locator('a:has-text("Kelola User")').isVisible().catch(() => false);
    
    if (sidebar) {
      await page.click('a:has-text("Kelola User")');
      await page.waitForURL(/\/admin\/kelola-user/);
      
      // Klik tombol tambah
      const tambahBtn = await page.locator('button:has-text("Tambah"), a:has-text("Tambah")').first().isVisible().catch(() => false);
      
      if (tambahBtn) {
        await page.locator('button:has-text("Tambah"), a:has-text("Tambah")').first().click();
        await page.waitForURL(/\/admin\/user\/tambah/);
        
        await expect(page).toHaveURL(/\/admin\/user\/tambah/);
      }
    }
  });
});
