/**
 * Helper untuk login sebagai DPA
 * Digunakan di semua test file DPA
 */
async function loginAsDPA(page) {
  console.log('🔐 Starting login process...');
  
  // Navigasi ke halaman login
  await page.goto("http://localhost:3000/auth/login");
  await page.waitForLoadState('networkidle');
  console.log('📄 Login page loaded');

  // Isi form login dengan kredensial DPA
  // Kredensial sesuai database: akundpa@example.com / 123
  await page.fill('input[name="email"]', "akundpa@example.com");
  await page.fill('input[name="password"]', "123");
  console.log('✏️ Credentials filled');

  // Submit form login
  await page.click('button[type="submit"]');
  console.log('🖱️ Submit button clicked');

  // Tunggu redirect ke dashboard DPA dengan timeout lebih panjang
  await page.waitForURL(/.*dpa\/dashboard/, { timeout: 10000 }).catch(async (e) => {
    console.log('❌ Login redirect failed, current URL:', page.url());
    await page.screenshot({ path: 'test-results/debug-login.png' });
    throw e;
  });
  
  // Tunggu halaman dashboard benar-benar termuat
  await page.waitForLoadState('networkidle');
  console.log('✅ Login successful, current URL:', page.url());
}

/**
 * Helper untuk menunggu halaman dengan table atau empty state termuat
 * Digunakan untuk halaman dengan table (bukan card)
 */
async function waitForTableOrEmpty(page, tableSelector = 'tbody tr', timeout = 10000) {
  try {
    // Tunggu table muncul atau tampilkan empty state
    await page.waitForSelector(`${tableSelector}, .empty-state, .text-center:has-text("Tidak ada")`, { 
      timeout: timeout 
    });
  } catch (e) {
    console.log(`⚠️ Table ${tableSelector} not found within ${timeout}ms`);
  }
}

module.exports = { loginAsDPA, waitForTableOrEmpty };
