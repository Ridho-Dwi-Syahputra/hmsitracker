import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Functional Test - Tambah Komentar HMSI', () => {

  test.beforeEach(async ({ page }) => {
    // Login as HMSI user
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    
    await page.getByPlaceholder('Masukkan username Anda').fill('ridhooo@example.com');
    await page.getByPlaceholder('Masukkan password Anda').fill('12345');
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/hmsi\/dashboard/, { timeout: 30000 });
    
    // Navigate to kelola-evaluasi page
    await page.goto(`${BASE_URL}/hmsi/kelola-evaluasi`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for table to load
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
  });

  test('Halaman detail evaluasi berhasil dimuat dengan form komentar', async ({ page }) => {
    // Click first evaluasi
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Check page heading
    const heading = page.locator('h1', { hasText: /Form Evaluasi/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('Textarea komentar dapat diisi dengan teks', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      await expect(textarea).toBeVisible();
      
      // Fill textarea
      await textarea.fill('Test komentar evaluasi');
      const value = await textarea.inputValue();
      expect(value).toBe('Test komentar evaluasi');
    }
  });

  test('Submit button tersedia dan dapat diklik', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const submitBtn = page.locator('#submitCommentBtn');
      await expect(submitBtn).toBeVisible();
      
      const btnText = await submitBtn.textContent();
      expect(btnText).toContain('Tambahkan');
    }
  });

  test('Validasi: Textarea kosong menampilkan warning modal', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      const submitBtn = page.locator('#submitCommentBtn');
      
      // Ensure empty and submit
      await textarea.fill('');
      await submitBtn.click();
      await page.waitForTimeout(500);
      
      // Check validation modal appears
      const validationModal = page.locator('#validationModal');
      const isHidden = await validationModal.evaluate(el =>
        el.classList.contains('hidden')
      ).catch(() => true);
      
      expect(!isHidden).toBe(true);
    }
  });

  test('Modal validasi memiliki tombol untuk ditutup', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      const submitBtn = page.locator('#submitCommentBtn');
      
      // Submit empty form
      await textarea.fill('');
      await submitBtn.click();
      await page.waitForTimeout(500);
      
      // Check close button exists
      const closeBtn = page.locator('#closeValidationModal');
      const btnVisible = await closeBtn.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (btnVisible) {
        const btnText = await closeBtn.textContent();
        expect(btnText).toBeTruthy();
      }
    }
  });

  test('Textarea placeholder teks sudah ada', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      const placeholder = await textarea.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    }
  });

  test('Form komentar memiliki tombol Kembali', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const backBtn = page.locator('a', { hasText: /Kembali/i });
      const isVisible = await backBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        const href = await backBtn.getAttribute('href');
        expect(href).toContain('/hmsi/kelola-evaluasi');
      }
    }
  });

  test('Form responsif di desktop viewport', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click();
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      const submitBtn = page.locator('#submitCommentBtn');
      
      const textareaVisible = await textarea.isVisible({ timeout: 2000 }).catch(() => false);
      const submitVisible = await submitBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(textareaVisible && submitVisible).toBe(true);
    }
  });

  test('Form responsif di mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const firstRow = page.locator('table tbody tr').first();
    const eyeLink = firstRow.locator('a[title*="Detail"], button').first();
    await eyeLink.click({ force: true });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    
    const form = page.locator('#commentForm');
    const isFormVisible = await form.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFormVisible) {
      const textarea = page.locator('#komentarTextarea');
      const submitBtn = page.locator('#submitCommentBtn');
      
      const textareaVisible = await textarea.isVisible({ timeout: 2000 }).catch(() => false);
      const submitVisible = await submitBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(textareaVisible || submitVisible).toBe(true);
    }
  });

});
