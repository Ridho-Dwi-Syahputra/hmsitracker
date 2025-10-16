// =====================================================
// controllers/dpa/laporanController.js
// Controller untuk DPA dalam mengelola laporan
// =====================================================

const db = require("../../config/db");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// direktori upload (untuk dokumentasi laporan)
const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

// =====================================================
// helper: deteksi mime dari ekstensi file
// =====================================================
function getMimeFromFile(filename) {
  if (!filename) return null;
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf": return "application/pdf";
    case ".doc": return "application/msword";
    case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".ppt": return "application/vnd.ms-powerpoint";
    case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".png": return "image/png";
    default: return "application/octet-stream";
  }
}

// =====================================================
// Helper: format tanggal (Bahasa Indonesia Sederhana)
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue || dateValue === "0000-00-00") return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  
  // Format: "Minggu, 12 Oktober 2025"
  return d.toLocaleDateString("id-ID", {
    weekday: "long",  // Nama hari lengkap
    day: "numeric",   // Tanggal
    month: "long",    // Nama bulan lengkap
    year: "numeric"   // Tahun
  });
}

// =====================================================
// 📑 Daftar laporan BELUM DIEVALUASI (Hanya yang belum pernah dievaluasi)
// =====================================================
exports.getAllLaporanDPA = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id_laporan,
        l.judul_laporan,
        l.tanggal,
        l.id_ProgramKerja,
        l.id_divisi,
        p.Nama_ProgramKerja AS namaProker,
        d.nama_divisi AS nama_divisi,
        e.status_konfirmasi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      -- ✅ DIPERBAIKI: Hanya tampilkan yang benar-benar belum punya evaluasi
      WHERE e.id_evaluasi IS NULL
      ORDER BY l.tanggal DESC
    `);

    const laporan = rows.map((r) => ({
      id_laporan: r.id_laporan,
      judul_laporan: r.judul_laporan,
      namaProker: r.namaProker || "-",
      divisi: r.nama_divisi || "Tidak Diketahui",
      tanggalFormatted: formatTanggal(r.tanggal),
      status: "Belum Dievaluasi",
    }));

    res.render("dpa/kelolaLaporan", {
      title: "Laporan Belum Dievaluasi",
      user: req.session.user,
      activeNav: "Belum dievaluasi",
      laporan,
      successMsg: req.query.success || null,
      errorMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getAllLaporanDPA:", err.message);
    res.status(500).send("Gagal mengambil laporan");
  }
};

// =====================================================
// 🗂️ Daftar laporan TELAH DIEVALUASI (Diterima & Revisi)
// =====================================================
exports.getLaporanDiterima = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id_laporan,
        l.judul_laporan,
        l.tanggal,
        l.id_ProgramKerja,
        l.id_divisi,
        p.Nama_ProgramKerja AS namaProker,
        d.nama_divisi AS nama_divisi,
        e.status_konfirmasi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      -- ✅ DIPERBAIKI: Tampilkan yang statusnya 'Selesai' ATAU 'Revisi'
      WHERE e.status_konfirmasi IN ('Selesai', 'Revisi')
      ORDER BY e.updated_at DESC
    `);

    const laporan = rows.map((r) => {
      // ✅ DIPERBAIKI: Status dinamis sesuai data dari database
      const status = r.status_konfirmasi === 'Selesai' ? 'Diterima' : 'Revisi';

      return {
        id_laporan: r.id_laporan,
        judul_laporan: r.judul_laporan,
        namaProker: r.namaProker || "-",
        divisi: r.nama_divisi || "Tidak Diketahui",
        tanggalFormatted: formatTanggal(r.tanggal),
        status, // Kirim status yang benar ke view
      };
    });

    res.render("dpa/laporanDiterima", {
      title: "Laporan Telah Dievaluasi",
      user: req.session.user,
      activeNav: "Telah Dievaluasi",
      laporan,
      successMsg: req.query.success || null,
      errorMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getLaporanDiterima:", err.message);
    res.status(500).send("Gagal mengambil laporan yang telah dievaluasi");
  }
};

// =====================================================
// 📄 Detail laporan (Read-only untuk DPA)
// =====================================================
exports.getDetailLaporanDPA = async (req, res) => {
  try {
    const idLaporan = req.params.id;

    const [rows] = await db.query(`
      SELECT 
        l.*, 
        p.Nama_ProgramKerja AS namaProker,
        d.nama_divisi AS nama_divisi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      WHERE l.id_laporan = ?
    `, [idLaporan]);

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");
    const laporan = rows[0];

    // Format tanggal pelaksanaan laporan
    laporan.tanggalFormatted = formatTanggal(laporan.tanggal);
    laporan.divisi = laporan.nama_divisi || "Tidak Diketahui";

    const [evaluasiRows] = await db.query(`
      SELECT e.*, u.nama AS namaEvaluator
      FROM Evaluasi e
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      WHERE e.id_laporan = ?
      ORDER BY e.updated_at DESC LIMIT 1
    `, [idLaporan]);

    const evaluasi = evaluasiRows.length ? evaluasiRows[0] : null;

    // Format tanggal evaluasi jika ada
    if (evaluasi && evaluasi.tanggal_evaluasi) {
      evaluasi.tanggal_evaluasi = formatTanggal(evaluasi.tanggal_evaluasi);
    }

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);
    
    // ✅ DIPERBAIKI: Menentukan sidebar aktif berdasarkan status evaluasi
    let activeNav = "Belum dievaluasi";
    if (evaluasi && (evaluasi.status_konfirmasi === 'Selesai' || evaluasi.status_konfirmasi === 'Revisi')) {
      activeNav = "Telah Dievaluasi";
    }

    res.render("dpa/detailLaporan", {
      title: "Detail Laporan",
      user: req.session.user,
      activeNav: activeNav,
      laporan,
      evaluasi,
      errorMsg: null,
      successMsg: req.query.success || null,
    });

  } catch (err) {
    console.error("❌ Error getDetailLaporanDPA:", err.message);
    res.status(500).send("Gagal mengambil detail laporan");
  }
};

// =====================================================
// 📝 Form evaluasi laporan
// =====================================================
exports.getFormEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.*, 
        p.Nama_ProgramKerja AS namaProker,
        d.nama_divisi AS namaDivisi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      WHERE l.id_laporan = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");
    const laporan = rows[0];

    laporan.tanggalFormatted = formatTanggal(laporan.tanggal);
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    const [evaluasiRows] = await db.query(`
      SELECT e.* FROM Evaluasi e WHERE e.id_laporan = ? ORDER BY e.updated_at DESC LIMIT 1
    `, [req.params.id]);

    const evaluasi = evaluasiRows.length ? evaluasiRows[0] : null;

    res.render("dpa/formEvaluasi", {
      title: "Evaluasi Laporan",
      user: req.session.user,
      activeNav: "Belum dievaluasi", // Tetap, karena ini bagian dari alur evaluasi
      laporan,
      evaluasi,
      errorMsg: req.query.error || null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getFormEvaluasi:", err.message);
    res.status(500).send("Gagal membuka form evaluasi");
  }
};

// =====================================================
// 💾 Simpan evaluasi + notifikasi ke HMSI (VERSI FINAL)
// =====================================================
exports.postEvaluasi = async (req, res) => {
  try {
    // 1. Ambil data dari form yang dikirim DPA
    const { komentar, status_konfirmasi } = req.body;
    const laporanId = req.params.id;
    const evaluatorId = req.session.user?.id_anggota;

    // Validasi input
    if (!komentar || !status_konfirmasi) {
      return res.redirect(`/dpa/laporan/${laporanId}/evaluasi?error=Komentar dan status wajib diisi`);
    }

    // 2. Simpan atau Update data di tabel `Evaluasi`
    const [cek] = await db.query(`SELECT id_evaluasi FROM Evaluasi WHERE id_laporan = ?`, [laporanId]);
    let idEvaluasi;

    if (cek.length) {
      // Jika evaluasi sudah ada, UPDATE
      idEvaluasi = cek[0].id_evaluasi;
      await db.query(
        `UPDATE Evaluasi SET komentar = ?, status_konfirmasi = ?, pemberi_evaluasi = ? WHERE id_evaluasi = ?`,
        [komentar, status_konfirmasi, evaluatorId, idEvaluasi]
      );
    } else {
      // Jika evaluasi baru, INSERT
      idEvaluasi = uuidv4();
      await db.query(
        `INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan, pemberi_evaluasi)
         VALUES (?, ?, ?, CURDATE(), ?, ?)`,
        [idEvaluasi, komentar, status_konfirmasi, laporanId, evaluatorId]
      );
    }

    // --- INI BAGIAN PALING PENTING ---

    // 3. Ambil detail laporan untuk membuat pesan
    const [laporanRows] = await db.query(
      `SELECT judul_laporan, id_divisi FROM Laporan WHERE id_laporan = ?`, [laporanId]
    );
    if (!laporanRows.length) {
      throw new Error("Laporan tidak ditemukan saat hendak membuat notifikasi.");
    }
    const laporan = laporanRows[0];

    // 4. Buat pesan notifikasi yang dinamis dan informatif
    // Menggunakan backtick (`)
const pesanNotifikasi = `DPA telah memberi evaluasi pada "${laporan.judul_laporan}" dan mengubah statusnya menjadi **${status_konfirmasi}**`;

    // 5. Hapus notifikasi evaluasi lama (jika ada) agar tidak duplikat
    await db.query(`DELETE FROM Notifikasi WHERE id_evaluasi = ?`, [idEvaluasi]);

    // 6. Simpan notifikasi BARU dengan pesan yang sudah bagus
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, status_baca, id_divisi, id_laporan, id_evaluasi)
       VALUES (?, ?, 'HMSI', 0, ?, ?, ?)`,
      [uuidv4(), pesanNotifikasi, laporan.id_divisi, laporanId, idEvaluasi]
    );

    // 7. Update kolom status_laporan di tabel Laporan agar data sinkron
    await db.query(`UPDATE Laporan SET status_laporan = ? WHERE id_laporan = ?`, [status_konfirmasi, laporanId]);

    // 8. Redirect DPA ke halaman yang sesuai
    res.redirect(`/dpa/laporanDiterima?success=Evaluasi untuk laporan "${laporan.judul_laporan}" berhasil disimpan`);

  } catch (err) {
    console.error("❌ Error postEvaluasi:", err.message);
    res.status(500).send("Gagal menyimpan evaluasi");
  }
};

// =====================================================
// Daftar semua evaluasi
// =====================================================
exports.getAllEvaluasiDPA = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*, 
        l.judul_laporan, 
        d.nama_divisi AS namaDivisi,
        u.nama AS namaEvaluator
      FROM Evaluasi e
      LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      ORDER BY e.tanggal_evaluasi DESC
    `);

    const evaluasi = rows.map((r) => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal_evaluasi)
    }));

    res.render("dpa/kelolaEvaluasi", {
      title: "Kelola Evaluasi",
      user: req.session.user,
      activeNav: "Evaluasi",
      evaluasi,
      successMsg: req.query.success || null,
      errorMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getAllEvaluasiDPA:", err.message);
    res.status(500).send("Gagal mengambil evaluasi");
  }
};