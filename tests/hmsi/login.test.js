const { test, expect } = require("@playwright/test");

// 1. Login berhasil
test("Admin berhasil login", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "12345");

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*hmsi\/dashboard/);
});


// 2. Login gagal - password salah
test("Login gagal jika password salah", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "salahbanget");

  await page.click('button[type="submit"]');

  await expect(page.locator(".text-red-700")).toContainText("Email atau password salah");
});


// 3. Login gagal - email tidak ditemukan
test("Login gagal jika email tidak terdaftar", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "tidakada@example.com");
  await page.fill('input[name="password"]', "12345");

  await page.click('button[type="submit"]');

  await expect(page.locator(".text-red-700")).toContainText("Email atau password salah");
});


// 4. Login gagal - email kosong dan password kosong
test("Login gagal jika email dan password kosong", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  // Remove HTML5 validation
  await page.evaluate(() => {
    document.querySelector('input[name="email"]').removeAttribute('required');
    document.querySelector('input[name="password"]').removeAttribute('required');
  });

  await page.click('button[type="submit"]');

  await expect(page.locator(".text-red-700")).toBeVisible();
});


// 5. Login gagal - hanya email terisi
test("Login gagal jika password kosong", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");

  // Remove HTML5 validation
  await page.evaluate(() => {
    document.querySelector('input[name="password"]').removeAttribute('required');
  });

  await page.click('button[type="submit"]');

  await expect(page.locator(".text-red-700")).toBeVisible();
});


// 6. Login gagal - hanya password terisi (email kosong)
test("Login gagal jika hanya password terisi", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="password"]', "12345");

  // Remove HTML5 validation
  await page.evaluate(() => {
    document.querySelector('input[name="email"]').removeAttribute('required');
  });

  await page.click('button[type="submit"]');

  await expect(page.locator(".text-red-700")).toBeVisible();
});
