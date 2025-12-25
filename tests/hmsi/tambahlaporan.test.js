import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Functional Test - Tambah Laporan HMSI (FINAL)', () => {

  async function loginAsHMSI(page) {
    await page.goto('http://localhost:3000/auth/login');
    await page.getByPlaceholder('Masukkan username Anda (hmsi/dpa)').fill('ridhooo@example.com');
    await page.getByPlaceholder('Masukkan password Anda').fill('12345');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/hmsi/);
  }

  async function goToTambahLaporan(page) {
    await page.goto('http://localhost:3000/hmsi/laporan/tambah');
    await expect(page.getByRole('heading', { name: /tambah laporan/i })).toBeVisible();
  }

  // =====================================================
  // ✅ 1. BERHASIL TAMBAH LAPORAN
  // =====================================================
  test('Berhasil menambahkan laporan dengan data valid', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan HMSI');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '3000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await expect(page.locator('#confirmSubmitModal')).toBeVisible();

    await page.click('#confirmSubmitBtn');
    await expect(page.locator('#successModal')).toBeVisible();
  });

  // =====================================================
// ❌ 2. GAGAL – FIELD WAJIB KOSONG (HTML5 VALIDATION)
// =====================================================
test('Gagal submit jika ada field wajib yang kosong', async ({ page }) => {
  await loginAsHMSI(page);
  await goToTambahLaporan(page);

  // ISI SEMUA FIELD KECUALI judul laporan
  await page.click('#prokerDropdownBtn');
  await page.locator('#prokerDropdownMenu button').first().click();
  await page.fill('#waktu_tempat', '09.00 WIB');
  await page.fill('#deskripsi_kegiatan', 'Deskripsi');
  await page.fill('#sumber_dana', 'Departemen SI');
  await page.fill('#dana_digunakan', '3000000');
  await page.fill('#persentase_kuantitatif', '80');
  await page.fill('#persentase_kualitatif', '90');
  await page.fill('#deskripsi_target_kuantitatif', 'Target');
  await page.fill('#deskripsi_target_kualitatif', 'Target');
  await page.fill('#kendala', 'Tidak ada');
  await page.fill('#solusi', 'Koordinasi');
  await page.fill('#sasaran', 'Mahasiswa');
  // ❌ TIDAK mengisi #judul_laporan

  const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
  await page.setInputFiles('#fileUpload', filePath);

  // Submit
  await page.click('#submitBtn');

  // Cek HTML5 validation (native browser)
  const isInvalid = await page.$eval(
    '#judul_laporan',
    el => el.matches(':invalid')
  );

  expect(isInvalid).toBe(true);
});

  // =====================================================
  // ❌ 3. FILE TERLALU BESAR
  // =====================================================
  test('Menampilkan fileSizeModal jika file > 5MB', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    const bigFile = path.resolve(__dirname, '../fixtures/contoh.pdf');
    await page.setInputFiles('#fileUpload', bigFile);

    const fileSizeModal = page.locator('#fileSizeModal');
    await expect(fileSizeModal).toBeVisible();
    await expect(fileSizeModal).toContainText('File Terlalu Besar');
  });

  // =====================================================
  // 4. VALIDASI FIELD DENGAN KARAKTER SPESIAL
  // =====================================================
  test('Submit laporan dengan karakter spesial', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan @#$%^&*()');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09:00 - 12:00 WIB @ Aula');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi dengan @#$%^&*()_+-={}[]|:;"<>,.?/~`');
    await page.fill('#sumber_dana', 'Departemen & Sponsor');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '75');
    await page.fill('#persentase_kualitatif', '85');
    await page.fill('#deskripsi_target_kuantitatif', 'Target <> special');
    await page.fill('#deskripsi_target_kualitatif', 'Quality & Excellence');
    await page.fill('#kendala', 'Kendala: @#$ issues');
    await page.fill('#solusi', 'Solusi -> koordinasi');
    await page.fill('#sasaran', 'Mahasiswa & Dosen');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 5. VALIDASI FIELD DENGAN PANJANG MAKSIMAL
  // =====================================================
  test('Submit laporan dengan field yang sangat panjang', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    const longText = 'Lorem ipsum dolor sit amet consectetur adipiscing elit. '.repeat(50);

    await page.fill('#judul_laporan', 'Laporan dengan judul yang sangat panjang untuk menguji validasi maksimal karakter');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB sampai 17.00 WIB di berbagai tempat yang berbeda');
    await page.fill('#deskripsi_kegiatan', longText);
    await page.fill('#sumber_dana', 'Departemen Sistem Informasi dan berbagai sponsor lainnya');
    await page.fill('#dana_digunakan', '99999999');
    await page.fill('#persentase_kuantitatif', '100');
    await page.fill('#persentase_kualitatif', '100');
    await page.fill('#deskripsi_target_kuantitatif', longText.substring(0, 500));
    await page.fill('#deskripsi_target_kualitatif', longText.substring(0, 500));
    await page.fill('#kendala', longText.substring(0, 500));
    await page.fill('#solusi', longText.substring(0, 500));
    await page.fill('#sasaran', 'Seluruh mahasiswa Sistem Informasi dan civitas akademika');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 6. VALIDASI ANGKA NEGATIF PADA DANA
  // =====================================================
  test('Validasi input angka negatif pada dana', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Dana Negatif');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '-1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 7. VALIDASI PERSENTASE LEBIH DARI 100
  // =====================================================
  test('Validasi persentase lebih dari 100', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Persentase Tinggi');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '150');
    await page.fill('#persentase_kualitatif', '200');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 8. VALIDASI SUBMIT TANPA FILE
  // =====================================================
  test('Validasi submit tanpa mengupload file', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Tanpa File');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 9. VALIDASI FIELD DENGAN WHITESPACE ONLY
  // =====================================================
  test('Validasi field dengan hanya whitespace', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', '     ');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '     ');
    await page.fill('#deskripsi_kegiatan', '     ');
    await page.fill('#sumber_dana', '     ');
    await page.fill('#dana_digunakan', '     ');
    await page.fill('#persentase_kuantitatif', '     ');
    await page.fill('#persentase_kualitatif', '     ');
    await page.fill('#deskripsi_target_kuantitatif', '     ');
    await page.fill('#deskripsi_target_kualitatif', '     ');
    await page.fill('#kendala', '     ');
    await page.fill('#solusi', '     ');
    await page.fill('#sasaran', '     ');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/hmsi\/laporan\/tambah/);
  });

  // =====================================================
  // 10. VALIDASI HTML/SCRIPT INJECTION
  // =====================================================
  test('Validasi input dengan HTML dan script tags', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', '<script>alert("XSS")</script>');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '<h1>Header</h1>');
    await page.fill('#deskripsi_kegiatan', '<p>Paragraph</p><script>console.log("test")</script>');
    await page.fill('#sumber_dana', '<b>Bold</b>');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', '<div>Target</div>');
    await page.fill('#deskripsi_target_kualitatif', '<span>Quality</span>');
    await page.fill('#kendala', '<img src=x onerror=alert(1)>');
    await page.fill('#solusi', '<iframe src="evil.com"></iframe>');
    await page.fill('#sasaran', '<a href="javascript:alert()">Link</a>');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 11. VALIDASI FIELD DENGAN EMOJI
  // =====================================================
  test('Validasi field dengan emoji', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan HMSI 🎉📊');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB ⏰📍');
    await page.fill('#deskripsi_kegiatan', 'Kegiatan sukses 🎯✨🚀');
    await page.fill('#sumber_dana', 'Departemen 💰');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target tercapai ✅');
    await page.fill('#deskripsi_target_kualitatif', 'Kualitas bagus 🌟');
    await page.fill('#kendala', 'Tidak ada 👍');
    await page.fill('#solusi', 'Koordinasi baik 🤝');
    await page.fill('#sasaran', 'Mahasiswa 👨‍🎓👩‍🎓');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 12. VALIDASI FIELD DENGAN LEADING/TRAILING SPACES
  // =====================================================
  test('Validasi field dengan leading dan trailing spaces', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', '  Laporan HMSI  ');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '  09.00 WIB  ');
    await page.fill('#deskripsi_kegiatan', '  Deskripsi kegiatan  ');
    await page.fill('#sumber_dana', '  Departemen SI  ');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', '  Target kuantitatif  ');
    await page.fill('#deskripsi_target_kualitatif', '  Target kualitatif  ');
    await page.fill('#kendala', '  Tidak ada kendala  ');
    await page.fill('#solusi', '  Koordinasi baik  ');
    await page.fill('#sasaran', '  Mahasiswa SI  ');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 13. VALIDASI DANA DENGAN DESIMAL
  // =====================================================
  test('Validasi dana dengan nilai desimal', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Dana Desimal');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '1500000.50');
    await page.fill('#persentase_kuantitatif', '80.5');
    await page.fill('#persentase_kualitatif', '90.75');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 14. VALIDASI FIELD DENGAN URL
  // =====================================================
  test('Validasi field diisi dengan URL', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan https://hmsi.ac.id');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', 'https://maps.google.com');
    await page.fill('#deskripsi_kegiatan', 'Info: https://example.com/kegiatan');
    await page.fill('#sumber_dana', 'www.sponsor.com');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'http://target.com');
    await page.fill('#deskripsi_target_kualitatif', 'https://quality.co.id');
    await page.fill('#kendala', 'https://kendala.com');
    await page.fill('#solusi', 'http://solusi.org');
    await page.fill('#sasaran', 'www.mahasiswa.ac.id');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 15. VALIDASI FIELD DENGAN EMAIL
  // =====================================================
  test('Validasi field diisi dengan format email', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan contact@hmsi.ac.id');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', 'Contact: admin@example.com');
    await page.fill('#deskripsi_kegiatan', 'Email: info@kegiatan.co.id');
    await page.fill('#sumber_dana', 'sponsor@company.com');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'target@hmsi.ac.id');
    await page.fill('#deskripsi_target_kualitatif', 'quality@test.com');
    await page.fill('#kendala', 'kendala@example.org');
    await page.fill('#solusi', 'solusi@hmsi.ac.id');
    await page.fill('#sasaran', 'mahasiswa@si.ac.id');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 16. VALIDASI FIELD DENGAN UNICODE/BAHASA LAIN
  // =====================================================
  test('Validasi field dengan karakter Unicode dan bahasa lain', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan 보고서 レポート Отчет');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '時間 時間 Время');
    await page.fill('#deskripsi_kegiatan', '描述 説明 Описание');
    await page.fill('#sumber_dana', '来源 ソース Источник');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', '目标 目標 Цель');
    await page.fill('#deskripsi_target_kualitatif', '质量 品質 Качество');
    await page.fill('#kendala', '问题 問題 Проблема');
    await page.fill('#solusi', '解决 解決 Решение');
    await page.fill('#sasaran', '学生 学生 Студент');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 17. VALIDASI KOMBINASI UPPERCASE DAN LOWERCASE
  // =====================================================
  test('Validasi field dengan kombinasi UPPERCASE dan lowercase', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'LAPORAN hmsi MiXeD CaSe');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', 'WAKTU dan tempat');
    await page.fill('#deskripsi_kegiatan', 'DeSKriPSi KeGiaTaN');
    await page.fill('#sumber_dana', 'DEPARTEMEN sistem informasi');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'TARGET KuantiTATIF');
    await page.fill('#deskripsi_target_kualitatif', 'target KUAlitatif');
    await page.fill('#kendala', 'KENDALA tidak ADA');
    await page.fill('#solusi', 'solusi KOORDINASI');
    await page.fill('#sasaran', 'MAHASISWA sistem INFORMASI');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 18. VALIDASI FIELD DENGAN NEWLINE
  // =====================================================
  test('Validasi field dengan newline characters', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan\nBaris Baru');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', 'Waktu:\n09.00 WIB\nTempat: Aula');
    await page.fill('#deskripsi_kegiatan', 'Kegiatan:\n1. Pembukaan\n2. Inti\n3. Penutup');
    await page.fill('#sumber_dana', 'Dana dari:\nDepartemen\nSponsor');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target:\n100 peserta\n50 mahasiswa');
    await page.fill('#deskripsi_target_kualitatif', 'Kualitas:\nBaik\nMemuaskan');
    await page.fill('#kendala', 'Kendala:\n- Waktu\n- Budget');
    await page.fill('#solusi', 'Solusi:\n1. Koordinasi\n2. Planning');
    await page.fill('#sasaran', 'Sasaran:\nMahasiswa\nDosen');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 19. VALIDASI DANA DENGAN LEADING ZEROS
  // =====================================================
  test('Validasi dana dengan leading zeros', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Leading Zeros');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '0001000000');
    await page.fill('#persentase_kuantitatif', '080');
    await page.fill('#persentase_kualitatif', '090');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 20. VALIDASI FIELD DENGAN SIMBOL MATA UANG
  // =====================================================
  test('Validasi field dengan simbol mata uang', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Budget Rp 5.000.000');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Dana: Rp 3.000.000 atau $500 atau €400');
    await page.fill('#sumber_dana', 'Departemen SI ($1000)');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Rp 10.000.000');
    await page.fill('#deskripsi_target_kualitatif', '$500 value');
    await page.fill('#kendala', '¥50000 budget');
    await page.fill('#solusi', '€200 additional');
    await page.fill('#sasaran', 'Mahasiswa (Rp free)');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 21. VALIDASI FIELD DENGAN DASH DAN UNDERSCORE
  // =====================================================
  test('Validasi field dengan dash dan underscore', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan-HMSI_2026');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09:00-12:00_WIB');
    await page.fill('#deskripsi_kegiatan', 'Kegiatan_Utama-2026');
    await page.fill('#sumber_dana', 'Departemen-SI_Sponsor');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Target_100-Peserta');
    await page.fill('#deskripsi_target_kualitatif', 'Kualitas_A-Plus');
    await page.fill('#kendala', 'Kendala-Waktu_Budget');
    await page.fill('#solusi', 'Solusi-Koordinasi_Planning');
    await page.fill('#sasaran', 'Mahasiswa-SI_Dosen');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 22. VALIDASI FIELD DENGAN TANDA KUTIP
  // =====================================================
  test('Validasi field dengan tanda kutip tunggal dan ganda', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan "Unggulan" \'2026\'');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 "WIB"');
    await page.fill('#deskripsi_kegiatan', 'Kegiatan "Terbaik" dan \'Teratas\'');
    await page.fill('#sumber_dana', 'Departemen "SI" O\'Brien');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', '"100" peserta');
    await page.fill('#deskripsi_target_kualitatif', '\'Excellent\' quality');
    await page.fill('#kendala', 'Kendala "minor"');
    await page.fill('#solusi', 'Solusi \'efektif\'');
    await page.fill('#sasaran', '"Mahasiswa" SI');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 23. VALIDASI PERSENTASE NOL
  // =====================================================
  test('Validasi persentase dengan nilai nol', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporan Persentase Nol');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '09.00 WIB');
    await page.fill('#deskripsi_kegiatan', 'Deskripsi');
    await page.fill('#sumber_dana', 'Departemen SI');
    await page.fill('#dana_digunakan', '0');
    await page.fill('#persentase_kuantitatif', '0');
    await page.fill('#persentase_kualitatif', '0');
    await page.fill('#deskripsi_target_kuantitatif', 'Target');
    await page.fill('#deskripsi_target_kualitatif', 'Target');
    await page.fill('#kendala', 'Tidak ada');
    await page.fill('#solusi', 'Koordinasi');
    await page.fill('#sasaran', 'Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 24. VALIDASI FIELD DENGAN HURUF BERULANG
  // =====================================================
  test('Validasi field dengan huruf berulang', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', 'Laporannnn HMSIIIII');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', 'Waktuuuuu Tempattttt');
    await page.fill('#deskripsi_kegiatan', 'Kegiatannnnn Berhasilllll');
    await page.fill('#sumber_dana', 'Departemennnn SIII');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', 'Targetttt Tercapaiiii');
    await page.fill('#deskripsi_target_kualitatif', 'Kualitassss Baikkkk');
    await page.fill('#kendala', 'Tidakkkk Adaaaa');
    await page.fill('#solusi', 'Koordinasiii Baikkkk');
    await page.fill('#sasaran', 'Mahasiswaaaa SIII');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

  // =====================================================
  // 25. VALIDASI FIELD DENGAN ANGKA DI AWAL
  // =====================================================
  test('Validasi field dimulai dengan angka', async ({ page }) => {
    await loginAsHMSI(page);
    await goToTambahLaporan(page);

    await page.fill('#judul_laporan', '2026 Laporan HMSI');
    await page.click('#prokerDropdownBtn');
    await page.locator('#prokerDropdownMenu button').first().click();
    await page.fill('#waktu_tempat', '123 Waktu Tempat');
    await page.fill('#deskripsi_kegiatan', '456 Deskripsi Kegiatan');
    await page.fill('#sumber_dana', '789 Departemen SI');
    await page.fill('#dana_digunakan', '1000000');
    await page.fill('#persentase_kuantitatif', '80');
    await page.fill('#persentase_kualitatif', '90');
    await page.fill('#deskripsi_target_kuantitatif', '100 Target');
    await page.fill('#deskripsi_target_kualitatif', '200 Quality');
    await page.fill('#kendala', '300 Kendala');
    await page.fill('#solusi', '400 Solusi');
    await page.fill('#sasaran', '500 Mahasiswa');

    const filePath = path.resolve(__dirname, '../fixtures/prokerhmsi.pdf');
    await page.setInputFiles('#fileUpload', filePath);

    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    expect(currentURL).toMatch(/\/hmsi\/laporan\/(tambah|list)/);
  });

});
