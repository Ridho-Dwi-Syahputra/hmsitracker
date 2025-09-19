// =====================================================
// controllers/HMSI/laporanController.js
// CRUD Laporan HMSI (simpan file ke /public/uploads) + role-based access
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");

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
// helper: safely remove file
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
// helper: format tanggal
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue || dateValue === "0000-00-00") return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// 📄 Daftar semua laporan (role-based)
// =====================================================
exports.getAllLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    let query = `
      SELECT l.*, p.Nama_ProgramKerja AS namaProker, u.divisi AS divisiProker
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
    `;
    let params = [];

    if (user && user.role === "HMSI" && user.divisi) {
      query += " WHERE u.divisi = ? ";
      params.push(user.divisi);
    }

    query += " ORDER BY l.tanggal DESC";

    const [rows] = await db.query(query, params);

    const laporan = rows.map(r => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal),
    }));

    res.render("hmsi/laporan", {
      title: "Daftar Laporan",
      user,
      activeNav: "Laporan",
      laporan,
      successMsg: req.query.success || null,
      errorMsg: null,
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
    const user = req.session.user;
    let query = `
      SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
    `;
    let params = [];

    if (user && user.role === "HMSI" && user.divisi) {
      query += " WHERE u.divisi = ?";
      params.push(user.divisi);
    }

    const [programs] = await db.query(query, params);

    res.render("hmsi/laporanForm", {
      title: "Tambah Laporan",
      user,
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
    } = req.body;

    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      return res.redirect("/hmsi/laporan?error=Judul, Proker, Deskripsi wajib diisi");
    }

    const dokumentasi = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO Laporan 
        (id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat, dana_digunakan, sumber_dana, 
         persentase_kualitatif, persentase_kuantitatif, kendala, solusi, dokumentasi, id_ProgramKerja, tanggal)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,

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
      ]
    );

    res.redirect("/hmsi/laporan?success=Laporan berhasil ditambahkan");
  } catch (err) {
    console.error("❌ Error createLaporan:", err.message);
    res.status(500).send("Gagal menambahkan laporan");
  }
};

// =====================================================
// 📄 Detail laporan
// =====================================================
exports.getDetailLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    let query = `
      SELECT l.*, p.Nama_ProgramKerja AS namaProker, u.divisi AS divisiProker
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE l.id_laporan = ?
    `;
    let params = [req.params.id];

    const [rows] = await db.query(query, params);
    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];

    // restrict HMSI divisi
    if (user && user.role === "HMSI" && user.divisi !== laporan.divisiProker) {
      return res.status(403).send("Tidak boleh akses laporan divisi lain");
    }

    laporan.tanggalFormatted = formatTanggal(laporan.tanggal);
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    res.render("hmsi/detailLaporan", {
      title: "Detail Laporan",
      user,
      activeNav: "Laporan",
      laporan,
      errorMsg: null,
      successMsg: null,
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
    const user = req.session.user;
    const [rows] = await db.query(
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker, u.divisi AS divisiProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN User u ON p.id_anggota = u.id_anggota
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];

    if (user && user.role === "HMSI" && user.divisi !== laporan.divisiProker) {
      return res.status(403).send("Tidak boleh edit laporan divisi lain");
    }

    let query = `
      SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
    `;
    let params = [];

    if (user && user.role === "HMSI" && user.divisi) {
      query += " WHERE u.divisi = ?";
      params.push(user.divisi);
    }
    const [programs] = await db.query(query, params);

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    res.render("hmsi/editLaporan", {
      title: "Edit Laporan",
      user,
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
    const user = req.session.user;
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
    } = req.body;

    const newFile = req.file ? req.file.filename : null;

    const [existingRows] = await db.query(
      `SELECT l.dokumentasi, u.divisi AS divisiProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN User u ON p.id_anggota = u.id_anggota
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );
    if (!existingRows.length) return res.status(404).send("Laporan tidak ditemukan");

    const oldFile = existingRows[0].dokumentasi;
    const divisiProker = existingRows[0].divisiProker;

    if (user && user.role === "HMSI" && user.divisi !== divisiProker) {
      return res.status(403).send("Tidak boleh update laporan divisi lain");
    }

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
        id_ProgramKerja=?`;
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
    res.status(500).send("Gagal update laporan");
  }
};

// =====================================================
// ❌ Hapus laporan
// =====================================================
exports.deleteLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const [rows] = await db.query(
      `SELECT l.dokumentasi, u.divisi AS divisiProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN User u ON p.id_anggota = u.id_anggota
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const file = rows[0].dokumentasi;
    const divisiProker = rows[0].divisiProker;

    if (user && user.role === "HMSI" && user.divisi !== divisiProker) {
      return res.status(403).send("Tidak boleh hapus laporan divisi lain");
    }

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
