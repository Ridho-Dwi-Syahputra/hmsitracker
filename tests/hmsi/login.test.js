const { test, expect } = require("@playwright/test");

test.describe("HMSI Login", () => {
  
  test("Berhasil login dengan kredensial yang benar", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    
    // Tunggu form tersedia
    await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 5000 });
    
    // Cari input email dan password
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first();
    
    await emailInput.fill("ridhooo@example.com");
    await passwordInput.fill("12345");
    
    await page.click('button[type="submit"]');
    
    // Tunggu redirect
    await page.waitForURL(/.*hmsi.*dashboard|.*hmsi.*proker/, { timeout: 10000 });
    
    // Verifikasi berhasil login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/hmsi/);
  });

  test("Login gagal dengan password salah", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first();
    
    await emailInput.fill("ridhooo@example.com");
    await passwordInput.fill("passwordsalah");
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Cek apakah ada error message atau masih di halaman login
    const errorMsg = await page.locator(".error-msg, .alert, [role='alert']").isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('login');
    
    expect(errorMsg || stillOnLogin).toBeTruthy();
  });

  test("Login gagal dengan email tidak terdaftar", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first();
    
    await emailInput.fill("emailtidakada@example.com");
    await passwordInput.fill("12345");
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const errorMsg = await page.locator(".error-msg, .alert, [role='alert']").isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('login');
    
    expect(errorMsg || stillOnLogin).toBeTruthy();
  });

  test("Login gagal jika email kosong", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first();
    
    await passwordInput.fill("12345");
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    // Verifikasi masih di login page
    const stillOnLogin = page.url().includes('login');
    expect(stillOnLogin).toBeTruthy();
  });

  test("Login gagal jika password kosong", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
    
    await emailInput.fill("ridhooo@example.com");
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    const stillOnLogin = page.url().includes('login');
    expect(stillOnLogin).toBeTruthy();
  });

  test("Halaman login dapat diakses", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    
    // Verifikasi form ada
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first().isVisible().catch(() => false);
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first().isVisible().catch(() => false);
    const submitBtn = await page.locator('button[type="submit"]').isVisible().catch(() => false);
    
    expect(emailInput && passwordInput && submitBtn).toBeTruthy();
  });

  test("Form login dapat diisi dengan data", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login", { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], #password').first();
    
    await emailInput.fill("test@example.com");
    await passwordInput.fill("testpassword123");
    
    // Verifikasi nilai terisi
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    
    expect(emailValue).toBe("test@example.com");
    expect(passwordValue).toBe("testpassword123");
  });
});