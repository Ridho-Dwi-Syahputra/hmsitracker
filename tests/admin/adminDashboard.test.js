// tests/admin/adminDashboard.test.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
    
    test.beforeEach(async ({ page }) => {
        // Login sebagai Admin
        await page.goto('http://localhost:3000/auth/login'); 
        await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
        await page.fill('#email', 'admin@example.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        
        // Tunggu redirect dan navigasi ke salah satu halaman admin
        await page.waitForURL(/\/admin\/(dashboard|profile|kelola-user|kelola-divisi|kelola-role)/, { timeout: 15000 });
    });

    // ======================================================================
    // Test 1: Verifikasi akses dashboard dan elemen utama muncul
    // ======================================================================
    test('01. Berhasil mengakses dashboard admin dan menampilkan elemen utama', async ({ page }) => {
        // Navigasi ke dashboard admin
        await page.goto('http://localhost:3000/admin/dashboard');
        
        // Verifikasi halaman dashboard berhasil di-load
        await expect(page.locator('h1', { hasText: 'Selamat Datang' })).toBeVisible({ timeout: 7000 });
        
        // Verifikasi title halaman
        await expect(page).toHaveTitle(/Dashboard Admin/);
        
        console.log('Dashboard admin berhasil dimuat');
    });

    // ======================================================================
    // Test 2: Verifikasi card Total User
    // ======================================================================
    test('02. Menampilkan card Total User dengan data', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForSelector('text=Total User', { timeout: 7000 });

        // Verifikasi ada angka/number yang ditampilkan di sebelah label
        const userCount = page.locator('text=Total User').locator('..').locator('p.text-2xl');
        await expect(userCount).toBeVisible();
        
        // Verifikasi icon user ada
        const userIcon = page.locator('.fa-users').first();
        await expect(userIcon).toBeVisible();
        
        console.log('Card Total User ditampilkan dengan benar');
    });

    // ======================================================================
    // Test 3: Verifikasi card Total Divisi
    // ======================================================================
    test('03. Menampilkan card Total Divisi dengan data', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForSelector('text=Total Divisi', { timeout: 7000 });

        // Verifikasi ada angka/number yang ditampilkan di sebelah label
        const divisiCount = page.locator('text=Total Divisi').locator('..').locator('p.text-2xl');
        await expect(divisiCount).toBeVisible();
        
        // Verifikasi icon sitemap ada
        const divisiIcon = page.locator('.fa-sitemap');
        await expect(divisiIcon).toBeVisible();
        
        console.log('Card Total Divisi ditampilkan dengan benar');
    });

    // ======================================================================
    // Test 4: Verifikasi section Aksi Cepat
    // ======================================================================
    test('04. Menampilkan section Aksi Cepat dengan link yang benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForSelector('text=Aksi Cepat', { timeout: 7000 });
        
        // Verifikasi heading Aksi Cepat muncul
        await expect(page.locator('text=Aksi Cepat')).toBeVisible();
        
        // Verifikasi card "Kelola Divisi" ada (di main content, bukan sidebar)
        const kelolaDivisiCard = page.locator('main a[href="/admin/kelola-divisi"]');
        await expect(kelolaDivisiCard).toBeVisible();

        // Verifikasi card "Kelola Role" ada
        const kelolaRoleCard = page.locator('main a[href="/admin/kelola-role"]');
        await expect(kelolaRoleCard).toBeVisible();

        // Verifikasi card "Profil Admin" ada
        const profilAdminCard = page.locator('main a[href="/admin/profile"]');
        await expect(profilAdminCard).toBeVisible();
        
        console.log('Section Aksi Cepat ditampilkan dengan benar');
    });

    // ======================================================================
    // Test 5: Klik link Profil Admin mengarah ke halaman profil admin
    // ======================================================================
    test('05. Klik Profil Admin mengarah ke halaman yang benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForSelector('text=Profil Admin', { timeout: 7000 });
        
        // Klik card Profil Admin
        await page.click('text=Profil Admin');
        
        // Verifikasi redirect ke halaman profil admin
        await page.waitForURL(/\/admin\/profile/, { timeout: 10000 });
        
        // Verifikasi halaman profil admin berhasil dimuat
        await expect(page.locator('h1', { hasText: 'Profil Admin' })).toBeVisible({ timeout: 7000 });
        
        console.log('Link Profil Admin berfungsi dengan benar');
    });

    // ======================================================================
    // Test 6: Klik link Kelola Divisi mengarah ke halaman kelola divisi
    // ======================================================================
    test('06. Klik Kelola Divisi mengarah ke halaman yang benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForSelector('text=Kelola Divisi', { timeout: 7000 });
        
        // Klik card Kelola Divisi
        await page.click('text=Kelola Divisi');
        
        // Verifikasi redirect ke halaman kelola divisi
        await page.waitForURL(/\/admin\/kelola-divisi/, { timeout: 10000 });
        
        // Verifikasi halaman kelola divisi berhasil dimuat
        await expect(page.locator('h1', { hasText: 'Kelola Divisi' })).toBeVisible({ timeout: 7000 });
        
        console.log('Link Kelola Divisi berfungsi dengan benar');
    });

    // ======================================================================
    // Test 7: Verifikasi navbar admin muncul
    // ======================================================================
    test('07. Navbar admin ditampilkan dengan benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Verifikasi title navbar "Admin Panel" muncul (h1)
        const logo = page.locator('h1', { hasText: 'Admin Panel' });
        await expect(logo).toBeVisible({ timeout: 7000 });
        
        console.log('Navbar admin ditampilkan dengan benar');
    });

    // ======================================================================
    // Test 8: Verifikasi sidebar admin muncul
    // ======================================================================
    test('08. Sidebar admin ditampilkan dengan navigasi yang benar', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Verifikasi menu Dashboard aktif (highlighted) - di sidebar, bukan main
        const dashboardMenu = page.locator('aside a[href="/admin/dashboard"], nav a[href="/admin/dashboard"]').first();
        await expect(dashboardMenu).toBeVisible({ timeout: 7000 });
        
        // Verifikasi menu Kelola User ada di sidebar
        const kelolaUserMenu = page.locator('aside a[href="/admin/kelola-user"], nav a[href="/admin/kelola-user"]').first();
        await expect(kelolaUserMenu).toBeVisible();
        
        // Verifikasi menu Kelola Divisi ada di sidebar
        const kelolaDivisiMenu = page.locator('aside a[href="/admin/kelola-divisi"], nav a[href="/admin/kelola-divisi"]').first();
        await expect(kelolaDivisiMenu).toBeVisible();
        
        console.log('Sidebar admin ditampilkan dengan navigasi yang benar');
    });
});
