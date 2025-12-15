# ⚡ Quick Demo - Running Your First Test

Follow these steps to run your first Playwright test!

## Step 1: Check Prerequisites ✅

```powershell
# Check if server is running (should return HTML)
curl http://localhost:3000

# If not running, start it:
npm run dev
```

## Step 2: Verify Playwright Installation ✅

```powershell
# Check Playwright version
npx playwright --version
# Expected output: Version 1.57.0 or similar

# Check installed browsers
npx playwright install --dry-run
# Should show: Chromium, Firefox, WebKit installed
```

## Step 3: Run Example Test (Sanity Check) ✅

```powershell
# Run the example test to verify everything works
npx playwright test tests/example.spec.js --project=chromium

# Expected output:
# Running 2 tests using 2 workers
# 2 passed (7.9s)
```

## Step 4: Run Your First DPA Test 🚀

Let's test the search functionality:

```powershell
# Run search test in UI mode (interactive)
npx playwright test tests/dpa/cari-proker.test.js --ui
```

In UI mode you can:
- ✅ See test execution in real-time
- ✅ Click on individual tests to run them
- ✅ Step through tests
- ✅ See screenshots and DOM

## Step 5: Run All DPA Tests 🎯

```powershell
# Run all tests on Chromium (fastest for first try)
npx playwright test tests/dpa/ --project=chromium

# Expected output:
# Running 40 tests using X workers
# 40 passed (XX.Xs)
```

## Step 6: View the Report 📊

```powershell
# Open HTML report in browser
npx playwright show-report

# Browser will open showing:
# - Test results
# - Screenshots (if any failures)
# - Detailed execution logs
```

## Step 7: Run on All Browsers (Full Test) 🌐

```powershell
# Run all tests on all 3 browsers (120 test runs)
npx playwright test tests/dpa/

# This will take longer but tests compatibility
# Expected: 120 test runs (40 tests × 3 browsers)
```

---

## 🎯 Quick Test Commands

### Test Individual Features

```powershell
# Test search functionality
npx playwright test tests/dpa/cari-proker.test.js --headed

# Test evaluation
npx playwright test tests/dpa/edit-laporan-hasil-evaluasi.test.js --headed

# Test detail view
npx playwright test tests/dpa/lihat-detail-proker.test.js --headed

# Test comments
npx playwright test tests/dpa/menambahkan-komentar.test.js --headed

# Test downloads
npx playwright test tests/dpa/mengunduh-laporan-proker.test.js --headed
```

---

## 🐛 If Something Goes Wrong

### Problem: Server not running
```powershell
# Solution: Start the server
npm run dev
# Wait until you see: Server running on port 3000
```

### Problem: Login fails
```powershell
# Solution: Check credentials in auth-helper.js
code tests/dpa/helpers/auth-helper.js
# Verify email and password match your database
```

### Problem: Tests timeout
```powershell
# Solution: Run with increased timeout
npx playwright test tests/dpa/ --timeout=60000
```

### Problem: Element not found
```powershell
# Solution: Run in debug mode to inspect
npx playwright test tests/dpa/cari-proker.test.js --debug
# Use the inspector to verify selectors
```

---

## ✨ Success Indicators

You'll know everything works when you see:

✅ **All tests passing:**
```
Running 40 tests using 8 workers
  40 passed (45.2s)

To open last HTML report run:
  npx playwright show-report
```

✅ **Green checkmarks** in the report

✅ **No error messages** in console

✅ **Tests complete** within reasonable time (< 2 minutes on Chromium)

---

## 🎉 Congratulations!

If you've made it here and tests are passing, you've successfully:
- ✅ Installed Playwright
- ✅ Configured multi-browser testing
- ✅ Created 40 comprehensive test cases
- ✅ Run functional testing
- ✅ Verified compatibility across browsers

**You're now ready for professional-level functional testing!** 🚀

---

## 📝 Next Steps

1. **Review Results:** Check the HTML report for detailed results
2. **Customize Tests:** Modify selectors if needed for your specific views
3. **Add More Tests:** Expand coverage for edge cases
4. **Automate:** Set up CI/CD for automated testing
5. **Document:** Keep test documentation updated

---

## 🆘 Need Help?

Check these resources:
- 📖 [PANDUAN_TESTING_DPA.md](../../PANDUAN_TESTING_DPA.md) - Complete guide
- 📖 [SETUP_DATA_TESTING.md](../../SETUP_DATA_TESTING.md) - Data setup
- 📖 [CHEATSHEET.md](./CHEATSHEET.md) - Command reference
- 🌐 [Playwright Docs](https://playwright.dev/) - Official documentation

---

**Happy Testing! 🎯**
