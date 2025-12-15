# 🎮 Playwright Command Cheatsheet

## 🚀 Basic Commands

```powershell
# Run all tests
npx playwright test

# Run tests in specific folder
npx playwright test tests/dpa/

# Run specific test file
npx playwright test tests/dpa/cari-proker.test.js
```

## 🌐 Browser Selection

```powershell
# Run on Chromium only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on WebKit only
npx playwright test --project=webkit

# Run on all browsers (default)
npx playwright test
```

## 👁️ Visual Modes

```powershell
# UI Mode (Interactive, Recommended!)
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Debug mode (step through)
npx playwright test --debug

# Trace viewer (after test)
npx playwright show-trace
```

## 📊 Reports & Results

```powershell
# Show last HTML report
npx playwright show-report

# Generate report only
npx playwright test --reporter=html

# Generate JSON report
npx playwright test --reporter=json
```

## 🎯 Test Selection

```powershell
# Run tests matching pattern
npx playwright test cari

# Run single test by name
npx playwright test -g "DPA dapat mencari"

# Run tests in specific file
npx playwright test tests/dpa/cari-proker.test.js
```

## 🔧 Advanced Options

```powershell
# Run with timeout
npx playwright test --timeout=60000

# Run with retries
npx playwright test --retries=2

# Run with specific workers
npx playwright test --workers=4

# Run in parallel
npx playwright test --workers=4

# Run sequentially
npx playwright test --workers=1
```

## 🐛 Debugging

```powershell
# Debug specific test
npx playwright test --debug cari-proker.test.js

# Run with verbose logging
npx playwright test --reporter=line

# Run with trace on
npx playwright test --trace=on

# Pause on failure
npx playwright test --pause-on-failure
```

## 📹 Screenshots & Videos

```powershell
# Take screenshot on failure
npx playwright test --screenshot=on

# Record video
npx playwright test --video=on

# Record video on failure only
npx playwright test --video=retain-on-failure
```

## 🔍 Filtering & Grep

```powershell
# Run tests with "search" in name
npx playwright test -g "search"

# Run tests matching regex
npx playwright test -g "pencarian|search"

# Skip tests with specific tag
npx playwright test --grep-invert "slow"
```

## 📦 Configuration

```powershell
# Use specific config file
npx playwright test --config=playwright.config.js

# Override base URL
npx playwright test --base-url=http://localhost:3000

# Set max failures
npx playwright test --max-failures=3
```

## 🔄 Update & Install

```powershell
# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# Check version
npx playwright --version
```

## 📝 Test Generation

```powershell
# Generate test from recording
npx playwright codegen http://localhost:3000

# Generate with specific browser
npx playwright codegen --browser=firefox http://localhost:3000

# Generate with device emulation
npx playwright codegen --device="iPhone 12" http://localhost:3000
```

## 🎨 Examples for This Project

```powershell
# Run all DPA tests with UI
npx playwright test tests/dpa/ --ui

# Run search test on Chrome, see browser
npx playwright test tests/dpa/cari-proker.test.js --project=chromium --headed

# Debug evaluation test
npx playwright test tests/dpa/edit-laporan-hasil-evaluasi.test.js --debug

# Run all tests, show results
npx playwright test tests/dpa/ && npx playwright show-report

# Test download feature on all browsers
npx playwright test tests/dpa/mengunduh-laporan-proker.test.js

# Quick test on one browser
npx playwright test tests/dpa/ --project=chromium --workers=1
```

## 🚨 Troubleshooting Commands

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npx playwright install

# Check browser installation
npx playwright install --dry-run

# Test with maximum logging
$env:DEBUG="pw:api"; npx playwright test

# Clear test results
Remove-Item -Recurse -Force test-results
Remove-Item -Recurse -Force playwright-report
```

## 💡 Pro Tips

```powershell
# Fastest: Run on single browser, one worker
npx playwright test tests/dpa/ --project=chromium --workers=1

# Most thorough: All browsers, with retries
npx playwright test tests/dpa/ --retries=2

# Best for debugging: UI mode on specific test
npx playwright test tests/dpa/cari-proker.test.js --ui

# Best for demos: Headed mode, slow motion
npx playwright test tests/dpa/ --headed --slow-mo=1000

# Quick smoke test: Single fast test
npx playwright test tests/dpa/cari-proker.test.js -g "DPA dapat mencari" --project=chromium
```

## 🎯 Common Workflows

### Development Workflow
```powershell
# 1. Write test
code tests/dpa/my-test.test.js

# 2. Run in UI mode to verify
npx playwright test tests/dpa/my-test.test.js --ui

# 3. Run on all browsers
npx playwright test tests/dpa/my-test.test.js

# 4. Check report
npx playwright show-report
```

### CI/CD Workflow
```powershell
# Run all tests, generate report, exit with error code
npx playwright test tests/dpa/ --reporter=html,json --retries=1
```

### Bug Investigation
```powershell
# 1. Run failing test in debug mode
npx playwright test tests/dpa/failing-test.test.js --debug

# 2. If still failing, run with trace
npx playwright test tests/dpa/failing-test.test.js --trace=on

# 3. View trace
npx playwright show-trace trace.zip
```

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `npx playwright test` |
| Run DPA tests | `npx playwright test tests/dpa/` |
| UI Mode | `npx playwright test --ui` |
| Headed | `npx playwright test --headed` |
| Debug | `npx playwright test --debug` |
| Chrome only | `npx playwright test --project=chromium` |
| Show report | `npx playwright show-report` |
| Install | `npx playwright install` |

---

**Save this file for quick reference!** 📌

**File location:** `tests/dpa/CHEATSHEET.md`
