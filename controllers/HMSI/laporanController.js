// controllers/HMSI/laporanController.js
// Controller untuk CRUD Laporan HMSI (simpan file ke /public/uploads)

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");

// direktori upload (harus sama dengan middleware)
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
// helper: safely remove file if exists
// =====================================================
function safeRemoveFile(filename) {
  if (!filename) return;
  try {
    const fp = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  } catch (err) {
    console.error("⚠️ gagal menghapus file lama:", err.message);
  }
}

// =====================================================
// 📄 Daftar semua laporan
// =====================================================
exports.getAllLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          l.*, 
          p.Nama_ProgramKerja AS namaProker
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

    res.render("hmsi/laporan", {
      title: "Daftar Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      successMsg: req.query.success || null,
      errorMsg: null
    });
  } catch (err) {
    console.error("❌ Error getAllLaporan:", err.message);
    res.status(500).send("Gagal mengambil laporan");
  }
};



// =====================================================
// ➕ Form tambah laporan
// =====================================================
exports.getFormLaporan = async (req, res) => {
  try {
    const [programs] = await db.query(
      "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
    );

    res.render("hmsi/laporanForm", {
      title: "Tambah Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      programs,
      old: {},
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getFormLaporan:", err.message);
    res.status(500).send("Gagal membuka form laporan");
  }
};

// =====================================================
// 💾 Simpan laporan baru
// =====================================================
exports.createLaporan = async (req, res) => {
  try {
    const {
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      dana_digunakan,
      sumber_dana,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
      tanggal,
    } = req.body;

    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      const [programs] = await db.query(
        "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
      );
      return res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user: req.session.user || { name: "Dummy User" },
        activeNav: "Laporan",
        programs,
        old: req.body,
        errorMsg: "Judul, Program Kerja, dan Deskripsi wajib diisi.",
        successMsg: null,
      });
    }

    const dokumentasi = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO Laporan 
        (id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat, dana_digunakan, sumber_dana, 
         persentase_kualitatif, persentase_kuantitatif, kendala, solusi, dokumentasi, id_ProgramKerja, tanggal)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        judul_laporan,
        deskripsi_kegiatan,
        sasaran,
        waktu_tempat,
        dana_digunakan,
        sumber_dana,
        persentase_kualitatif,
        persentase_kuantitatif,
        kendala,
        solusi,
        dokumentasi,
        id_ProgramKerja || null,
        tanggal || null,
      ]
    );

    res.redirect("/hmsi/laporan?success=Laporan berhasil ditambahkan");
  } catch (err) {
    console.error("❌ Error createLaporan:", err.message);
    try {
      const [programs] = await db.query(
        "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
      );
      res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user: req.session.user || { name: "Dummy User" },
        activeNav: "Laporan",
        programs,
        old: req.body,
        errorMsg: "Terjadi kesalahan saat menyimpan laporan.",
        successMsg: null,
      });
    } catch (e) {
      console.error("❌ Error fallback createLaporan:", e.message);
      res.status(500).send("Gagal menambahkan laporan");
    }
  }
};

// =====================================================
// 📄 Detail laporan
// =====================================================
exports.getDetailLaporan = async (req, res) => {
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

    let laporan = rows[0];

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

    res.render("hmsi/detailLaporan", {
      title: "Detail Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      errorMsg: null,
      successMsg: null
    });
  } catch (err) {
    console.error("❌ Error getDetailLaporan:", err.message);
    res.status(500).send("Gagal mengambil detail laporan");
  }
};

// =====================================================
// ✏️ Form edit laporan
// =====================================================
exports.getEditLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    const [programs] = await db.query(
      "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    let laporan = rows[0];

    let tanggalFormatted = "";
    if (laporan.tanggal && laporan.tanggal !== "0000-00-00") {
      const d = new Date(laporan.tanggal);
      if (!isNaN(d.getTime())) {
        tanggalFormatted = d.toISOString().split("T")[0];
      }
    }
    laporan.tanggalFormatted = tanggalFormatted;

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    res.render("hmsi/editLaporan", {
      title: "Edit Laporan",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Laporan",
      laporan,
      programs,
      old: {},
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getEditLaporan:", err.message);
    res.status(500).send("Gagal mengambil data laporan untuk edit");
  }
};

// =====================================================
// 💾 Update laporan
// =====================================================
exports.updateLaporan = async (req, res) => {
  try {
    const {
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      dana_digunakan,
      sumber_dana,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
      tanggal,
    } = req.body;

    const newFile = req.file ? req.file.filename : null;

    const [existingRows] = await db.query("SELECT dokumentasi FROM Laporan WHERE id_laporan = ?", [req.params.id]);
    const oldFile = existingRows.length ? existingRows[0].dokumentasi : null;

    let query = `
      UPDATE Laporan SET 
        judul_laporan=?, 
        deskripsi_kegiatan=?, 
        sasaran=?, 
        waktu_tempat=?, 
        dana_digunakan=?, 
        sumber_dana=?, 
        persentase_kualitatif=?, 
        persentase_kuantitatif=?, 
        kendala=?, 
        solusi=?, 
        id_ProgramKerja=?, 
        tanggal=?`;
    const params = [
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      dana_digunakan,
      sumber_dana,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja || null,
      tanggal || null,
    ];

    if (newFile) {
      query += `, dokumentasi=?`;
      params.push(newFile);
    }

    query += ` WHERE id_laporan=?`;
    params.push(req.params.id);

    await db.query(query, params);

    if (newFile && oldFile) {
      safeRemoveFile(oldFile);
    }

    res.redirect("/hmsi/laporan?success=Laporan berhasil diperbarui");
  } catch (err) {
    console.error("❌ Error updateLaporan:", err.message);

    try {
      const [programs] = await db.query(
        "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
      );
      const [rows] = await db.query(
        `SELECT l.*, p.Nama_ProgramKerja AS namaProker
         FROM Laporan l
         LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
         WHERE l.id_laporan = ?`,
        [req.params.id]
      );

      if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");
      let laporan = rows[0];

      let tanggalFormatted = "";
      if (laporan.tanggal && laporan.tanggal !== "0000-00-00") {
        const d = new Date(laporan.tanggal);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toISOString().split("T")[0];
        }
      }
      laporan.tanggalFormatted = tanggalFormatted;

      res.render("hmsi/editLaporan", {
        title: "Edit Laporan",
        user: req.session.user || { name: "Dummy User" },
        activeNav: "Laporan",
        programs,
        laporan,
        old: req.body,
        errorMsg: "Terjadi kesalahan saat update laporan.",
        successMsg: null,
      });
    } catch (e) {
      console.error("❌ Error fallback updateLaporan:", e.message);
      res.status(500).send("Gagal update laporan");
    }
  }
};

// =====================================================
// ❌ Hapus laporan
// =====================================================
exports.deleteLaporan = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT dokumentasi FROM Laporan WHERE id_laporan = ?", [req.params.id]);
    const file = rows.length ? rows[0].dokumentasi : null;

    await db.query("DELETE FROM Laporan WHERE id_laporan = ?", [req.params.id]);

    if (file) safeRemoveFile(file);

    res.redirect("/hmsi/laporan?success=Laporan berhasil dihapus");
  } catch (err) {
    console.error("❌ Error deleteLaporan:", err.message);
    res.status(500).send("Gagal menghapus laporan");
  }
};

// =====================================================
// ⬇️ Download Dokumentasi
// =====================================================
exports.downloadDokumentasi = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT dokumentasi FROM Laporan WHERE id_laporan = ?",
      [req.params.id]
    );

    if (!rows.length || !rows[0].dokumentasi) {
      return res.status(404).send("Dokumentasi tidak ditemukan");
    }

    const fileName = rows[0].dokumentasi;
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File dokumentasi tidak ditemukan di server");
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error("❌ Error downloadDokumentasi:", err.message);
    res.status(500).send("Gagal mengunduh dokumentasi");
  }
};
