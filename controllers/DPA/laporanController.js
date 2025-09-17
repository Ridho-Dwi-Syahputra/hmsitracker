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
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       ORDER BY l.id_laporan DESC`
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
      return { ...r, tanggalFormatted };
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
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    let laporan = rows[0];

    // Format tanggal
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

    // Deteksi MIME dokumentasi
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    // Ambil semua evaluasi yang terkait dengan laporan ini
    const [evaluasiRows] = await db.query(
      `SELECT e.*, u.nama AS namaEvaluator
       FROM Evaluasi e
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE e.id_laporan = ?
       ORDER BY e.tanggal_evaluasi DESC`,
      [req.params.id]
    );

    res.render("dpa/detailLaporan", {
      title: "Detail Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      evaluasi: evaluasiRows,
      errorMsg: null,
      successMsg: req.query.success || null,
    });
  } catch (err) {
    console.error("❌ Error getDetailLaporanDPA:", err.message);
    res.status(500).send("Gagal mengambil detail laporan");
  }
};

// =====================================================
// 📝 Form evaluasi laporan (DPA memberi komentar)
// =====================================================
exports.getFormEvaluasi = async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
            l.*, 
            p.Nama_ProgramKerja AS namaProker
         FROM Laporan l
         LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
         WHERE l.id_laporan = ?`,
        [req.params.id]
      );
  
      if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");
  
      const laporan = rows[0];
  
      // Format tanggal
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
  
      // 👉 Tambahkan ini supaya bisa preview PDF/IMG
      laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);
  
      res.render("dpa/formEvaluasi", {
        title: "Evaluasi Laporan",
        user: req.session.user || { name: "Dummy User" },
        activeNav: "Laporan",
        laporan,
        errorMsg: req.query.error || null,
        successMsg: null,
      });
    } catch (err) {
      console.error("❌ Error getFormEvaluasi:", err.message);
      res.status(500).send("Gagal membuka form evaluasi");
    }
  };

// =====================================================
// 💾 Simpan evaluasi laporan
// =====================================================
// =====================================================
// 💾 Simpan evaluasi laporan + buat notifikasi ke HMSI
// =====================================================
exports.postEvaluasi = async (req, res) => {
    try {
      const { komentar, status_konfirmasi } = req.body;
      const laporanId = req.params.id;
      const evaluatorId = req.session.user?.id_anggota;
  
      if (!komentar) {
        return res.redirect(`/dpa/laporan/${laporanId}/evaluasi?error=Komentar wajib diisi`);
      }
      if (!status_konfirmasi) {
        return res.redirect(`/dpa/laporan/${laporanId}/evaluasi?error=Status wajib dipilih`);
      }
      if (!evaluatorId) {
        return res.status(401).send("Unauthorized: Login sebagai DPA dulu.");
      }
  
      // simpan evaluasi
      const idEvaluasi = uuidv4();
      await db.query(
        `INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan, pemberi_evaluasi)
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [idEvaluasi, komentar, status_konfirmasi, laporanId, evaluatorId]
      );
  
      // ambil detail laporan + proker (untuk tahu divisi)
      const [laporanRows] = await db.query(
        `SELECT l.judul_laporan, p.id_ProgramKerja, p.Divisi
         FROM Laporan l
         LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
         WHERE l.id_laporan = ?`,
        [laporanId]
      );
      const laporan = laporanRows[0];
  
      // buat pesan notifikasi
      const pesan = `DPA memberi evaluasi pada laporan "${laporan.judul_laporan}"`;
  
      // simpan notifikasi → targetkan ke user HMSI sesuai divisi
      const idNotifikasi = uuidv4();
      await db.query(
        `INSERT INTO Notifikasi (id_notifikasi, pesan, status_baca, id_ProgramKerja, id_laporan, id_evaluasi)
         VALUES (?, ?, 0, ?, ?, ?)`,
        [idNotifikasi, pesan, laporan.id_ProgramKerja, laporanId, idEvaluasi]
      );
  
      res.redirect(`/dpa/kelolaEvaluasi?success=Evaluasi berhasil disimpan`);
    } catch (err) {
      console.error("❌ Error postEvaluasi:", err.message);
      res.status(500).send("Gagal menyimpan evaluasi");
    }
  };
  

// =====================================================
// 📋 Daftar semua evaluasi (untuk kelolaEvaluasi.ejs)
// =====================================================
exports.getAllEvaluasiDPA = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, l.judul_laporan, p.Nama_ProgramKerja, u.nama AS namaEvaluator
       FROM Evaluasi e
       LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
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
