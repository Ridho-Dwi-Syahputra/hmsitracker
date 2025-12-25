// tests/admin/editAnggota_flexible.test.js
const { test, expect } = require('@playwright/test');


// --- DATA STATIS YANG HARUS ADA DI DB 
const STATIC_NIM = '99399530';
const INITIAL_ROLE = 'HMSI'; 
const INTERNAL_DIVISI_NAME = 'Internal';

// --- DATA UNTUK EDIT SENSITIF & CLEANUP
const ORIGINAL_EMAIL_FOR_CLEANUP = 'testuser79399530@example.com'; // Email awal user 99399530
const ORIGINAL_PASS_FOR_CLEANUP = 'admin123'; // Password awal (Asumsi: harus cocok dengan hash di DB)
const NEW_EMAIL_FOR_TEST = `new_email_${Date.now().toString().slice(-6)}@test.com`; 
const NEW_PASSWORD_FOR_TEST = 'newpassword123';

// --- VARIABEL DINAMIS 
let currentName = '';
let currentEmail = '';

// --- DATA PERUBAHAN NAMA ---
const EDITED_NAME = `Nama Diubah ${Date.now().toString().slice(-4)}`; // Nama baru yang unik


test.describe.serial('Admin Edit Anggota: Combined Scenarios', () => {
    
    test.beforeEach(async ({ page }) => {
        // 1. Login sebagai Admin (Pre-condition untuk semua tes)
        await page.goto('http://localhost:3000/auth/login'); 
        await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
        await page.fill('#email', 'admin@example.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin\/(dashboard|kelola-user)/, { timeout: 10000 });
    });

    // ======================================================================
    // SKEMA 1: SETUP (Membaca Data Awal & Reset Role/Divisi)
    // ======================================================================
    test('01. Setup: Baca Data Awal dan Reset Role/Divisi', async ({ page }) => {
        console.log(`Setup: Mengambil data NIM ${STATIC_NIM} dan memastikan Role.`);
        await page.goto('http://localhost:3000/admin/kelola-user');

        const userRow = page.locator('table tbody tr', { hasText: STATIC_NIM });
        await expect(userRow).toBeVisible();

        // Navigasi ke halaman Edit
        const editButton = userRow.locator(`a[href$="/admin/user/edit/${STATIC_NIM}"]`);
        await editButton.click();
        
        await page.waitForURL(url => url.pathname.includes(`/admin/user/edit/${STATIC_NIM}`), { timeout: 10000 });
        
        // 🛑 LANKAH KRITIS: Ambil Nama dan Email yang DITERIMA dari server (input value)
        currentName = await page.locator('input[name="nama"]').inputValue();
        currentEmail = await page.locator('input[name="email"]').inputValue();
        
        console.log(`   Data awal ditemukan: Nama="${currentName}", Email="${currentEmail}"`);


        // --- Atur Ulang Role/Divisi ke kondisi baseline (HMSI/Internal) 
        // (Ini juga memastikan Nama/Email awal disimpan di database dengan nilai yang baru dibaca)
        await page.click('#roleDropdownBtn');
        await page.click(`#roleDropdownMenu button[data-value="${INITIAL_ROLE}"]`); 
        
        await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 5000 });
        await page.click('#divisiDropdownBtn');
        await page.locator('#divisiDropdownMenu button', { hasText: INTERNAL_DIVISI_NAME }).click();
        
        // Submit reset Role/Divisi
        await page.locator('#editUserForm button[type="submit"]').click();
        await page.locator('#successModalContent').waitFor({ state: 'visible', timeout: 5000 });
        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-user/, { timeout: 5000 });
        console.log(`   Reset Role/Divisi berhasil. Test 01 Selesai.`);
    });
    
    // ======================================================================
    // SKEMA 2: EDIT NAMA 
    // ======================================================================
    test('02. Berhasil mengedit Nama Lengkap saja', async ({ page }) => {
        console.log(`Memulai tes edit Nama Lengkap saja (${STATIC_NIM})...`);
        
        if (!currentName || !currentEmail) {
             throw new Error("Setup gagal, currentName atau currentEmail tidak terset.");
        }

        await page.goto('http://localhost:3000/admin/kelola-user');

        // 1. Navigasi ke halaman Edit
        console.log(`Mencari tombol edit untuk Nama: ${currentName}...`);
        const userRow = page.locator('table tbody tr', { hasText: STATIC_NIM });
        
        // Verifikasi Nama LAMA sebelum mengklik Edit
        await expect(userRow).toContainText(currentName); 
        
        const editButton = userRow.locator(`a[href$="/admin/user/edit/${STATIC_NIM}"]`);
        await editButton.click();
        
        await page.waitForURL(url => url.pathname.includes(`/admin/user/edit/${STATIC_NIM}`), { timeout: 10000 });
        
        // 2. Edit HANYA Nama Lengkap
        console.log(`Mengubah nama dari ${currentName} menjadi ${EDITED_NAME}...`);
        await page.fill('input[name="nama"]', EDITED_NAME);
        
        // Mengisi ulang Email (field wajib) dengan nilai yang ADA SEBELUMNYA
        await page.fill('input[name="email"]', currentEmail); 
        
        // 3. Submit Form
        console.log('Melakukan submit edit nama...');
        await page.locator('#editUserForm button[type="submit"]').click();
        
        // 4. Verifikasi Success Modal
        await page.locator('#successModalContent').waitFor({ state: 'visible', timeout: 5000 });
        await expect(page.locator('#successModalContent h3')).toContainText('Berhasil Disimpan!');
        
        await page.waitForTimeout(500); // Jeda singkat untuk commit
        
        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-user/, { timeout: 5000 });
        
        // 5. Verifikasi data di halaman Kelola User
        const updatedRow = page.locator('table tbody tr', { hasText: STATIC_NIM });
        
        // Cek Nama BARU 
        await expect(updatedRow).toContainText(EDITED_NAME); 
        
        // Cek bahwa Email dan Role/Divisi TIDAK BERUBAH
        await expect(updatedRow).toContainText(currentEmail); 
        await expect(updatedRow).toContainText(INITIAL_ROLE);
        await expect(updatedRow).toContainText(INTERNAL_DIVISI_NAME);
        
        // 🛑 UPDATE currentName setelah edit berhasil (penting untuk tes berikutnya)
        currentName = EDITED_NAME;

        console.log('Verifikasi edit Nama Lengkap saja berhasil. Nama baru: ' + currentName);
    });

    // ======================================================================
    // SKEMA 3: EDIT EMAIL & PASSWORD (Memastikan Update Sensitif)
    // ======================================================================
    test('03. Berhasil mengedit Email dan Password', async ({ page }) => {
        console.log(`Memulai tes edit Email dan Password untuk NIM ${STATIC_NIM}...`);
        await page.goto('http://localhost:3000/admin/kelola-user');

        // 1. Navigasi ke halaman Edit
        const userRow = page.locator('table tbody tr', { hasText: STATIC_NIM });
        const editButton = userRow.locator(`a[href$="/admin/user/edit/${STATIC_NIM}"]`);
        await editButton.click();
        
        await page.waitForURL(url => url.pathname.includes(`/admin/user/edit/${STATIC_NIM}`), { timeout: 10000 });
        
        // 2. Edit Email dan Password
        console.log('Mengubah Email dan Password...');
        await page.fill('input[name="email"]', NEW_EMAIL_FOR_TEST);
        await page.fill('input[name="password"]', NEW_PASSWORD_FOR_TEST);
        
        // 3. Submit Form
        await page.locator('#editUserForm button[type="submit"]').click();
        
        // 4. Verifikasi Success Modal
        await page.locator('#successModalContent').waitFor({ state: 'visible', timeout: 5000 });
        await expect(page.locator('#successModalContent h3')).toContainText('Berhasil Disimpan!');

        // 5. Tutup modal dan verifikasi data di halaman Kelola User
        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-user/, { timeout: 5000 });
        
        const updatedRow = page.locator('table tbody tr', { hasText: STATIC_NIM });
        
        // Verifikasi Email BARU
        await expect(updatedRow).toContainText(NEW_EMAIL_FOR_TEST); 
        // Verifikasi Nama (yang diubah di tes 02) TIDAK BERUBAH
        await expect(updatedRow).toContainText(currentName); 

        console.log('   Edit Email dan Password berhasil.');
    });

    // ======================================================================
    // SKEMA 4: VERIFIKASI LOGIN & CLEANUP
    // ======================================================================
    test('04. Verifikasi Login dan Cleanup', async ({ page }) => {
        
        // --- A. Verifikasi Login dengan Password Baru ---
        console.log('A. Verifikasi login menggunakan Password Baru...');
        
        // Logout Admin
        await page.goto('http://localhost:3000/auth/login'); 

        // Coba Login dengan Email BARU dan Password BARU
        await page.fill('#email', NEW_EMAIL_FOR_TEST);
        await page.fill('#password', NEW_PASSWORD_FOR_TEST);
        await page.click('button[type="submit"]');

        // Tunggu redirect ke halaman dashboard user (asumsi /dashboard jika berhasil)
        await page.waitForURL(/\/dashboard/, { timeout: 10000 }); 
        
        await expect(page).toHaveURL(/dashboard/);
        console.log('   Verifikasi berhasil: Login dengan password baru sukses.');

        // --- B. Cleanup: Kembalikan Email dan Password ke kondisi awal ---
        console.log('B. Cleanup: Mengembalikan data ke Email/Password awal...');
        
        // Re-login sebagai Admin (menggunakan kredensial Admin)
        await page.goto('http://localhost:3000/auth/login'); 
        await page.fill('#email', 'admin@example.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin\/(dashboard|kelola-user)/, { timeout: 10000 });

        // Navigasi ke halaman Edit dan Reset
        await page.goto('http://localhost:3000/admin/user/edit/' + STATIC_NIM);
        await page.waitForURL(url => url.pathname.includes(`/admin/user/edit/${STATIC_NIM}`), { timeout: 10000 });

        // Reset ke nilai awal
        await page.fill('input[name="email"]', ORIGINAL_EMAIL_FOR_CLEANUP);
        await page.fill('input[name="password"]', ORIGINAL_PASS_FOR_CLEANUP); 
        
        // Submit Cleanup
        await page.locator('#editUserForm button[type="submit"]').click();
        await page.locator('#successModalContent').waitFor({ state: 'visible', timeout: 5000 });
        await page.click('#closeSuccessModal');
        
        console.log('   Cleanup berhasil. Data dikembalikan ke kondisi awal.');
    });
});