# 🧪 Laporan Rinci Unit Testing Controller HMSI

Tanggal: 16 November 2025  
Cakupan: Semua controller di `controllers/hmsi/`  
Hasil: ✅ 86/86 tests PASS (HMSI), ✅ 151/151 total project

---

## Cara Membaca Laporan
- Setiap tabel memuat: Nama test, input/kondisi (termasuk mock), ekspektasi (apa yang diuji), hasil aktual, dan "Mengapa PASS" (alasan rinci berdasarkan assertion).
- Referensi nama file test ada pada judul subseksi.

---

## 1) Dashboard Controller — `__tests__/hmsi/dashboardController.test.js`
Target fungsi: `getDashboardStats`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| Redirect jika user null | `mockReq.session.user = null` | `res.redirect('/auth/login')` | Redirect dipanggil sekali | Assertion `expect(mockRedirect).toHaveBeenCalledWith('/auth/login')` terpenuhi; tidak ada query DB berjalan. |
| Render 0 stats saat `id_divisi` null | `mockReq.session.user.id_divisi = null` | Render `hmsi/hmsiDashboard` dengan semua nol | Render dengan total 0 dan `unreadCount:5` | Controller mengembalikan 0 tanpa query; assertion exact object on render terpenuhi. |
| Ambil statistik sukses (proker+laporan) | Mock DB: 2 SELECT (proker list, count laporan) | `db.query` dipanggil 2x; render dengan totalProker=3, selesai=1, berjalan=1 | Terpenuhi | Test menghitung berdasarkan `status_db` via helper `getDisplayStatus`; assertions pada isi render dan panggilan query sesuai urutan. |
| Tangani error DB | `db.query.mockRejectedValue(Error)` | `res.status(500).send('Terjadi kesalahan server saat memuat dashboard HMSI.')` | Terpenuhi | Assertion pada `status(500)` dan `.send(...)` terpenuhi; tidak terjadi render. |
| Laporan kosong → total 0 | Mock proker=[], laporan=[] | Render dengan totalLaporan:0 | Terpenuhi | Controller mengambil `laporanRows[0]?.total || 0`; dengan array kosong hasil 0, assertion render cocok. |
| Variasi `unreadCount` | `res.locals.unreadCount = 0` dan `{}` | Render bawa `unreadCount` 0 | Terpenuhi | Controller menggunakan `res.locals.unreadCount || 0`; assertions objectContaining pada render lolos. |

---

## 2) Proker Controller — `__tests__/hmsi/prokerController.test.js`
Target: `getAllProker`, `getDetailProker`, `createProker`, `getEditProker`, `updateProker`, `deleteProker`, `downloadDokumenPendukung`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| getAllProker: filter divisi | User HMSI divisi=10; DB kembalikan 3 baris | Query mengandung `WHERE u.id_divisi = ?` param `[10]`; render `kelolaProker` | Terpenuhi | Assertion pada argumen `db.query` memverifikasi SQL & parameter; render berisi array `programs`. |
| getAllProker: status dari DB | Baris status: `Sedang Berjalan`, `Selesai`, `null` | Status menjadi `Sedang Berjalan`, `Selesai`, `Sedang Berjalan` | Terpenuhi | Helper `getStatusFromDB` mengembalikan nilai DB atau default; assertion memeriksa status per indeks. |
| getDetailProker: authorized | Proker.id_divisi=10 (sama dengan user) | Render `hmsi/detailProker` memuat `status` | Terpenuhi | DB dipanggil 1x; objectContaining pada `proker` sesuai; tidak ada 403. |
| getDetailProker: divisi lain | Proker.id_divisi=99 | `status(403).send('Akses ditolak')` | Terpenuhi | Assertion `mockStatus(403)` dan `.send` sesuai; tidak ada render. |
| getDetailProker: tidak ada | DB `[[]]` | `status(404).send(...)` | Terpenuhi | Controller mendeteksi tidak ditemukan; assertion 404 terpenuhi. |
| createProker: sukses | `req.body` valid, `req.file` ada; `uuidv4` dimock; `db.query` resolve | Redirect ke `/hmsi/kelola-proker` | Terpenuhi | Test memastikan query insert dan notifikasi dipanggil; redirect assertion benar. |
| updateProker: dengan file baru | `req.file` ada; status bukan `Selesai` | Hapus file lama, update DB, redirect | Terpenuhi | `fs.unlinkSync` di-spy dipanggil; assertions pada panggilan `db.query` dan redirect cocok. |
| updateProker: status final | Status `Selesai` | `status(403)` | Terpenuhi | Test memberi data status final; controller tolak, assertion sesuai. |
| deleteProker: sukses | Status bukan `Selesai` | Hapus dokumen, delete cascading, redirect | Terpenuhi | Assertions urutan `db.query` (hapus laporan/notifikasi/proker) dan redirect sesuai. |
| deleteProker: status final | Status `Selesai` | `status(403)` | Terpenuhi | Sama seperti update; controller proteksi status final. |
| download: file ada | DB mengembalikan nama file; `fs.existsSync=true` | `res.download(path, filename)` | Terpenuhi | Assertion pada argumen `download` cocok. |
| download: file tidak ada di DB | `dokumentasi=null` | 404 + pesan | Terpenuhi | Assertion status dan pesan sesuai. |
| download: file tidak ada di disk | `existsSync=false` | 404 + pesan | Terpenuhi | Assertion status dan pesan sesuai. |

Catatan: Perubahan controller terbaru memecah `tanggalFormatted` → `tanggalMulaiFormatted` + `tanggalSelesaiFormatted` di detail; test tidak bergantung itu sehingga tetap PASS.

---

## 3) Laporan Controller — `__tests__/hmsi/laporanController.test.js`
Target: `getAllLaporan`, `getFormLaporan`, `createLaporan`, `getDetailLaporan`, `getEditLaporan`(implisit), `updateLaporan`, `deleteLaporan`, `downloadDokumentasi`, `getLaporanSelesai`, `getDetailLaporanSelesai`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| getAllLaporan: sukses | DB kembalikan 2 laporan; `query={}` | Render `hmsi/laporan` berisi tanggalFormatted & mime | Terpenuhi | Assertion pada `db.query` (param id_divisi) dan konten render (objectContaining) terpenuhi. |
| getAllLaporan: error DB | `db.query` reject | 500 + `{ success:false, error:'Gagal...' }` | Terpenuhi | Assertion pada `status(500)` dan `.json(...)` sesuai. |
| getFormLaporan: sukses | DB kembalikan daftar proker | Render `hmsi/laporanForm` + `programs` | Terpenuhi | Assertions render exact object dan `db.query` times=1. |
| getFormLaporan: error DB | Reject | 500 + `send('Gagal membuka form...')` | Terpenuhi | Assertion status/send sesuai. |
| createLaporan: sukses (transaksi) | Body lengkap + file; `db.getConnection` → mock transaction | 3 query (laporan, keuangan, notifikasi), commit, redirect sukses | Terpenuhi | Assertions jumlah panggilan begin/commit/release & redirect string sesuai. |
| createLaporan: field kurang | Body kosong | Redirect ke form + error | Terpenuhi | Assertion redirect URL parameter error; tidak ada `getConnection`. |
| createLaporan: error DB | Query throw | rollback + release + redirect error | Terpenuhi | Assertions rollback/release/redirect sesuai. |
| getDetailLaporan: sukses | Param `id=1`; DB kembalikan laporan (divisi sama) + evaluasi + unreadCount | Render detail dengan format tanggal dan mime | Terpenuhi | Assert `db.query` 3x dan payload render objectContaining; nav dan counts sesuai. |
| getDetailLaporan: akses ditolak | Laporan.id_divisi != user | Redirect ke `/hmsi/laporan?error=...` | Terpenuhi | Assertion redirect sesuai string error akses. |
| updateLaporan: sukses (transaksi) | Body valid; laporan.id_divisi=10; belum selesai | commit + redirect success | Terpenuhi | Assertions urutan query (cek, update, keuangan, notif), commit, redirect. |
| updateLaporan: tidak ditemukan | Cek awal `[[]]` | rollback + redirect error not found | Terpenuhi | Assertions rollback + redirect sesuai. |
| deleteLaporan: sukses | Ada laporan milik divisi; hapus keuangan→laporan→notif | commit + redirect success | Terpenuhi | Assertions urutan query transaksi & redirect sesuai. |
| deleteLaporan: tidak ditemukan | Cek awal `[[]]` | rollback + redirect error | Terpenuhi | Assertions sesuai. |
| downloadDokumentasi: sukses | DB mengembalikan `test-document.pdf`, file ada | `res.download(path, filename)` | Terpenuhi | Assertions pada argumen `db.query` dan `download` sama persis. |
| downloadDokumentasi: dokumentasi null | `dokumentasi:null` | 404 + pesan | Terpenuhi | Assertion status & pesan. |
| downloadDokumentasi: file tidak ada | `existsSync=false` | 404 + pesan | Terpenuhi | Assertion status & pesan. |
| getLaporanSelesai: sukses | DB laporan selesai + unreadCount | Render `laporanSelesai` berisi tanggalFormatted | Terpenuhi | Assertions times=2 dan payload render sesuai. |
| getDetailLaporanSelesai: sukses | DB detail laporan & evaluasi + unreadCount | Render `detailLaporanSelesai` | Terpenuhi | Assertions times=3 dan payload render sesuai. |
| getDetailLaporanSelesai: tidak ada | DB `[[]]` | Redirect error | Terpenuhi | Assertion redirect string sesuai. |

---

## 4) Evaluasi Controller — `__tests__/hmsi/evaluasiController.test.js`
Target: `getKelolaEvaluasi`, `getDetailEvaluasi`, `addKomentar`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| getKelolaEvaluasi: sukses | DB evaluasi (divisi=10) + unreadCount | Render `HMSI/kelolaEvaluasi` berisi tanggalFormatted & isRevisi | Terpenuhi | Assertions: param id_divisi pada query dan payload render cocok. |
| getKelolaEvaluasi: kosong | DB evaluasi=[]; unreadCount=0 | Render tanpa data | Terpenuhi | Payload render kosong & unreadCount=0 sesuai. |
| getKelolaEvaluasi: error DB | reject | 500 + pesan | Terpenuhi | Assertion status/send sesuai. |
| getDetailEvaluasi: sukses | Param id=1; DB detail divisi=10; unreadCount | Render `HMSI/detailEvaluasi` | Terpenuhi | Assertions pada argumen query (['1']) dan payload render sesuai. |
| getDetailEvaluasi: tidak ditemukan | DB `[[]]` | 404 + pesan | Terpenuhi | Assertion status/send sesuai. |
| getDetailEvaluasi: akses divisi lain | DB id_divisi=99 | 403 + pesan | Terpenuhi | Assertion status/send sesuai. |
| addKomentar: sukses | Body `komentar_hmsi` valid | 3 query (update, get laporan, notif) + redirect success | Terpenuhi | Assertions memeriksa SQL UPDATE mengandung `komentar_hmsi`, insert notifikasi terpanggil, dan redirect string. |
| addKomentar: komentar kosong/whitespace/missing | Body '', '   ', {} | Redirect error; tidak ada query | Terpenuhi | Assertions memastikan `db.query` tidak terpanggil dan redirect error parameter sesuai. |
| addKomentar: error DB | reject | 500 + pesan | Terpenuhi | Assertion status/send sesuai. |

---

## 5) Notifikasi Controller — `__tests__/hmsi/notifikasiController.test.js`
Target: `getAllNotifikasi`, `readAndRedirect`, `deleteAllRelatedNotif`, `deleteOldProkerNotif`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| getAllNotifikasi: sukses | DB kembalikan 2 notifikasi (laporan) | Render `hmsi/hmsiNotifikasi` dengan link `/hmsi/notifikasi/read/:id` | Terpenuhi | Assertions memeriksa parameter query (id_divisi 2x untuk join), mapping `linkUrl`, unreadCount=1. |
| getAllNotifikasi: unauthorized | `user=null` atau `role!=HMSI` | 401 + 'Unauthorized' | Terpenuhi | Status dan pesan sesuai; DB tidak dipanggil. |
| getAllNotifikasi: no divisi/empty/error | id_divisi null / data [] / reject | Render kosong atau 500 | Terpenuhi | Assertions sesuai skenario. |
| readAndRedirect: laporan/evaluasi/proker | Notifikasi tipe berbeda | Redirect ke `/hmsi/laporan/:id`, `/hmsi/kelola-evaluasi/:id`, `/hmsi/proker/:id` | Terpenuhi | Assertions: 3 panggilan DB (select notif, update baca, validasi), dan `mockRedirect` sesuai url. |
| readAndRedirect: notif tidak ada | DB `[[]]` | Render `partials/error` | Terpenuhi | Assertions judul & message error sesuai. |
| readAndRedirect: target dihapus | Validasi SELECT target kosong | Render error spesifik | Terpenuhi | Assertions pesan error sesuai. |
| deleteAllRelatedNotif | type=laporan/proker | Query delete kolom sesuai | Terpenuhi | Assertions SQL dan parameter sesuai input. |
| deleteOldProkerNotif | idProker ada / error DB | Jalankan delete / tetap aman | Terpenuhi | Assertions panggilan dan penanganan error internal. |

---

## 6) Profile Controller — `__tests__/hmsi/profileController.test.js`
Target: `getProfile`, `getEditProfile`, `postEditProfile`

| Test | Input & Mock | Ekspektasi | Hasil Aktual | Mengapa PASS |
| - | - | - | - | - |
| getProfile: sukses | DB kembalikan user id_anggota=1 | Render `hmsi/profile` | Terpenuhi | Assertions pada argumen query [1] dan payload render sama. |
| getProfile: tidak login | user=null | Redirect `/auth/login` | Terpenuhi | DB tidak dipanggil; redirect assertion sesuai. |
| getProfile: user tidak ditemukan | DB `[[]]` | 404 + pesan | Terpenuhi | Assertions 404/send sesuai. |
| getProfile: error DB | reject | 500 + pesan | Terpenuhi | Assertions status/send sesuai. |
| getEditProfile: sukses/tidak login | DB data / user null | Render form / redirect | Terpenuhi | Assertions sesuai skenario. |
| postEditProfile: update tanpa password | Body valid, no file | Update user + refresh session + redirect | Terpenuhi | Assertions query UPDATE, refresh session, flash success, redirect. |
| postEditProfile: update dengan foto | `req.file.filename` ada | Hapus foto lama, simpan path baru, redirect | Terpenuhi | `fs.unlinkSync` dipanggil; assertion parameter query sesuai path baru. |
| postEditProfile: update dengan password | password=confirm | Hash bcrypt, update `password=?` | Terpenuhi | Assertions panggilan `bcrypt.hash` dan parameter query berisi hash. |
| postEditProfile: password mismatch | password!=confirm | Flash error + redirect edit | Terpenuhi | `db.query` tidak dipanggil; redirect sesuai. |
| postEditProfile: missing required | id_anggota/nama kosong | Flash error + redirect edit | Terpenuhi | `db.query` tidak dipanggil; redirect sesuai. |
| postEditProfile: tidak login | user=null | Redirect login | Terpenuhi | Assertion redirect sesuai. |
| postEditProfile: error DB | reject | Flash error + redirect edit | Terpenuhi | Assertion flash error; redirect edit. |
| postEditProfile: gagal hapus file lama | `fs.unlinkSync` throw | Tetap redirect sukses | Terpenuhi | Error tertangani; assertion redirect final ke profile. |

---

## Kesimpulan & Alasan Umum "Mengapa PASS"
- Semua assertion Jest pada output (render/redirect/status/send) terpenuhi persis sesuai string/objek yang diharapkan.
- Jumlah dan urutan panggilan `db.query`/transaksi sesuai skenario (divalidasi dengan `toHaveBeenCalledTimes` dan inspeksi argumen `mock.calls`).
- Validasi akses (role/divisi) dan kondisi data (exists/not found) diuji; hasil sesuai kontrol alur di controller.
- Operasi file dan hashing diverifikasi melalui spy/mock (`fs.unlinkSync`, `res.download`, `bcrypt.hash`).
- Error handling konsisten: setiap reject menghasilkan status kode & pesan yang diuji secara eksplisit.

---

## Ekspor ke PDF/Word
Anda bisa mengekspor laporan Markdown ini ke PDF/Word:
- VS Code → Print to PDF: Open file → Ctrl+Shift+P → "Markdown: Print (Export)".
- Atau copy ke Word → Save as PDF.

File ini: `LAPORAN_RINCI_UNIT_TESTING_HMSI.md`

---

## Lampiran — Rincian 86 Test Case per Controller (Why PASS)

Di bawah ini adalah rincian setiap test case (86 total) dikelompokkan per controller. Setiap baris menjelaskan input/mock utama, ekspektasi, dan alasan mengapa dinyatakan PASS (berdasarkan assertion yang terpenuhi).

### A) Dashboard Controller (9 tests) — `__tests__/hmsi/dashboardController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| D-1 | redirect to login if no session | `req.session.user=null` | `res.redirect('/auth/login')` | `expect(mockRedirect).toHaveBeenCalledWith('/auth/login')`; tidak ada `db.query` dipanggil. |
| D-2 | render zeros if no id_divisi | `user.id_divisi=null` | Render `hmsi/hmsiDashboard` dengan semua nol | `expect(mockRender).toHaveBeenCalledWith(...)` object exact termasuk `totalProker:0`, `unreadCount:5`. |
| D-3 | fetch stats successfully | Mock 2 SELECT (proker, count laporan) | Render dengan `totalProker:3`, `prokerSelesai:1`, `prokerBerjalan:1`, `totalLaporan:15` | `expect(db.query).toHaveBeenCalledTimes(2)` dan payload render sesuai helper `getDisplayStatus`. |
| D-4 | handle proker data without updates | Proker final dan berjalan | Render hitung sesuai status_db tanpa update | Assertions sama seperti D-3; memastikan tidak ada UPDATE; hanya 2 SELECT. |
| D-5 | handle DB error | `db.query` reject | `status(500).send('Terjadi kesalahan server saat memuat dashboard HMSI.')` | `expect(mockStatus).toHaveBeenCalledWith(500)` dan `.send(...)`. |
| D-6 | handle missing laporan data | `rows=[]` untuk count | `totalLaporan:0` pada render | `expect(mockRender).toHaveBeenCalledWith(...)` dengan `totalLaporan:0`. |
| D-7 | handle unreadCount from res.locals | `res.locals.unreadCount=0` | Render `unreadCount:0` | `expect.objectContaining({ unreadCount:0 })` pada argumen render. |
| D-8 | handle missing res.locals.unreadCount | `res.locals={}` | Render `unreadCount:0` (default) | Assertion objectContaining pada render dengan `unreadCount:0`. |
| D-9 | status calculation helper correctness | Variasi tanggal/status_db | Hitungan Selesai/Berjalan sesuai helper | Assertions memverifikasi hasil akhir sesuai logika `getDisplayStatus` pada data mock. |

### B) Proker Controller (16 tests) — `__tests__/hmsi/prokerController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| P-1 | getAllProker filters by division | User HMSI `id_divisi=10` | Query mengandung `WHERE u.id_divisi = ?` | `expect(db.query).toHaveBeenCalledWith(SQL like, [10])`; render `kelolaProker`. |
| P-2 | getAllProker uses DB status | Data: `Sedang Berjalan`,`Selesai`, `null` | Status menjadi SB, Selesai, SB | Cek `programs[i].status`; default via `getStatusFromDB`. |
| P-3 | createProker success | Body valid + file + `uuidv4` | Redirect ke `/hmsi/kelola-proker` | Cek panggilan INSERT/Notif dan `expect(mockRedirect).toHaveBeenCalledWith(...)`. |
| P-4 | createProker invalid tanggal | Body tanggal invalid | Re-render form error | `expect(mockRender)` dipanggil ulang dengan error; tidak commit perubahan. |
| P-5 | deleteProker forbidden if Selesai | Status final | `status(403)` | `expect(mockStatus).toHaveBeenCalledWith(403)` + `.send(...)`. |
| P-6 | deleteProker success cascade | Status bukan final | Hapus laporan/notif/proker + files + redirect | Urutan `db.query` untuk DELETE sesuai; `fs.unlinkSync` dipanggil; redirect OK. |
| P-7 | getDetailProker authorized | Proker.id_divisi=10 | Render detail | `expect(mockRender).toHaveBeenCalledWith('hmsi/detailProker', ...)`. |
| P-8 | getDetailProker forbidden other division | Proker.id_divisi≠user | `status(403)` | Assertion 403 + message. |
| P-9 | getDetailProker not found | DB `[[]]` | `status(404)` | Assertion 404 + message. |
| P-10 | getEditProker valid status | Status bukan final | Render edit form | `expect(mockRender).toHaveBeenCalledWith('hmsi/editProker', ...)`. |
| P-11 | getEditProker forbidden if Selesai | Status final | `status(403)` | Assertion 403. |
| P-12 | updateProker (no new file) | Body valid, no file | UPDATE DB + redirect | Cek SQL UPDATE dipanggil, redirect OK. |
| P-13 | updateProker (with file) | Body valid + file | Hapus file lama + UPDATE + redirect | `fs.unlinkSync` dipanggil; assertion pada parameter UPDATE path baru. |
| P-14 | updateProker forbidden final | Status final | `status(403)` | Assertion 403. |
| P-15 | download file exists | DB filename + `existsSync=true` | `res.download(path, name)` | Assertion pada argumen `download`. |
| P-16 | download file missing | 1) DB null 2) fs missing | 404 + pesan | Assertions status(404) + pesan dua skenario. |

### C) Laporan Controller (19 tests) — `__tests__/hmsi/laporanController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| L-1 | getAllLaporan success | DB 2 rows (divisi user) | Render `hmsi/laporan` dgn tanggalFormatted/mime | `expect(db.query).toHaveBeenCalledWith(SQL, [id_divisi])`; objectContaining field di render. |
| L-2 | getAllLaporan DB error | Reject | `status(500).json({success:false,...})` | Assertion 500 + JSON error string. |
| L-3 | getFormLaporan success | DB daftar proker | Render `hmsi/laporanForm` berisi `programs` | `expect(mockRender).toHaveBeenCalledWith(...)`. |
| L-4 | getFormLaporan DB error | Reject | `status(500).send('Gagal membuka form...')` | Assertion 500 + send. |
| L-5 | createLaporan success (TX) | Body lengkap + file; mock transaction | 3 query (laporan, keuangan, notif) + commit + redirect | `beginTransaction/commit/release` terpanggil; redirect string cocok. |
| L-6 | createLaporan missing fields | Body kurang | Redirect ke form + error | `expect(db.getConnection).not.toHaveBeenCalled()`; redirect error parameter. |
| L-7 | createLaporan DB error | TX reject | `rollback` + `release` + redirect error | Assertions panggilan `rollback/release` + redirect. |
| L-8 | getDetailLaporan success | Param id=1; laporan divisi sama + evaluasi + unread | Render detail + evaluasi | 3 `db.query` terpanggil; render payload sesuai objectContaining. |
| L-9 | getDetailLaporan access denied | Laporan divisi lain | Redirect ke `/hmsi/laporan?error=...` | Assertion redirect string. |
| L-10 | updateLaporan success (TX) | Cek existing OK; update + keuangan + notif | Commit + redirect | Urutan `mockConnection.query` sesuai; commit + redirect OK. |
| L-11 | updateLaporan not found | Cek awal kosong | `rollback` + redirect not found | Assertions sesuai. |
| L-12 | deleteLaporan success (TX) | Ada laporan; delete keuangan→laporan→notif | Commit + redirect | Urutan query & commit diverifikasi; redirect OK. |
| L-13 | deleteLaporan not found | Cek awal kosong | `rollback` + redirect error | Assertions sesuai. |
| L-14 | downloadDokumentasi success | DB return filename; fs exists | `res.download(path, name)` | Assertion SQL select + argumen `download`. |
| L-15 | downloadDokumentasi dokumentasi null | `dokumentasi:null` | 404 + pesan | Assertion 404 + send. |
| L-16 | downloadDokumentasi file missing | `existsSync=false` | 404 + pesan | Assertion 404 + send. |
| L-17 | getLaporanSelesai success | DB selesai + unread | Render `laporanSelesai` | `expect(db.query).toHaveBeenCalledTimes(2)`; payload render sesuai. |
| L-18 | getDetailLaporanSelesai success | DB detail + evaluasi + unread | Render `detailLaporanSelesai` | 3 query terpanggil; payload render sesuai. |
| L-19 | getDetailLaporanSelesai not found | `[[]]` | Redirect error | Assertion redirect string. |

### D) Evaluasi Controller (12 tests) — `__tests__/hmsi/evaluasiController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| E-1 | getKelolaEvaluasi success | DB evaluasi divisi=10 + unread | Render `HMSI/kelolaEvaluasi` | Param id_divisi diverifikasi; payload render field tanggalFormatted/isRevisi. |
| E-2 | getKelolaEvaluasi empty | `rows=[]`, unread=0 | Render kosong | Payload render sesuai dan unreadCount=0. |
| E-3 | getKelolaEvaluasi DB error | Reject | `status(500).send('Gagal mengambil data evaluasi')` | Assertion 500 + send. |
| E-4 | getDetailEvaluasi success | Param id=1; divisi=10 | Render detail | `expect(db.query.mock.calls[0][1]).toEqual(['1'])`; payload render sesuai. |
| E-5 | getDetailEvaluasi not found | `[[]]` | `status(404)` | Assertion 404 + send. |
| E-6 | getDetailEvaluasi other division | id_divisi≠user | `status(403)` | Assertion 403 + send. |
| E-7 | getDetailEvaluasi DB error | Reject | `status(500)` | Assertion 500 + send. |
| E-8 | addKomentar success | Body `komentar_hmsi` valid | UPDATE + get laporan + INSERT notif + redirect | Cek SQL `UPDATE ... komentar_hmsi`, cek INSERT notif dipanggil, redirect string. |
| E-9 | addKomentar empty string | `komentar_hmsi=''` | Redirect error | `db.query` tidak dipanggil; redirect error. |
| E-10 | addKomentar whitespace only | `'   '` | Redirect error | Sama seperti E-9. |
| E-11 | addKomentar field missing | `{}` | Redirect error | Sama seperti E-9. |
| E-12 | addKomentar DB error | Reject | `status(500)` | Assertion 500 + send.

### E) Notifikasi Controller (16 tests) — `__tests__/hmsi/notifikasiController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| N-1 | getAllNotifikasi success | DB 2 notifikasi laporan | Render `hmsi/hmsiNotifikasi` + link read | `db.query` param `[id_divisi, id_divisi]` diverifikasi; mapping `linkUrl`, unreadCount=1. |
| N-2 | getAllNotifikasi unauthorized | `user=null` | `status(401)` + 'Unauthorized' | Assertion 401 + send; DB tidak dipanggil. |
| N-3 | getAllNotifikasi non-HMSI | `role='DPA'` | 401 | Sama seperti N-2. |
| N-4 | getAllNotifikasi no divisi | `id_divisi=null` | Render kosong | Payload render notifikasi=[]; unreadCount=0. |
| N-5 | getAllNotifikasi empty data | DB `[]` | Render kosong | Sama seperti N-4. |
| N-6 | getAllNotifikasi DB error | Reject | `status(500)` + pesan | Assertion 500 + send. |
| N-7 | readAndRedirect → laporan | Notif dengan `id_laporan` | Redirect `/hmsi/laporan/:id` | 3 query terpanggil; cek UPDATE status_baca dan `mockRedirect` URL. |
| N-8 | readAndRedirect → evaluasi | `id_evaluasi` | Redirect `/hmsi/kelola-evaluasi/:id` | Validasi SELECT evaluasi; redirect URL diverifikasi. |
| N-9 | readAndRedirect notif not found | `[[]]` | Render `partials/error` | Assertion judul & message error. |
| N-10 | readAndRedirect laporan not found | Validasi kosong | Render error "Laporan Dihapus" | Assertion judul & message. |
| N-11 | readAndRedirect DB error | Reject | Render error general | Assertion judul "Terjadi Kesalahan". |
| N-12 | readAndRedirect → proker | `id_ProgramKerja` | Redirect `/hmsi/proker/:id` | Validasi proker ada; redirect diverifikasi. |
| N-13 | deleteAllRelatedNotif laporan | entityId, type='laporan' | `DELETE ... WHERE id_laporan=?` | Assertion SQL + parameter. |
| N-14 | deleteAllRelatedNotif proker | type='proker' | `DELETE ... WHERE id_ProgramKerja=?` | Assertion SQL + parameter. |
| N-15 | deleteOldProkerNotif success | idProker valid | Jalankan DELETE | Assertion SQL + parameter. |
| N-16 | deleteOldProkerNotif DB error | Reject | Tidak throw; tetap selesai | Hanya memverifikasi fungsi handle error internal; `db.query` terpanggil.

### F) Profile Controller (14 tests) — `__tests__/hmsi/profileController.test.js`

| No | Test | Input/Mock Utama | Ekspektasi | Why PASS (Key Assertions) |
| - | - | - | - | - |
| PR-1 | getProfile success | DB user id=1 | Render `hmsi/profile` | `expect(db.query.mock.calls[0][1]).toEqual([1])`; payload render sesuai. |
| PR-2 | getProfile not logged in | `user=null` | Redirect login | DB tidak dipanggil; redirect sesuai. |
| PR-3 | getProfile user not found | `[[]]` | `status(404)` | Assertion 404 + send. |
| PR-4 | getProfile DB error | Reject | `status(500)` | Assertion 500 + send. |
| PR-5 | getEditProfile success | DB data | Render form | Assert render payload sesuai. |
| PR-6 | getEditProfile not logged in | `user=null` | Redirect login | Assertion redirect. |
| PR-7 | postEditProfile update no password | Body valid, no file | UPDATE user + refresh session + flash + redirect | `db.query` 2x; cek SQL UPDATE dan session terbarui; redirect OK. |
| PR-8 | postEditProfile update with photo | `file.filename` ada | Hapus foto lama; simpan path baru; redirect | `fs.unlinkSync` dipanggil; parameter UPDATE path baru diverifikasi. |
| PR-9 | postEditProfile update with password | password=confirm | `bcrypt.hash` + UPDATE `password=?` | Assertion hash dipanggil; parameter query berisi hash; redirect OK. |
| PR-10 | postEditProfile password mismatch | password≠confirm | Flash error + redirect edit | `db.query` tidak dipanggil; redirect benar. |
| PR-11 | postEditProfile missing required | NIM/Nama kosong | Flash error + redirect edit | `db.query` tidak dipanggil; redirect benar. |
| PR-12 | postEditProfile not logged in | `user=null` | Redirect login | Assertion redirect. |
| PR-13 | postEditProfile DB error | Reject | Flash error + redirect edit | Assertion flash error & redirect. |
| PR-14 | postEditProfile file deletion error | `fs.unlinkSync` throw | Tetap redirect sukses | Controller menangkap error; redirect tetap ke profile. |

---

Total terverifikasi: 9 (Dashboard) + 16 (Proker) + 19 (Laporan) + 12 (Evaluasi) + 16 (Notifikasi) + 14 (Profile) = 86 tests PASS.

