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
// 📄 Daftar semua laporan (role-based, divisi dari user)
// =====================================================
exports.getAllLaporan = async (req, res) => {
  try {
    const user = req.session.user;

    let query = `
      SELECT l.*, p.Nama_ProgramKerja AS namaProker
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
    `;
    const params = [];

    // 🔒 Jika HMSI, filter berdasarkan divisi user
    if (user && user.role === "HMSI" && user.divisi) {
      query += " WHERE l.divisi = ? ";
      params.push(user.divisi);
    }

    query += " ORDER BY l.tanggal DESC";

    const [rows] = await db.query(query, params);

    const laporan = rows.map(r => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal),
      dokumentasi_mime: getMimeFromFile(r.dokumentasi),
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
// ➕ Form tambah laporan (pakai divisi dari user penanggung jawab)
// =====================================================
exports.getFormLaporan = async (req, res) => {
  try {
    const user = req.session.user;

    const [programs] = await db.query(
      `SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
       FROM Program_kerja p
       LEFT JOIN user u ON p.id_anggota = u.id_anggota
       WHERE u.divisi = ?`,
      [user.divisi]
    );

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
// 💾 Simpan laporan baru (divisi otomatis dari user)
// =====================================================
exports.createLaporan = async (req, res) => {
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

    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      return res.redirect("/hmsi/laporan?error=Judul, Proker, Deskripsi wajib diisi");
    }

    const dokumentasi = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO Laporan 
        (id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat, dana_digunakan, sumber_dana, 
         persentase_kualitatif, persentase_kuantitatif, kendala, solusi, dokumentasi, id_ProgramKerja, divisi, tanggal)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
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
        user.divisi || null, 
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
    const [rows] = await db.query(
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];

    if (user && user.role === "HMSI" && user.divisi !== laporan.divisi) {
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
// ✏️ Form edit laporan (pakai divisi dari penanggung jawab user)
// =====================================================
exports.getEditLaporan = async (req, res) => {
  try {
    const user = req.session.user;

    // Ambil laporan berdasarkan id
    const [rows] = await db.query(
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.id_laporan = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];

    // Batasi akses hanya untuk divisi yang sama
    if (user && user.role === "HMSI" && user.divisi !== laporan.divisi) {
      return res.status(403).send("Tidak boleh edit laporan divisi lain");
    }

    // Ambil daftar program kerja sesuai divisi user login
    const [programs] = await db.query(
      `SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
       FROM Program_kerja p
       LEFT JOIN user u ON p.id_anggota = u.id_anggota
       WHERE u.divisi = ?`,
      [user.divisi]
    );

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
// 💾 Update laporan (divisi otomatis dari user)
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

    // Ambil laporan lama untuk cek divisi & file
    const [existingRows] = await db.query(
      `SELECT dokumentasi, divisi
       FROM Laporan
       WHERE id_laporan = ?`,
      [req.params.id]
    );
    if (!existingRows.length) return res.status(404).send("Laporan tidak ditemukan");

    const oldFile = existingRows[0].dokumentasi;
    const divisiLaporan = existingRows[0].divisi;

    // Batasi hanya divisi yang sama
    if (user && user.role === "HMSI" && user.divisi !== divisiLaporan) {
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
        id_ProgramKerja=?, 
        divisi=?`;
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
      user.divisi || null, // ✅ divisi dari user login
    ];

    if (newFile) {
      query += `, dokumentasi=?`;
      params.push(newFile);
    }

    query += ` WHERE id_laporan=?`;
    params.push(req.params.id);

    await db.query(query, params);

    // Hapus file lama kalau ada yang baru
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
      `SELECT dokumentasi, divisi
       FROM Laporan
       WHERE id_laporan = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const file = rows[0].dokumentasi;
    const divisiLaporan = rows[0].divisi;

    if (user && user.role === "HMSI" && user.divisi !== divisiLaporan) {
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
