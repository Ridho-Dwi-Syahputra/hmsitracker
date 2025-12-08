const { test, expect } = require("@playwright/test");

test("Admin berhasil login", async ({ page }) => {

  // Akses halaman login
  await page.goto("http://localhost:3000/auth/login");

  // Isi form login
  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "12345");

  // Submit
  await page.click('button[type="submit"]');

  // Setelah login, harus redirect ke dashboard admin
  await expect(page).toHaveURL(/.*hmsi\/dashboard/);
});
