// tests/admin/profileController.test.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Profile Management', () => {
    
    test.beforeEach(async ({ page }) => {
        // Login sebagai Admin
        await page.goto('http://localhost:3000/auth/login'); 
        await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
        await page.fill('#email', 'admin@example.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        
        // Tunggu redirect
        await page.waitForURL(/\/admin\/(dashboard|profile)/, { timeout: 10000 });
    });

    // ======================================================================
    // Test 1: Mengakses halaman profil admin
    // ======================================================================
    test('01. Berhasil mengakses halaman profil admin', async ({ page }) => {
        // Navigasi ke halaman profil
        await page.goto('http://localhost:3000/admin/profile');
        
        // Verifikasi halaman profil berhasil di-load
        await expect(page.locator('h1', { hasText: 'Profil Admin' })).toBeVisible({ timeout: 7000 });
        
        // Verifikasi title halaman
        await expect(page).toHaveTitle(/Profil Admin/);

    });

    // ======================================================================
    // Test 2: Menampilkan informasi profil admin
    // ======================================================================
    test('02. Menampilkan informasi profil admin dengan benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile');
        await page.waitForSelector('h1:has-text("Profil Admin")', { timeout: 7000 });
        
        // Verifikasi foto profil ditampilkan
        const fotoProfile = page.locator('main img[alt="Foto Profil"]');
        await expect(fotoProfile).toBeVisible();
        
        // Verifikasi ada informasi NIM
        const nimLabel = page.locator('text=NIM:');
        await expect(nimLabel).toBeVisible();
        
        // Verifikasi ada nama user (dalam h2)
        const namaHeading = page.locator('main h2');
        await expect(namaHeading).toBeVisible();
        
        // Verifikasi ada informasi Email
        const emailLabel = page.locator('main').getByText('Email');
        await expect(emailLabel).toBeVisible();
        
        // Verifikasi ada informasi Role
        const roleLabel = page.locator('main').getByText('Role');
        await expect(roleLabel).toBeVisible();

    });

    // ======================================================================
    // Test 3: Klik tombol Edit Profil mengarah ke halaman edit
    // ======================================================================
    test('03. Tombol Edit Profil mengarah ke halaman edit', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile');
        await page.waitForSelector('h1:has-text("Profil Admin")', { timeout: 7000 });
        
        // Cari dan klik tombol Edit Profil
        const editButton = page.locator('a[href="/admin/profile/edit"], button:has-text("Edit Profil")').first();
        await expect(editButton).toBeVisible();
        await editButton.click();
        
        // Verifikasi redirect ke halaman edit profil
        await page.waitForURL(/\/admin\/profile\/edit/, { timeout: 10000 });
        
        // Verifikasi halaman edit profil berhasil dimuat
        await expect(page.locator('h1', { hasText: 'Edit Profil' })).toBeVisible({ timeout: 7000 });

    });

    // ======================================================================
    // Test 4: Menampilkan form edit profil dengan data yang benar
    // ======================================================================
    test('04. Form edit profil menampilkan data admin yang benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('h1:has-text("Edit Profil")', { timeout: 7000 });
        
        // Verifikasi form ada
        const form = page.locator('main form');
        await expect(form).toBeVisible();
        
        // Verifikasi input NIM/ID ada dan terisi
        const nimInput = page.locator('input[name="id_anggota"]');
        await expect(nimInput).toBeVisible();
        const nimValue = await nimInput.inputValue();
        expect(nimValue).not.toBe('');
        
        // Verifikasi input Nama ada dan terisi
        const namaInput = page.locator('input[name="nama"]');
        await expect(namaInput).toBeVisible();
        const namaValue = await namaInput.inputValue();
        expect(namaValue).not.toBe('');
        
        // Verifikasi input Email ada dan terisi
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toBeVisible();
        const emailValue = await emailInput.inputValue();
        expect(emailValue).not.toBe('');

    });

    // ======================================================================
    // Test 5: Berhasil mengedit nama profil admin
    // ======================================================================
    test('05. Berhasil mengedit nama profil admin', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('input[name="nama"]', { timeout: 7000 });
        
        // Ambil nama asli untuk restore nanti
        const originalName = await page.locator('input[name="nama"]').inputValue();
        
        // Edit nama
        const newName = `Admin Test ${Date.now().toString().slice(-4)}`;
        await page.fill('input[name="nama"]', newName);
        
        // Submit form
        await page.locator('#editProfileForm button[type="submit"]').click();
        
        // Tunggu success modal muncul
        await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
        
        // Klik tombol untuk kembali ke profil
        await page.locator('#closeSuccessModal').click();
        
        // Verifikasi redirect ke halaman profil
        await page.waitForURL(/\/admin\/profile$/, { timeout: 10000 });
        
        // Verifikasi nama baru ditampilkan di profil
        await expect(page.locator(`main h2:has-text("${newName}")`)).toBeVisible({ timeout: 7000 });
        
        // Restore nama asli
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('input[name="nama"]', { timeout: 7000 });
        await page.fill('input[name="nama"]', originalName);
        await page.locator('#editProfileForm button[type="submit"]').click();
        
        // Tunggu success modal dan close
        await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
        await page.locator('#closeSuccessModal').click();
        await page.waitForURL(/\/admin\/profile$/, { timeout: 10000 });

    });

    // ======================================================================
    // Test 6: Validasi form - nama tidak boleh kosong
    // ======================================================================
    test('06. Gagal submit form dengan nama kosong', async ({ page }) => {
        // Buka form edit profil
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('input[name="nama"]', { timeout: 7000 });

        // Kosongkan nama
        await page.fill('input[name="nama"]', '');

        // Submit via native form.submit() to bypass HTML5 validation & AJAX
        await page.evaluate(() => {
            const form = document.getElementById('editProfileForm');
            form?.submit();
        });

        // Tunggu redirect dan render halaman edit kembali
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('h1:has-text("Edit Profil")', { timeout: 7000 });
        await expect(page).toHaveURL(/\/admin\/profile\/edit/);

        // Cukup pastikan tetap di halaman edit (indikasi validasi server aktif)
        await expect(page.locator('main h1:has-text("Edit Profil")')).toBeVisible();

    });

    // ======================================================================
    // Test 7: Validasi password dan konfirmasi password harus sama
    // ======================================================================
    test('07. Gagal submit jika password dan konfirmasi tidak sama', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('input[name="password"]', { timeout: 7000 });

        // Isi password berbeda
        await page.fill('input[name="password"]', 'password123');
        await page.fill('input[name="confirm_password"]', 'password456');

        // Submit via native form.submit() to bypass HTML5 validation & AJAX
        await page.evaluate(() => {
            const form = document.getElementById('editProfileForm');
            form?.submit();
        });

        // Tunggu redirect dan render halaman edit kembali
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('h1:has-text("Edit Profil")', { timeout: 7000 });
        await expect(page).toHaveURL(/\/admin\/profile\/edit/);

        // Cukup pastikan tetap di halaman edit (indikasi validasi server aktif)
        await expect(page.locator('main h1:has-text("Edit Profil")')).toBeVisible();

    });

    // ======================================================================
    // Test 8: Tombol Batal mengarah kembali ke halaman profil
    // ======================================================================
    test('08. Tombol Batal mengarah kembali ke halaman profil', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/profile/edit');
        await page.waitForSelector('h1:has-text("Edit Profil")', { timeout: 7000 });
        
        // Cari dan klik tombol Batal
        const cancelButton = page.locator('main a[href="/admin/profile"]').first();
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();
        
        // Verifikasi redirect ke halaman profil
        await page.waitForURL(/\/admin\/profile$/, { timeout: 10000 });
        
        // Verifikasi halaman profil berhasil dimuat
        await expect(page.locator('h1', { hasText: 'Profil Admin' })).toBeVisible({ timeout: 7000 });

    });
});
