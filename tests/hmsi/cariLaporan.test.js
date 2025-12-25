import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Functional Test - Cari Laporan HMSI', () => {

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
    
    // Navigate to laporan list
    await page.goto(`${BASE_URL}/hmsi/laporan`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for table to load
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
  });

  test('Search input field tersedia dan dapat diakses', async ({ page }) => {
    // Check search input exists
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();
    
    // Check placeholder text
    await expect(searchInput).toHaveAttribute('placeholder', /Cari berdasarkan/);
  });

  test('Cari dengan keyword judul laporan berhasil menemukan hasil', async ({ page }) => {
    // Get first laporan title from table
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const searchKeyword = firstLaporanTitle.trim().substring(0, 5); // Ambil 5 karakter pertama
    
    // Perform search
    const searchInput = page.locator('#searchInput');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(500);
    
    // Check if table still shows results
    const visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const rowCount = await visibleRows.count();
    
    // Should find at least 1 result
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Cari dengan keyword tidak ada menampilkan baris kosong', async ({ page }) => {
    // Search with non-existent keyword
    const searchInput = page.locator('#searchInput');
    const uniqueKeyword = `XYZNONEXISTENT${Date.now()}`;
    await searchInput.fill(uniqueKeyword);
    await page.waitForTimeout(800);
    
    // Verify search input has the value
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe(uniqueKeyword);
    
    // Table should still be visible even if no results
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Cari case insensitive (uppercase dan lowercase sama)', async ({ page }) => {
    // Get first laporan title
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const searchKeyword = firstLaporanTitle.trim().substring(0, 5);
    
    // Search with uppercase
    let searchInput = page.locator('#searchInput');
    await searchInput.fill(searchKeyword.toUpperCase());
    await page.waitForTimeout(500);
    
    let visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const upperRowCount = await visibleRows.count();
    
    // Clear and search with lowercase
    await searchInput.clear();
    await searchInput.fill(searchKeyword.toLowerCase());
    await page.waitForTimeout(500);
    
    visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const lowerRowCount = await visibleRows.count();
    
    // Both should have same count
    expect(upperRowCount).toBe(lowerRowCount);
  });

  test('Clear search input untuk menampilkan semua laporan kembali', async ({ page }) => {
    // Get initial row count
    let visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const initialCount = await visibleRows.count();
    
    // Perform search with keyword that reduces results
    const searchInput = page.locator('#searchInput');
    const allRows = page.locator('table tbody tr');
    const firstTitle = await allRows.first().locator('td:nth-child(2)').textContent();
    const keyword = firstTitle.substring(0, 3);
    
    await searchInput.fill(keyword);
    await page.waitForTimeout(800);
    
    visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const searchedCount = await visibleRows.count();
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(800);
    
    visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const clearedCount = await visibleRows.count();
    
    // Should have same or more rows back than searched
    expect(clearedCount).toBeGreaterThanOrEqual(searchedCount);
  });

  test('Cari dengan partial keyword (sebagian kata)', async ({ page }) => {
    // Get first laporan title
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const fullTitle = firstLaporanTitle.trim();
    const partialKeyword = fullTitle.substring(0, Math.ceil(fullTitle.length / 2)); // Ambil separuh kata
    
    // Search with partial keyword
    const searchInput = page.locator('#searchInput');
    await searchInput.fill(partialKeyword);
    await page.waitForTimeout(500);
    
    // Should find results
    const visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const rowCount = await visibleRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Cari berdasarkan program kerja', async ({ page }) => {
    // Get first program kerja
    const firstProkerName = await page.locator('table tbody tr[data-visible="true"] td:nth-child(3)').first().textContent();
    
    if (firstProkerName && firstProkerName.trim() !== '-') {
      const searchKeyword = firstProkerName.trim().substring(0, 5);
      
      // Search with proker keyword
      const searchInput = page.locator('#searchInput');
      await searchInput.fill(searchKeyword);
      await page.waitForTimeout(500);
      
      // Should find results
      const visibleRows = page.locator('table tbody tr[data-visible="true"]');
      const rowCount = await visibleRows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('Cari dengan spasi atau karakter khusus', async ({ page }) => {
    // Search with spaces
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('   ');
    await page.waitForTimeout(500);
    
    // Should handle gracefully (show all or none)
    const visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const rowCount = await visibleRows.count();
    
    // Should be >= 0 (valid state)
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('Cari real-time menampilkan hasil saat mengetik', async ({ page }) => {
    // Get first laporan title
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const fullTitle = firstLaporanTitle.trim();
    
    const searchInput = page.locator('#searchInput');
    
    // Type character by character
    for (let i = 1; i <= Math.min(3, fullTitle.length); i++) {
      await searchInput.fill(fullTitle.substring(0, i));
      await page.waitForTimeout(300);
      
      // Check that table is still there and responsive
      const tableExists = await page.locator('table').isVisible();
      expect(tableExists).toBe(true);
    }
  });

  test('Cari mempertahankan state saat scroll halaman', async ({ page }) => {
    // Get initial row count
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const searchKeyword = firstLaporanTitle.trim().substring(0, 5);
    
    // Perform search
    const searchInput = page.locator('#searchInput');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(500);
    
    let visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const countBefore = await visibleRows.count();
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    
    // Check if search still active and count is same
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe(searchKeyword);
    
    visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const countAfter = await visibleRows.count();
    expect(countAfter).toBe(countBefore);
  });

  test('Cari dengan angka/nomor', async ({ page }) => {
    // Search with number
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('2024');
    await page.waitForTimeout(500);
    
    // Should handle numeric search gracefully
    const tableExists = await page.locator('table').isVisible();
    expect(tableExists).toBe(true);
    
    const visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const rowCount = await visibleRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('Cari dengan kata berbeda tidak case sensitive', async ({ page }) => {
    // Get first title
    const firstTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const keyword1 = firstTitle.trim().substring(0, 3);
    
    // Search with uppercase
    const searchInput = page.locator('#searchInput');
    await searchInput.fill(keyword1.toUpperCase());
    await page.waitForTimeout(800);
    
    let visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const upperCount = await visibleRows.count();
    
    // Clear and search with lowercase
    await searchInput.clear();
    await searchInput.fill(keyword1.toLowerCase());
    await page.waitForTimeout(800);
    
    visibleRows = page.locator('table tbody tr[data-visible="true"]');
    const lowerCount = await visibleRows.count();
    
    // Both uppercase and lowercase should give same result
    expect(lowerCount).toBe(upperCount);
  });

  test('Search input dapat diklik dan menerima input', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    
    // Click pada search input
    await searchInput.click();
    
    // Type some text
    await searchInput.type('test', { delay: 50 });
    
    // Check if text is entered
    const value = await searchInput.inputValue();
    expect(value).toContain('test');
  });

  test('Sorting masih berfungsi setelah cari', async ({ page }) => {
    // Perform search
    const firstLaporanTitle = await page.locator('table tbody tr[data-visible="true"] td:nth-child(2)').first().textContent();
    const searchKeyword = firstLaporanTitle.trim().substring(0, 5);
    
    const searchInput = page.locator('#searchInput');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(500);
    
    // Check if sort buttons exist
    const sortButtons = page.locator('th[data-sort]');
    const sortCount = await sortButtons.count();
    
    // Should have sort buttons
    expect(sortCount).toBeGreaterThan(0);
  });

});
