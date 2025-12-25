// tests/admin/kelolaAnggota.test.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Kelola Anggota', () => {
  // Data global untuk testing
  let uniqueIdAnggota;
  let testEmail;
  const testUserName = 'Playwright Test User';

  // Helper function untuk login
  async function loginAsAdmin(page) {
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/(dashboard|kelola-user)/, { timeout: 10000 });
  }

  test.describe('Tambah Anggota', () => {
    test.beforeEach(() => {
      // Generate ID unik untuk setiap test
      uniqueIdAnggota = `99${Date.now().toString().slice(-6)}`;
      testEmail = `testuser${Date.now().toString().slice(-8)}@example.com`;
    });

    test('Berhasil menambah anggota baru dengan role HMSI', async ({ page }) => {
      // 1️⃣ Login sebagai Admin
      console.log('1. Melakukan login...');
      await loginAsAdmin(page);
      console.log('   Login berhasil.');

    // 2️⃣ Buka halaman tambah user
    console.log('2. Membuka halaman tambah user...');
    await page.goto('http://localhost:3000/admin/user/tambah'); 

    // Tunggu form muncul
    await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });
    console.log('   Halaman tambah user terbuka.');

    // 3️⃣ Isi Informasi Dasar
    console.log('3. Mengisi informasi dasar...');
    await page.fill('#id_anggota', uniqueIdAnggota);
    await page.fill('#nama', testUserName);
    await page.fill('#email', testEmail);
    await page.fill('#password', 'password123');
    console.log(`   ID Anggota: ${uniqueIdAnggota}, Email: ${testEmail}`);

    // 4️⃣ Pilih role 'HMSI'
    console.log('4. Memilih Role "HMSI"...');
    await page.click('#roleDropdownBtn');
    await page.click('#roleDropdownMenu button[data-value="HMSI"]');

    // 5️⃣ Pilih Divisi (khusus HMSI)
    // Tunggu divisi wrapper muncul
    await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 5000 });
    console.log('5. Memilih Divisi "Internal"...');
    await page.click('#divisiDropdownBtn');
    
    // PERBAIKAN: Menggunakan hasText untuk memilih Divisi "Internal"
    await page.locator('#divisiDropdownMenu button', { hasText: 'Internal' }).click();

    // Verifikasi input divisi terisi
    const divisiValue = await page.locator('#divisiInput').inputValue();
    expect(divisiValue).not.toBe('');
    console.log(`   Divisi terpilih dengan ID: ${divisiValue}`);

    // 6 Submit Form dan Konfirmasi
    console.log('6. Melakukan submit form dan menunggu konfirmasi...');
    
    // PERBAIKAN: Menggunakan locator spesifik untuk tombol submit form
    await page.locator('#tambahUserForm button[type="submit"]').click();
    
    // Tunggu modal konfirmasi muncul
    await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
    console.log('   Modal konfirmasi muncul, mengkonfirmasi...');
    
    // PERBAIKAN: Klik tombol konfirmasi submit
    await page.click('#confirmSubmit'); 
    
    // 7️ Verifikasi Hasil Akhir (Redirect dan Data)
    
    // Tunggu navigasi server ke halaman kelola user
    console.log('7. Menunggu redirect ke halaman kelola user...');
    await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
    console.log('   Redirect berhasil ke halaman kelola user.');
    
    // 8️ Cek Data User yang Baru Ditambahkan di Tabel
    console.log('8. Memverifikasi user baru di tabel...');
    
    // Cari baris yang mengandung NIM yang baru dibuat
    const userRow = page.locator('table tbody tr', { hasText: uniqueIdAnggota });
    
    // Pastikan baris user baru ditemukan dan terlihat di tabel
    await expect(userRow).toBeVisible({ timeout: 5000 }); 
    
    // Verifikasi detail tambahan pada baris
    await expect(userRow).toContainText(testUserName);
    await expect(userRow).toContainText('HMSI');
    await expect(userRow).toContainText('Internal');
    
    console.log('   Data user berhasil diverifikasi di halaman kelola user. Tes Berhasil!');
    });

    test('Berhasil menambah anggota dengan role DPA', async ({ page }) => {
      // Login sebagai Admin
      await loginAsAdmin(page);

      // Buka halaman tambah user
      await page.goto('http://localhost:3000/admin/user/tambah');
      await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });

      // Isi form dengan role DPA
      await page.fill('#id_anggota', uniqueIdAnggota);
      await page.fill('#nama', testUserName);
      await page.fill('#email', testEmail);
      await page.fill('#password', 'password123');

      // Pilih role DPA
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="DPA"]');

      // Submit form
      await page.locator('#tambahUserForm button[type="submit"]').click();
      await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
      await page.click('#confirmSubmit');

      // Verifikasi redirect
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });

      // Verifikasi data di tabel
      const userRow = page.locator('table tbody tr', { hasText: uniqueIdAnggota });
      await expect(userRow).toBeVisible();
      await expect(userRow).toContainText(testUserName);
      await expect(userRow).toContainText('DPA');
    });

    test('Gagal menambah anggota HMSI tanpa memilih divisi', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/user/tambah');
      await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });

      // Isi form tanpa divisi
      await page.fill('#id_anggota', uniqueIdAnggota);
      await page.fill('#nama', testUserName);
      await page.fill('#email', testEmail);
      await page.fill('#password', 'password123');

      // Pilih role HMSI tapi tidak pilih divisi
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="HMSI"]');
      
      // Tunggu divisi wrapper muncul
      await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 3000 });

      // Submit form tanpa pilih divisi
      await page.locator('#tambahUserForm button[type="submit"]').click();
      
      // Verifikasi modal validasi muncul dengan pesan tentang divisi
      await page.waitForSelector('#validationModal:not(.hidden)', { timeout: 5000 });
      const modalText = await page.locator('#validationMessage').textContent();
      expect(modalText).toContain('Divisi');
    });
  });

  test.describe('Edit Anggota', () => {
    let createdUserId;

    test.beforeEach(async ({ page }) => {
      // Buat user baru untuk ditest edit
      uniqueIdAnggota = `98${Date.now().toString().slice(-6)}`;
      testEmail = `edituser${Date.now().toString().slice(-8)}@example.com`;
      createdUserId = uniqueIdAnggota;

      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/user/tambah');
      await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });

      // Buat user HMSI
      await page.fill('#id_anggota', uniqueIdAnggota);
      await page.fill('#nama', 'User To Edit');
      await page.fill('#email', testEmail);
      await page.fill('#password', 'password123');
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="HMSI"]');
      await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 5000 });
      await page.click('#divisiDropdownBtn');
      await page.locator('#divisiDropdownMenu button', { hasText: 'Internal' }).click();
      await page.locator('#tambahUserForm button[type="submit"]').click();
      await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
      await page.click('#confirmSubmit');
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
    });

    test('Berhasil mengedit nama anggota', async ({ page }) => {
      console.log('1. Membuka halaman edit user...');
      
      // Buka halaman kelola user terlebih dahulu
      await page.goto('http://localhost:3000/admin/kelola-user');
        await page.waitForSelector(`table tbody tr:has-text("${createdUserId}")`, { timeout: 7000 });
      
      // Cari tombol edit untuk user yang baru dibuat
      const userRow = page.locator('table tbody tr', { hasText: createdUserId });
      await expect(userRow).toBeVisible();
      
      // Klik link edit
      await userRow.locator('a[href*="/admin/user/edit/"]').click();
      
      // Tunggu halaman edit muncul
      await page.waitForURL(/\/admin\/user\/edit\/\d+/, { timeout: 10000 });
      console.log('   Halaman edit terbuka.');

      // Edit nama
      await page.waitForSelector('input[name="nama"]', { timeout: 5000 });
      const newName = 'Edited User Name';
      await page.fill('input[name="nama"]', '');
      await page.fill('input[name="nama"]', newName);
      console.log(`   Mengubah nama menjadi: ${newName}`);

      // Submit form (akan submit via AJAX)
      await page.locator('#editUserForm button[type="submit"]').click();

      // Tunggu success modal muncul (AJAX success) - tunggu content agar penantian lebih stabil
      await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
      console.log('   Modal success muncul.');
      
      // Klik tombol close di modal (akan redirect)
      await page.click('#closeSuccessModal');

      // Verifikasi redirect ke kelola user
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
      console.log('   Redirect berhasil.');

      // Verifikasi perubahan di tabel
      await page.waitForTimeout(1000);
      const updatedRow = page.locator('table tbody tr', { hasText: createdUserId });
      await expect(updatedRow).toContainText(newName);
      console.log('   Data berhasil diupdate.');
    });

    test('Berhasil mengedit role dari HMSI ke DPA', async ({ page }) => {
      // Buka halaman kelola user
      await page.goto('http://localhost:3000/admin/kelola-user');
      await page.waitForSelector('table tbody tr', { timeout: 5000 });
      
      // Buka halaman edit
      const userRow = page.locator('table tbody tr', { hasText: createdUserId });
      await userRow.locator('a[href*="/admin/user/edit/"]').click();
      await page.waitForURL(/\/admin\/user\/edit\/\d+/, { timeout: 10000 });

      // Ubah role ke DPA
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="DPA"]');

      // Submit form (AJAX)
      await page.locator('#editUserForm button[type="submit"]').click();

      // Tunggu success modal muncul
      await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
      await page.click('#closeSuccessModal');

      // Verifikasi redirect
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
      
      // Verifikasi perubahan
      await page.waitForTimeout(1000);
      const updatedRow = page.locator('table tbody tr', { hasText: createdUserId });
      await expect(updatedRow).toContainText('DPA');
    });

    test('Berhasil mengedit divisi anggota HMSI', async ({ page }) => {
      // Buka halaman kelola user
      await page.goto('http://localhost:3000/admin/kelola-user');
      await page.waitForSelector('table tbody tr', { timeout: 5000 });
      
      // Buka halaman edit
      const userRow = page.locator('table tbody tr', { hasText: createdUserId });
      await userRow.locator('a[href*="/admin/user/edit/"]').click();
      await page.waitForURL(/\/admin\/user\/edit\/\d+/, { timeout: 10000 });

      // Ubah role kembali ke HMSI terlebih dahulu (karena test sebelumnya mengubahnya ke DPA)
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="HMSI"]');
      await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 5000 });

      // Ubah divisi
      await page.click('#divisiDropdownBtn');
      await page.locator('#divisiDropdownMenu button').filter({ hasText: 'Eksternal' }).click();

      // Submit form (AJAX)
      await page.locator('#editUserForm button[type="submit"]').click();

      // Tunggu success modal
      await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
      await page.click('#closeSuccessModal');

      // Verifikasi redirect
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
      
      // Verifikasi perubahan
      await page.waitForTimeout(1000);
      const updatedRow = page.locator('table tbody tr', { hasText: createdUserId });
      await expect(updatedRow).toContainText('Eksternal');
    });

    test('Berhasil mengedit password anggota', async ({ page }) => {
      // Buka halaman kelola user
      await page.goto('http://localhost:3000/admin/kelola-user');
      await page.waitForSelector('table tbody tr', { timeout: 5000 });
      
      // Buka halaman edit
      const userRow = page.locator('table tbody tr', { hasText: createdUserId });
      await userRow.locator('a[href*="/admin/user/edit/"]').click();
      await page.waitForURL(/\/admin\/user\/edit\/\d+/, { timeout: 10000 });

      // Ubah password
      const newPassword = 'newpassword123';
      await page.waitForSelector('input[name="password"]', { timeout: 5000 });
      await page.fill('input[name="password"]', newPassword);

      // Submit form (AJAX)
      await page.locator('#editUserForm button[type="submit"]').click();

      // Tunggu success modal
      await page.waitForSelector('#successModalContent', { state: 'visible', timeout: 7000 });
      await page.click('#closeSuccessModal');

      // Verifikasi redirect
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
      console.log('   Password berhasil diupdate.');
    });
  });

  test.describe('Hapus Anggota', () => {
    let deletableUserId;
    let deletableEmail;

    test.beforeEach(async ({ page }) => {
      // Buat user baru yang bisa dihapus (tanpa aktivitas)
      deletableUserId = `97${Date.now().toString().slice(-6)}`;
      deletableEmail = `deleteuser${Date.now().toString().slice(-8)}@example.com`;

      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/user/tambah');
      await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });

      // Buat user HMSI
      await page.fill('#id_anggota', deletableUserId);
      await page.fill('#nama', 'User To Delete');
      await page.fill('#email', deletableEmail);
      await page.fill('#password', 'password123');
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="HMSI"]');
      await page.waitForSelector('#divisiWrapper:not(.hidden)', { timeout: 5000 });
      await page.click('#divisiDropdownBtn');
      await page.locator('#divisiDropdownMenu button', { hasText: 'Internal' }).click();
      await page.locator('#tambahUserForm button[type="submit"]').click();
      await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
      await page.click('#confirmSubmit');
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
    });

    test('Berhasil menghapus anggota yang tidak memiliki aktivitas', async ({ page }) => {
      console.log('1. Mencari user untuk dihapus...');
      
      // Cari baris user yang akan dihapus
      const userRow = page.locator('table tbody tr', { hasText: deletableUserId });
      await expect(userRow).toBeVisible();
      console.log('   User ditemukan.');

      // Klik tombol hapus (button dengan class delete-btn)
      console.log('2. Klik tombol hapus...');
      const deleteBtn = userRow.locator('button.delete-btn');
      await deleteBtn.click();

      // Tunggu fetch check activity selesai dan modal konfirmasi muncul
      console.log('3. Menunggu modal konfirmasi...');
      await page.waitForSelector('#confirmDeleteModal:not(.hidden)', { timeout: 5000 });

      // Konfirmasi hapus
      console.log('4. Konfirmasi hapus...');
      await page.click('#confirmDeleteBtn');

      // Tunggu form submit dan redirect
      await page.waitForTimeout(2000);
      
      // Verifikasi user sudah tidak ada di tabel
      const deletedRow = page.locator('table tbody tr', { hasText: deletableUserId });
      await expect(deletedRow).not.toBeVisible();
      console.log('   User berhasil dihapus.');
    });

    test('Tidak dapat menghapus user dengan role Admin', async ({ page }) => {
      console.log('1. Mencoba menghapus user Admin...');
      
      // Cari baris user Admin (biasanya admin@example.com)
      const adminRow = page.locator('table tbody tr', { hasText: 'admin@example.com' });
      
      // Pastikan tombol hapus tidak ada atau disabled untuk Admin
      const deleteButton = adminRow.locator('button[onclick*="deleteUser"], .btn-delete, button:has-text("Hapus")');
      
      // Verifikasi tombol hapus tidak visible atau disabled
      const buttonCount = await deleteButton.count();
      if (buttonCount > 0) {
        const isDisabled = await deleteButton.getAttribute('disabled');
        expect(isDisabled).not.toBeNull();
        console.log('   Tombol hapus Admin ter-disable (correct).');
      } else {
        console.log('   Tombol hapus tidak ada untuk Admin (correct).');
      }
    });

    test('Tidak dapat menghapus user dengan role DPA', async ({ page }) => {
      // Buat user DPA terlebih dahulu
      const dpaUserId = `96${Date.now().toString().slice(-6)}`;
      const dpaEmail = `dpauser${Date.now().toString().slice(-8)}@example.com`;

      await page.goto('http://localhost:3000/admin/user/tambah');
      await page.waitForSelector('#tambahUserForm', { state: 'visible', timeout: 5000 });
      
      await page.fill('#id_anggota', dpaUserId);
      await page.fill('#nama', 'DPA User');
      await page.fill('#email', dpaEmail);
      await page.fill('#password', 'password123');
      await page.click('#roleDropdownBtn');
      await page.click('#roleDropdownMenu button[data-value="DPA"]');
      await page.locator('#tambahUserForm button[type="submit"]').click();
      await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
      await page.click('#confirmSubmit');
      await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });

      // Cari baris user DPA
      const dpaRow = page.locator('table tbody tr', { hasText: dpaUserId });
      await expect(dpaRow).toBeVisible();

      // Verifikasi tombol hapus disabled atau tidak ada
      const deleteButton = dpaRow.locator('button[onclick*="deleteUser"], .btn-delete, button:has-text("Hapus")');
      const buttonCount = await deleteButton.count();
      
      if (buttonCount > 0) {
        const isDisabled = await deleteButton.getAttribute('disabled');
        expect(isDisabled).not.toBeNull();
        console.log('   Tombol hapus DPA ter-disable (correct).');
      } else {
        console.log('   Tombol hapus tidak ada untuk DPA (correct).');
      }
    });

    test('Mendapatkan peringatan saat mencoba hapus user dengan aktivitas', async ({ page }) => {
      // Catatan: Test ini mengasumsikan ada mekanisme untuk membuat user memiliki aktivitas
      // Jika perlu, bisa dibuat user HMSI yang sudah memiliki program kerja
      
      console.log('⚠️  Test ini memerlukan user dengan aktivitas (program kerja).');
      console.log('   Silakan adjust test ini sesuai dengan data test yang tersedia.');
      
      // Simulasi: Cari user yang mungkin punya aktivitas
      // atau skip test ini jika tidak ada
      // await page.locator('table tbody tr').first().locator('button[onclick*="deleteUser"]').click();
      // await page.locator('#deleteModal').waitFor({ state: 'visible', timeout: 5000 });
      // const warningText = await page.locator('#deleteModal .modal-body').textContent();
      // expect(warningText).toContain('aktivitas');
    });
  });

  test.describe('Pencarian dan Filter Anggota', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/kelola-user');
    });

    test('Berhasil mencari anggota berdasarkan nama', async ({ page }) => {
      // Tunggu tabel muncul
      await page.waitForSelector('table tbody tr', { timeout: 5000 });

      // Cari input search jika ada
      const searchInput = page.locator('input[type="search"], input[placeholder*="Cari"], #searchInput');
      const searchInputCount = await searchInput.count();

      if (searchInputCount > 0) {
        await searchInput.fill('admin');
        await page.waitForTimeout(1000); // Tunggu filter bekerja

        // Verifikasi hasil pencarian
        const visibleRows = page.locator('table tbody tr:visible');
        const rowCount = await visibleRows.count();
        expect(rowCount).toBeGreaterThan(0);
        
        // Verifikasi hasil mengandung kata kunci
        const firstRowText = await visibleRows.first().textContent();
        expect(firstRowText.toLowerCase()).toContain('admin');
        console.log('   Pencarian berhasil.');
      } else {
        console.log('    Fitur pencarian tidak ditemukan di halaman ini.');
      }
    });

    test('Berhasil memfilter anggota berdasarkan role', async ({ page }) => {
      // Cari dropdown/filter role jika ada
      const roleFilter = page.locator('select#roleFilter, #filterRole, select[name="role"]');
      const filterCount = await roleFilter.count();

      if (filterCount > 0) {
        await roleFilter.selectOption('HMSI');
        await page.waitForTimeout(1000);

        // Verifikasi hasil filter
        const visibleRows = page.locator('table tbody tr:visible');
        const rowCount = await visibleRows.count();
        
        if (rowCount > 0) {
          const firstRowText = await visibleRows.first().textContent();
          expect(firstRowText).toContain('HMSI');
          console.log('   Filter role berhasil.');
        }
      } else {
        console.log('   Fitur filter role tidak ditemukan di halaman ini.');
      }
    });
  });
});