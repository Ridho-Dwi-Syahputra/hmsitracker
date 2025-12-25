const BASE_URL = 'http://localhost:3000';

async function loginAsHMSI(page) {
  // Navigasi ke halaman login
  await page.goto(`${BASE_URL}/auth/login`, {
    timeout: 60000,
    waitUntil: 'domcontentloaded'
  });

  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "12345");

  await page.click('button[type="submit"]');

  await page.waitForURL(`${BASE_URL}/**/hmsi/dashboard`, { 
    timeout: 60000,
    waitUntil: 'domcontentloaded'
  });

  await page.waitForLoadState('networkidle');
}

module.exports = { loginAsHMSI };
