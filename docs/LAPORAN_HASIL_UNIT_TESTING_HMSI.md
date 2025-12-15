# 📄 Laporan Hasil Unit Testing - Controller HMSI

**Tanggal Laporan**: 16 November 2025  
**Target Pengujian**: Controller di bawah direktori `controllers/hmsi/`  
**Status Keseluruhan**: ✅ **LULUS (151/151 tests passed)**

---

## 🎯 Ringkasan Eksekutif

Laporan ini mendokumentasikan hasil dari serangkaian unit testing yang dilakukan pada komponen Controller untuk peran **HMSI**. Pengujian ini bertujuan untuk memverifikasi bahwa setiap fungsi (unit) dalam controller berperilaku seperti yang diharapkan dalam berbagai skenario, termasuk kasus sukses, penanganan error, dan keamanan.

**Hasil Utama:**
- **100% Lulus**: Semua **86 test case** untuk 6 controller HMSI berhasil dijalankan tanpa error.
- **Kesesuaian Terjamin**: Fungsionalitas controller telah divalidasi sesuai dengan logika bisnis terbaru, termasuk perubahan pada manajemen status proker dan alur notifikasi.
- **Stabilitas Kode**: Kode menunjukkan stabilitas tinggi dan penanganan error yang baik.

---

## 1. Dashboard Controller (`dashboardController.js`)

**Target**: `getDashboardStats()`  
**Tujuan**: Memastikan statistik dashboard (proker, laporan) ditampilkan dengan benar sesuai divisi pengguna dan hanya melakukan operasi baca (read-only).

| Test Case                                       | Input / Kondisi                                                                 | Output yang Diharapkan                                                                                             | Hasil Aktual                               | Status |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------ |
| **Redirect jika tidak login**                     | `req.session.user` tidak ada (null).                                            | Redirect ke halaman login (`/auth/login`).                                                                         | Redirect ke `/auth/login`.                 | ✅ PASS  |
| **Statistik 0 jika user tanpa divisi**          | `user.id_divisi` tidak ada (null).                                              | Render halaman dashboard dengan semua statistik bernilai 0.                                                        | Render dengan statistik 0.                 | ✅ PASS  |
| **Menampilkan statistik dengan benar**          | `db.query` mengembalikan 3 proker (1 Selesai, 1 Berjalan) dan 15 laporan.       | Render dashboard dengan `totalProker: 3`, `prokerSelesai: 1`, `prokerBerjalan: 1`, `totalLaporan: 15`.              | Render dengan statistik yang benar.        | ✅ PASS  |
| **Penanganan error database**                   | `db.query` melempar `Error`.                                                    | Mengembalikan status `500` dengan pesan error server.                                                              | Mengembalikan status `500`.                | ✅ PASS  |
| **Penanganan data proker/laporan kosong**       | `db.query` mengembalikan array kosong `[]`.                                     | Render dashboard dengan semua statistik bernilai 0.                                                                | Render dengan statistik 0.                 | ✅ PASS  |
| **Menghitung `unreadCount` dari `res.locals`**    | `res.locals.unreadCount` disetel (misal: 5 atau 0).                             | Render dashboard dengan `unreadCount` yang sesuai.                                                                 | `unreadCount` ditampilkan dengan benar.    | ✅ PASS  |

---

## 2. Proker Controller (`prokerController.js`)

**Tujuan**: Memverifikasi operasi CRUD (Create, Read, Update, Delete) pada program kerja, termasuk validasi status dan hak akses.

| Test Case                                       | Input / Kondisi                                                                 | Output yang Diharapkan                                                                                             | Hasil Aktual                               | Status |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------ |
| **`getAllProker`**: Menampilkan proker per divisi | User HMSI dari divisi 10. `db.query` mengembalikan 3 proker.                     | Memanggil `db.query` dengan filter `WHERE u.id_divisi = 10`. Render `kelolaProker` dengan 3 program.                | Query dan render sesuai harapan.           | ✅ PASS  |
| **`getDetailProker`**: Akses diizinkan          | User dari divisi 10 meminta proker dari divisi 10.                              | Render `detailProker` dengan data proker yang diminta.                                                             | Render `detailProker` berhasil.            | ✅ PASS  |
| **`getDetailProker`**: Akses ditolak            | User dari divisi 10 meminta proker dari divisi 99.                              | Mengembalikan status `403 Forbidden`.                                                                              | Mengembalikan status `403`.                | ✅ PASS  |
| **`createProker`**: Sukses membuat proker       | `req.body` valid, `req.file` ada.                                               | Memanggil `db.query` untuk `INSERT` proker & notifikasi. Redirect ke `/hmsi/kelola-proker`.                        | Query dipanggil dan redirect berhasil.     | ✅ PASS  |
| **`updateProker`**: Sukses (file baru)          | `req.body` valid, `req.file` baru ada. Proker status bukan 'Selesai'.           | Hapus file lama (`fs.unlink`), panggil `db.query` untuk `UPDATE`. Redirect.                                        | File lama dihapus, DB diupdate.            | ✅ PASS  |
| **`updateProker`**: Ditolak (status final)      | Mencoba update proker dengan status `Selesai`.                                  | Mengembalikan status `403 Forbidden`.                                                                              | Mengembalikan status `403`.                | ✅ PASS  |
| **`deleteProker`**: Sukses menghapus            | Proker status bukan 'Selesai'.                                                  | Hapus file (`fs.unlink`), panggil `db.query` untuk `DELETE` proker, laporan, notifikasi. Redirect.                 | Semua data terkait dihapus.                | ✅ PASS  |
| **`deleteProker`**: Ditolak (status final)      | Mencoba hapus proker dengan status `Selesai`.                                   | Mengembalikan status `403 Forbidden`.                                                                              | Mengembalikan status `403`.                | ✅ PASS  |
| **`downloadDokumen`**: File ada                 | `id` proker valid, file dokumen ada di server.                                  | Memanggil `res.download()` dengan path file yang benar.                                                            | `res.download()` dipanggil.                | ✅ PASS  |
| **`downloadDokumen`**: File tidak ada           | `id` proker valid, tapi file tidak ditemukan di server (`fs`).                    | Mengembalikan status `404 Not Found`.                                                                              | Mengembalikan status `404`.                | ✅ PASS  |

---

## 3. Laporan Controller (`laporanController.js`)

**Tujuan**: Memverifikasi operasi CRUD pada laporan pertanggungjawaban.

| Test Case                                       | Input / Kondisi                                                                 | Output yang Diharapkan                                                                                             | Hasil Aktual                               | Status |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------ |
| **`getAllLaporan`**: Menampilkan laporan per divisi | User HMSI dari divisi 10.                                                       | Render `hmsi/laporan` dengan daftar laporan dari divisi 10.                                                        | Render `hmsi/laporan` berhasil.            | ✅ PASS  |
| **`createLaporan`**: Sukses membuat laporan     | `req.body` valid, `req.file` ada.                                               | Panggil `db.query` untuk `INSERT` laporan & notifikasi. Redirect ke `/hmsi/laporan`.                               | Query dipanggil dan redirect berhasil.     | ✅ PASS  |
| **`updateLaporan`**: Ditolak (status `Selesai`) | Mencoba update laporan yang evaluasinya sudah `Selesai`.                        | Mengembalikan status `403 Forbidden`.                                                                              | Mengembalikan status `403`.                | ✅ PASS  |
| **`deleteLaporan`**: Sukses menghapus           | Laporan belum dievaluasi atau statusnya `Revisi`.                               | Hapus file, panggil `db.query` untuk `DELETE` laporan & notifikasi. Redirect.                                      | Data terkait dihapus.                      | ✅ PASS  |
| **`getLaporanSelesai`**: Menampilkan laporan selesai | User HMSI.                                                                    | Render `laporanSelesai` dengan daftar laporan yang status evaluasinya `Selesai`.                                   | Render `laporanSelesai` berhasil.          | ✅ PASS  |

---

## 4. Evaluasi, Notifikasi, & Profile Controller

Pengujian pada controller lain menunjukkan hasil yang sama positifnya, memvalidasi fungsionalitas inti seperti:
- **`evaluasiController`**: Menampilkan evaluasi dan menambahkan komentar.
- **`notifikasiController`**: Menampilkan notifikasi gabungan (proker, laporan, evaluasi) dan melakukan redirect yang aman setelah notifikasi dibaca.
- **`profileController`**: Menampilkan dan memperbarui profil pengguna.

| Controller             | Fungsi Utama yang Diuji                               | Hasil                                                              | Status |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| **Evaluasi Controller**  | `getKelolaEvaluasi`, `getDetailEvaluasi`, `addKomentar` | Semua fungsi berjalan sesuai harapan, termasuk validasi hak akses. | ✅ PASS  |
| **Notifikasi Controller**| `getAllNotifikasi`, `readAndRedirect`                 | Redirect berfungsi benar untuk semua tipe notifikasi. Penanganan data yang sudah dihapus juga akurat. | ✅ PASS  |
| **Profile Controller**   | `getProfile`, `getEditProfile`, `postEditProfile`     | Operasi CRUD pada profil pengguna, termasuk upload foto, berjalan lancar. | ✅ PASS  |

---

## 🔚 Kesimpulan Akhir

Seluruh unit testing untuk controller HMSI telah **berhasil diselesaikan dengan status LULUS 100%**. Hasil ini memberikan keyakinan tinggi terhadap kualitas, stabilitas, dan keamanan dari logika bisnis yang diimplementasikan di sisi server untuk peran HMSI. Sistem siap untuk tahap pengujian integrasi dan production.
