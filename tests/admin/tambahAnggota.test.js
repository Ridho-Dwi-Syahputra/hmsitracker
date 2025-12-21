// tests/admin/tambahAnggota.test.js
const { test, expect } = require('@playwright/test');

test.describe('Admin tambah anggota', () => {
  // Gunakan ID unik untuk setiap pengujian agar tidak konflik di database
  const uniqueIdAnggota = `99${Date.now().toString().slice(-6)}`;
  // Membuat email unik untuk menghindari duplikasi saat testing
  const testEmail = `testuser${Date.now().toString().slice(-8)}@example.com`;
  const testUserName = 'Playwright Test User';

  test('Berhasil menambah anggota baru', async ({ page }) => {
    // 1️⃣ Login sebagai Admin
    console.log('1. Melakukan login...');
    await page.goto('http://localhost:3000/auth/login'); 

    // Isi kredensial
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
    await page.fill('#email', 'admin@example.com'); // Ganti dengan akun admin yang benar
    await page.fill('#password', 'admin123');  // Ganti dengan password yang benar

    // Submit login
    await page.click('button[type="submit"]');

    // Tunggu redirect ke halaman admin
    await page.waitForURL(/\/admin\/(dashboard|kelola-user)/, { timeout: 10000 });
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

    // 6️⃣ Submit Form dan Konfirmasi
    console.log('6. Melakukan submit form dan menunggu konfirmasi...');
    
    // PERBAIKAN: Menggunakan locator spesifik untuk tombol submit form
    await page.locator('#tambahUserForm button[type="submit"]').click();
    
    // Tunggu modal konfirmasi muncul
    await page.locator('#confirmationModalContent').waitFor({ state: 'visible', timeout: 5000 });
    console.log('   Modal konfirmasi muncul, mengkonfirmasi...');
    
    // PERBAIKAN: Klik tombol konfirmasi submit
    await page.click('#confirmSubmit'); 
    
    // 7️⃣ Verifikasi Hasil Akhir (Redirect dan Data)
    
    // Tunggu navigasi server ke halaman kelola user
    console.log('7. Menunggu redirect ke halaman kelola user...');
    await page.waitForURL(/\/admin\/kelola-user/, { timeout: 10000 });
    console.log('   Redirect berhasil ke halaman kelola user.');
    
    // 8️⃣ Cek Data User yang Baru Ditambahkan di Tabel
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
});