/* const { test, expect } = require("@playwright/test");

//
// 1. Login berhasil
//
test("Admin berhasil login", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "12345");

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*hmsi\/dashboard/);
});


//
// 2. Login gagal - password salah
//
test("Login gagal jika password salah", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");
  await page.fill('input[name="password"]', "salahbanget");

  await page.click('button[type="submit"]');

  // Sesuaikan dengan elemen error-mu
  await expect(page.locator(".error-msg")).toHaveText("Email atau password salah");
});


//
// 3. Login gagal - email tidak ditemukan
//
test("Login gagal jika email tidak terdaftar", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "tidakada@example.com");
  await page.fill('input[name="password"]', "12345");

  await page.click('button[type="submit"]');

  await expect(page.locator(".error-msg")).toHaveText("Email atau password salah");
});


//
// 4. Login gagal - email kosong dan password kosong
//
test("Login gagal jika email dan password kosong", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.click('button[type="submit"]');

  await expect(page.locator(".error-msg")).toHaveText("Email dan password wajib diisi");
});


//
// 5. Login gagal - hanya email terisi
//
test("Login gagal jika password kosong", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name="email"]', "ridhooo@example.com");

  await page.click('button[type="submit"]');

  await expect(page.locator(".error-msg")).toHaveText("Password wajib diisi");
});


//
// ❌ 6. Login gagal - hanya password terisi
//
test("Login gagal jika email kosong", async ({ page }) => {

  await page.goto("http://localhost:3000/auth/login");

  await page.fill('input[name=\"password\"]', "12345");

  await page.click('button[type=\"submit\"]');

  await expect(page.locator(".error-msg")).toHaveText("Email wajib diisi");
});

*/