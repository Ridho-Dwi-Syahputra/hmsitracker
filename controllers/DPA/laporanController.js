// =====================================================
// controllers/DPA/laporanController.js
// Controller untuk DPA dalam mengelola laporan
// DPA hanya bisa melihat laporan & memberi evaluasi
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
// 📑 Daftar semua laporan (Read-only untuk DPA)
// =====================================================
exports.getAllLaporanDPA = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, 
              p.Nama_ProgramKerja AS namaProker,
              e.status_konfirmasi
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
       ORDER BY l.tanggal DESC`
    );

    const laporan = rows.map(r => {
      let tanggalFormatted = "-";
      if (r.tanggal && r.tanggal !== "0000-00-00") {
        const d = new Date(r.tanggal);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }

      let status = "Belum Dievaluasi";
      if (r.status_konfirmasi === "Revisi") status = "Revisi";
      else if (r.status_konfirmasi === "Selesai") status = "Approved";

      return {
        ...r,
        tanggalFormatted,
        status,
      };
    });

    res.render("dpa/kelolaLaporan", {
      title: "Daftar Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
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
// 📄 Detail laporan (Read-only untuk DPA)
// =====================================================
exports.getDetailLaporanDPA = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, 
              p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    let laporan = rows[0];

    // format tanggal
    let tanggalFormatted = "-";
    if (laporan.tanggal && laporan.tanggal !== "0000-00-00") {
      const d = new Date(laporan.tanggal);
      if (!isNaN(d.getTime())) {
        tanggalFormatted = d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    laporan.tanggalFormatted = tanggalFormatted;

    // deteksi mime file dokumentasi
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    // ambil evaluasi terbaru
    const [evaluasiRows] = await db.query(
      `SELECT e.*, u.nama AS namaEvaluator
       FROM Evaluasi e
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE e.id_laporan = ?
       ORDER BY e.tanggal_evaluasi DESC
       LIMIT 1`,
      [req.params.id]
    );

    res.render("dpa/detailLaporan", {
      title: "Detail Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      evaluasi: evaluasiRows.length ? evaluasiRows[0] : null,
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
// 📝 Form evaluasi laporan
exports.getFormEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, 
              p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];

    // format tanggal
    let tanggalFormatted = "-";
    if (laporan.tanggal && laporan.tanggal !== "0000-00-00") {
      const d = new Date(laporan.tanggal);
      if (!isNaN(d.getTime())) {
        tanggalFormatted = d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    laporan.tanggalFormatted = tanggalFormatted;
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    res.render("dpa/formEvaluasi", {
      title: "Evaluasi Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      errorMsg: req.query.error || null,
      successMsg: null,
      oldData: req.query.oldData ? JSON.parse(req.query.oldData) : null,
    });
  } catch (err) {
    console.error("❌ Error getFormEvaluasi:", err.message);
    res.status(500).send("Gagal membuka form evaluasi");
  }
};


// =====================================================
// 💾 Simpan evaluasi + notifikasi HMSI
// =====================================================
exports.postEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi } = req.body;
    const laporanId = req.params.id;
    const evaluatorId = req.session.user?.id;

    if (!komentar || !status_konfirmasi) {
      const oldData = { komentar, status_konfirmasi };
      return res.redirect(
        `/dpa/laporan/${laporanId}/evaluasi?error=${encodeURIComponent(
          !komentar ? "Komentar wajib diisi" : "Status wajib dipilih"
        )}&oldData=${encodeURIComponent(JSON.stringify(oldData))}`
      );
    }
    if (!evaluatorId) {
      return res.status(401).send("Unauthorized: Login sebagai DPA dulu.");
    }

    const [cek] = await db.query(
      `SELECT id_evaluasi FROM Evaluasi WHERE id_laporan = ?`,
      [laporanId]
    );

    let idEvaluasi;
    if (cek.length) {
      idEvaluasi = cek[0].id_evaluasi;
      await db.query(
        `UPDATE Evaluasi
         SET komentar = ?, status_konfirmasi = ?, tanggal_evaluasi = NOW(), pemberi_evaluasi = ?
         WHERE id_evaluasi = ?`,
        [komentar, status_konfirmasi, evaluatorId, idEvaluasi]
      );
    } else {
      idEvaluasi = uuidv4();
      await db.query(
        `INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan, pemberi_evaluasi)
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [idEvaluasi, komentar, status_konfirmasi, laporanId, evaluatorId]
      );
    }

    // ambil detail laporan
    const [laporanRows] = await db.query(
      `SELECT judul_laporan, divisi FROM Laporan WHERE id_laporan = ?`,
      [laporanId]
    );
    const laporan = laporanRows[0];

    // notifikasi HMSI
    const pesan = `DPA memberi evaluasi pada laporan "${laporan.judul_laporan}"`;
    const idNotifikasi = uuidv4();
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, status_baca, divisi, id_laporan, id_evaluasi)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [idNotifikasi, pesan, laporan.divisi, laporanId, idEvaluasi]
    );

    res.redirect(`/dpa/kelolaLaporan?success=Evaluasi berhasil disimpan`);
  } catch (err) {
    console.error("❌ Error postEvaluasi:", err.message);
    res.status(500).send("Gagal menyimpan evaluasi");
  }
};

// =====================================================
// 📋 Daftar semua evaluasi
// =====================================================
exports.getAllEvaluasiDPA = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, l.judul_laporan, l.divisi, u.nama AS namaEvaluator
       FROM Evaluasi e
       LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       ORDER BY e.tanggal_evaluasi DESC`
    );

    const evaluasi = rows.map(r => {
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
      user: req.session.user || { name: "Dummy User" },
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
