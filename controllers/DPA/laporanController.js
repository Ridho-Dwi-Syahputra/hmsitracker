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

    const laporan = rows.map((r) => {
      let tanggalFormatted = "-";
      if (r.tanggal && r.tanggal !== "0000-00-00") {
        const d = new Date(r.tanggal);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
          });
        }
      }
      return {
        id_laporan: r.id_laporan,
        judul_laporan: r.judul_laporan,
        namaProker: r.namaProker || "-",
        divisi: r.nama_divisi || "Tidak Diketahui",
        tanggalFormatted,
        status: "Belum Dievaluasi",
      };
    });

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
      let tanggalFormatted = "-";
      if (r.tanggal && r.tanggal !== "0000-00-00") {
        const d = new Date(r.tanggal);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
          });
        }
      }
      
      // ✅ DIPERBAIKI: Status dinamis sesuai data dari database
      const status = r.status_konfirmasi === 'Selesai' ? 'Diterima' : 'Revisi';

      return {
        id_laporan: r.id_laporan,
        judul_laporan: r.judul_laporan,
        namaProker: r.namaProker || "-",
        divisi: r.nama_divisi || "Tidak Diketahui",
        tanggalFormatted,
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

    laporan.tanggalFormatted = "-";
    if (laporan.tanggal) {
      const parsed = new Date(laporan.tanggal);
      if (!isNaN(parsed.getTime())) {
        laporan.tanggalFormatted = parsed.toLocaleDateString("id-ID", {
          day: "2-digit", month: "short", year: "numeric",
        });
      }
    }
    laporan.divisi = laporan.nama_divisi || "Tidak Diketahui";

    const [evaluasiRows] = await db.query(`
      SELECT e.*, u.nama AS namaEvaluator
      FROM Evaluasi e
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      WHERE e.id_laporan = ?
      ORDER BY e.updated_at DESC LIMIT 1
    `, [idLaporan]);

    const evaluasi = evaluasiRows.length ? evaluasiRows[0] : null;

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);
    
    // ✅ DIPERBAIKI: Menentukan sidebar aktif berdasarkan status evaluasi
    let activeNav = "Belum dievaluasi";
    if (evaluasi) {
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

    let tanggalFormatted = "-";
    if (laporan.tanggal) {
      const d = new Date(laporan.tanggal);
      if (!isNaN(d.getTime())) {
        tanggalFormatted = d.toLocaleDateString("id-ID", {
          day: "2-digit", month: "short", year: "numeric",
        });
      }
    }
    laporan.tanggalFormatted = tanggalFormatted;
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
// 💾 Simpan evaluasi + notifikasi ke HMSI
// =====================================================
exports.postEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi } = req.body;
    const laporanId = req.params.id;
    const evaluatorId = req.session.user?.id_anggota;

    if (!komentar || !status_konfirmasi) {
      return res.redirect(`/dpa/laporan/${laporanId}/evaluasi?error=Komentar dan status wajib diisi`);
    }

    const [cek] = await db.query(`SELECT id_evaluasi FROM Evaluasi WHERE id_laporan = ?`, [laporanId]);
    let idEvaluasi;

    if (cek.length) {
      idEvaluasi = cek[0].id_evaluasi;
      await db.query(
        `UPDATE Evaluasi SET komentar = ?, status_konfirmasi = ?, pemberi_evaluasi = ? WHERE id_evaluasi = ?`,
        [komentar, status_konfirmasi, evaluatorId, idEvaluasi]
      );
    } else {
      idEvaluasi = uuidv4();
      await db.query(
        `INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan, pemberi_evaluasi)
         VALUES (?, ?, ?, CURDATE(), ?, ?)`,
        [idEvaluasi, komentar, status_konfirmasi, laporanId, evaluatorId]
      );
    }

    const [laporanRows] = await db.query(
      `SELECT judul_laporan, id_divisi FROM Laporan WHERE id_laporan = ?`, [laporanId]
    );
    const laporan = laporanRows[0];

    const pesan = `DPA memberi evaluasi pada laporan "${laporan.judul_laporan}"`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, status_baca, id_divisi, id_laporan, id_evaluasi)
       VALUES (?, ?, 'HMSI', 0, ?, ?, ?)`,
      [uuidv4(), pesan, laporan.id_divisi, laporanId, idEvaluasi]
    );

    res.redirect(`/dpa/laporanDiterima?success=Evaluasi berhasil disimpan`);
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

    const evaluasi = rows.map((r) => {
      let tanggalFormatted = "-";
      if (r.tanggal_evaluasi && r.tanggal_evaluasi !== "0000-00-00") {
        const d = new Date(r.tanggal_evaluasi);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }
      return { ...r, tanggalFormatted };
    });

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