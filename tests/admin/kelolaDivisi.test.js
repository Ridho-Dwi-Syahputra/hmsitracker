// tests/admin/kelolaDivisi.test.js
const { test, expect } = require('@playwright/test');

// --- DATA UNIK UNTUK PENGUJIAN ---
const UNIQUE_ID = Date.now().toString().slice(-4);
const NEW_DIVISI_NAME = `Test Divisi ${UNIQUE_ID}`;
const NEW_DIVISI_DESC = `Deskripsi untuk Divisi Test ${UNIQUE_ID}`;
const EDITED_DIVISI_NAME = `Test Divisi EDITED ${UNIQUE_ID}`;
const EDITED_DIVISI_DESC = `Deskripsi EDITED untuk Divisi Test ${UNIQUE_ID}`;

// --- Data yang akan digunakan untuk menguji kegagalan hapus (asumsi ada) ---
const IN_USE_DIVISI_NAME = 'HMSI'; 
const ERROR_MESSAGE_IN_USE = 'Divisi ini tidak dapat dihapus karena masih memiliki anggota terkait.';


test.describe.serial('Admin Kelola Divisi CRUD Operations', () => {
    
    test.beforeEach(async ({ page }) => {
        // 1. Login sebagai Admin
        await page.goto('http://localhost:3000/auth/login'); 
        await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
        await page.fill('#email', 'admin@example.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        
        // 2. Navigasi ke halaman Kelola Divisi
        await page.waitForURL(/\/admin\/(dashboard|kelola-divisi)/, { timeout: 10000 });
        await page.goto('http://localhost:3000/admin/kelola-divisi');
        await expect(page.locator('h1', { hasText: 'Kelola Divisi' })).toBeVisible(); 
    });

    // ======================================================================
    // SKEMA 1: Tambah Divisi Baru (Create)
    // ======================================================================
    test('01. Berhasil menambah divisi baru', async ({ page }) => {
        console.log(`Menambah divisi baru: ${NEW_DIVISI_NAME}`);

        await page.click('#btnTambahDivisi');
        const modal = page.locator('#divisiModal');
        await expect(modal).toBeVisible();

        await page.fill('#nama_divisi', NEW_DIVISI_NAME);
        await page.fill('#deskripsi', NEW_DIVISI_DESC);
        await page.locator('#divisiForm button[type="submit"]').click();

        // Verifikasi Success Modal muncul (memastikan AJAX sukses dan pesan benar)
        const successModal = page.locator('#successModal');
        await expect(successModal).toBeVisible();
        await expect(page.locator('#successMessage')).toContainText(`Divisi "${NEW_DIVISI_NAME}" berhasil ditambahkan!`); 

        // Tutup modal dan tunggu reload
        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-divisi/, { timeout: 10000 });

        // Verifikasi Divisi baru ada di tabel
        const newDivisiRow = page.locator('table tbody tr', { hasText: NEW_DIVISI_NAME });
        await expect(newDivisiRow).toBeVisible();
    });

    // ======================================================================
    // SKEMA 2: Edit Divisi (Update)
    // ======================================================================
    test('02. Berhasil mengedit nama dan deskripsi divisi', async ({ page }) => {
        console.log(`Mengedit divisi: ${NEW_DIVISI_NAME}`);

        const newDivisiRow = page.locator('table tbody tr', { hasText: NEW_DIVISI_NAME });
        await newDivisiRow.locator('.btnEditDivisi').click();

        const modal = page.locator('#divisiModal');
        await expect(modal).toBeVisible();

        await page.fill('#nama_divisi', EDITED_DIVISI_NAME);
        await page.fill('#deskripsi', EDITED_DIVISI_DESC);
        await page.locator('#divisiForm button[type="submit"]').click();

        // Verifikasi Success Modal muncul
        const successModal = page.locator('#successModal');
        await expect(successModal).toBeVisible();
        await expect(page.locator('#successMessage')).toContainText(`Divisi "${EDITED_DIVISI_NAME}" berhasil diperbarui!`); 

        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-divisi/, { timeout: 10000 });

        // Verifikasi Divisi yang diedit ada di tabel dengan nama BARU
        const editedDivisiRow = page.locator('table tbody tr', { hasText: EDITED_DIVISI_NAME });
        await expect(editedDivisiRow).toBeVisible();
        await expect(editedDivisiRow).toContainText(EDITED_DIVISI_DESC);
    });

    // ======================================================================
    // SKEMA 3: Search Filter
    // ======================================================================
    test('03. Berhasil mencari divisi yang diedit', async ({ page }) => {
        console.log(`Menguji fitur pencarian dengan: ${EDITED_DIVISI_NAME}`);

        await page.fill('#searchInput', EDITED_DIVISI_NAME);
        const editedDivisiRow = page.locator('table tbody tr', { hasText: EDITED_DIVISI_NAME });
        await expect(editedDivisiRow).toBeVisible();

        const otherDivisiRow = page.locator('table tbody tr', { hasText: IN_USE_DIVISI_NAME });
        await expect(otherDivisiRow).toBeHidden(); 

        await page.fill('#searchInput', '');
        await expect(editedDivisiRow).toBeVisible();
        await expect(otherDivisiRow).toBeVisible();
    });

    // ======================================================================
    // SKEMA 4: Hapus Divisi yang Berhasil (Cleanup dari Tes 01/02)
    // ======================================================================
    test('04. Berhasil menghapus divisi yang telah diuji', async ({ page }) => {
        console.log(`Menghapus divisi: ${EDITED_DIVISI_NAME}`);

        const editedDivisiRow = page.locator('table tbody tr', { hasText: EDITED_DIVISI_NAME });
        await editedDivisiRow.locator('.btnDeleteDivisi').click();

        const confirmModal = page.locator('#confirmDeleteModal');
        await expect(confirmModal).toBeVisible();

        // Klik tombol 'Ya, Hapus'
        await page.click('#confirmDeleteBtn'); 

        // Verifikasi Success Modal muncul
        const successModal = page.locator('#successModal');
        await expect(successModal).toBeVisible();
        await expect(page.locator('#successMessage')).toContainText('Divisi berhasil dihapus!'); 

        await page.click('#closeSuccessModal');
        await page.waitForURL(/\/admin\/kelola-divisi/, { timeout: 10000 });

        // Verifikasi Divisi sudah TIDAK ada di tabel
        await expect(page.locator('table tbody tr', { hasText: EDITED_DIVISI_NAME })).toHaveCount(0);
    });
    
    // ======================================================================
    // SKEMA 5: Gagal Hapus Divisi (Error Handling)
    // ======================================================================
    test('05. Gagal menghapus divisi yang masih memiliki anggota', async ({ page }) => {
        console.log(`Menguji kegagalan hapus pada divisi: ${IN_USE_DIVISI_NAME}`);

        const inUseDivisiRow = page.locator('table tbody tr', { hasText: IN_USE_DIVISI_NAME });
        await inUseDivisiRow.locator('.btnDeleteDivisi').click();

        const confirmModal = page.locator('#confirmDeleteModal');
        await expect(confirmModal).toBeVisible();

        // Klik tombol 'Ya, Hapus'
        await page.click('#confirmDeleteBtn');

        // Verifikasi Error Modal (Cannot Delete Modal) muncul
        const cannotDeleteModal = page.locator('#cannotDeleteModal');
        await expect(cannotDeleteModal).toBeVisible();
        
        // Verifikasi pesan error dari Controller
        await expect(page.locator('#cannotDeleteMessage')).toContainText(ERROR_MESSAGE_IN_USE); 

        await page.click('#closeCannotDeleteModalBtn');
        await expect(cannotDeleteModal).toBeHidden();
    });
});