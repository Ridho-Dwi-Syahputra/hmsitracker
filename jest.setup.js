// jest.setup.js
// File ini akan "membungkam" semua fungsi console selama tes berjalan
// agar output Anda bersih dan hanya menampilkan PASS/FAIL.

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});