// =====================================================
// controllers/HMSI/prokerController.js
// Controller untuk Program Kerja (Proker) HMSI
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // ✅ untuk id notifikasi

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
// helper: format tanggal ke format Indonesia
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue || dateValue === "0000-00-00") return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =====================================================
// 📄 Ambil semua program kerja
// =====================================================
exports.getAllProker = async (req, res) => {
  try {
    const user = req.session.user;
    let query = `
      SELECT 
        p.id_ProgramKerja AS id, 
        p.Nama_ProgramKerja AS namaProker, 
        u.divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
    `;
    let params = [];

    // 🔹 HMSI hanya bisa lihat proker sesuai divisi
    if (user && user.role === "HMSI") {
      query += " WHERE u.divisi = ?";
      params.push(user.divisi);
    }

    query += " ORDER BY p.Tanggal_mulai DESC";

    const [rows] = await db.query(query, params);

    // Tambahkan status otomatis berdasarkan tanggal
    const programs = rows.map(r => {
      const today = new Date();
      const start = r.tanggal_mulai ? new Date(r.tanggal_mulai) : null;
      const end = r.tanggal_selesai ? new Date(r.tanggal_selesai) : null;

      let status = "Belum Dimulai";
      if (start && today >= start && (!end || today <= end)) {
        status = "Sedang Berjalan";
      } else if (end && today > end) {
        status = "Selesai";
      }

      return {
        ...r,
        tanggalFormatted: formatTanggal(r.tanggal_mulai),
        status,
      };
    });

    res.render("hmsi/kelolaProker", {
      title: "Kelola Program Kerja",
      user: user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      programs,
    });
  } catch (err) {
    console.error("❌ Error getAllProker:", err.message);
    res.render("hmsi/kelolaProker", {
      title: "Kelola Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      programs: [],
    });
  }
};

// =====================================================
// 📄 Ambil detail satu program kerja
// =====================================================
exports.getDetailProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        p.id_ProgramKerja AS id,
        p.Nama_ProgramKerja AS namaProker,
        u.divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE p.id_ProgramKerja = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).send("Program Kerja tidak ditemukan");
    }

    const proker = rows[0];

    const today = new Date();
    const start = proker.tanggal_mulai ? new Date(proker.tanggal_mulai) : null;
    const end = proker.tanggal_selesai ? new Date(proker.tanggal_selesai) : null;
    let status = "Belum Dimulai";
    if (start && today >= start && (!end || today <= end)) {
      status = "Sedang Berjalan";
    } else if (end && today > end) {
      status = "Selesai";
    }

    res.render("hmsi/detailProker", {
      title: "Detail Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      proker: {
        ...proker,
        tanggalFormatted: formatTanggal(proker.tanggal_mulai),
        status,
        dokumenMime: getMimeFromFile(proker.dokumen_pendukung),
      },
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getDetailProker:", err.message);
    res.status(500).send("Gagal mengambil detail program kerja");
  }
};

// =====================================================
// ➕ Tambah program kerja baru
// =====================================================
exports.createProker = async (req, res) => {
  try {
    const user = req.session.user;
    const { namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, id_anggota } = req.body;

    if (!namaProker || !penanggungJawab || !tanggal_mulai || !tanggal_selesai) {
      return res.render("hmsi/tambahProker", {
        title: "Tambah Proker",
        user: user,
        activeNav: "Program Kerja",
        old: req.body,
        errorMsg: "Semua field wajib diisi!",
        successMsg: null,
      });
    }

    const dokumen = req.file ? req.file.filename : null;

    // Insert Proker
    const [result] = await db.query(
      `INSERT INTO Program_kerja 
        (id_ProgramKerja, Nama_ProgramKerja, Deskripsi, Tanggal_mulai, Tanggal_selesai, Penanggung_jawab, id_anggota, Dokumen_pendukung)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, id_anggota || user.id, dokumen]
    );

    // 🟠 Tambahkan notifikasi
    const idNotifikasi = uuidv4();
    const pesan = `HMSI (${user.divisi}) telah membuat Program Kerja baru: "${namaProker}"`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, status_baca, divisi, id_ProgramKerja, created_at)
       VALUES (?, ?, 0, ?, (SELECT id_ProgramKerja FROM Program_kerja WHERE Nama_ProgramKerja=? ORDER BY Tanggal_mulai DESC LIMIT 1), NOW())`,
      [idNotifikasi, pesan, user.divisi, namaProker]
    );

    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil ditambahkan");
  } catch (err) {
    console.error("❌ Error createProker:", err.message);
    res.render("hmsi/tambahProker", {
      title: "Tambah Proker",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      old: req.body,
      errorMsg: "Terjadi kesalahan saat menyimpan program kerja.",
      successMsg: null,
    });
  }
};

// =====================================================
// ✏️ Ambil program kerja untuk edit
// =====================================================
exports.getEditProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Program_kerja WHERE id_ProgramKerja = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Program kerja tidak ditemukan");

    const proker = rows[0];

    // Format tanggal agar aman dipakai di input[type=date]
    const formatDate = (val) => {
      if (!val) return "";
      const d = new Date(val);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    proker.tanggal_mulaiFormatted = formatDate(proker.Tanggal_mulai);
    proker.tanggal_selesaiFormatted = formatDate(proker.Tanggal_selesai);

    res.render("hmsi/editProker", {
      title: "Edit Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      proker,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getEditProker:", err.message);
    res.status(500).send("Gagal mengambil data program kerja");
  }
};

// =====================================================
// 💾 Update program kerja
// =====================================================
exports.updateProker = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    const { namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, id_anggota } = req.body;

    const newFile = req.file ? req.file.filename : null;

    const [existingRows] = await db.query(
      "SELECT Dokumen_pendukung FROM Program_kerja WHERE id_ProgramKerja = ?",
      [id]
    );
    if (!existingRows.length) return res.status(404).send("Proker tidak ditemukan");

    const oldFile = existingRows[0].Dokumen_pendukung;

    let query = `
      UPDATE Program_kerja SET 
        Nama_ProgramKerja=?, 
        Deskripsi=?, 
        Tanggal_mulai=?, 
        Tanggal_selesai=?, 
        Penanggung_jawab=?, 
        id_anggota=?`;
    const params = [namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, id_anggota || user.id];

    if (newFile) {
      query += `, Dokumen_pendukung=?`;
      params.push(newFile);
    }

    query += ` WHERE id_ProgramKerja=?`;
    params.push(id);

    await db.query(query, params);

    if (newFile && oldFile) {
      safeRemoveFile(oldFile);
    }

    // 🟠 Tambahkan notifikasi update
    const idNotifikasi = uuidv4();
    const pesan = `HMSI (${user.divisi}) telah memperbarui Program Kerja: "${namaProker}"`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, status_baca, divisi, id_ProgramKerja, created_at)
       VALUES (?, ?, 0, ?, ?, NOW())`,
      [idNotifikasi, pesan, user.divisi, id]
    );

    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil diperbarui");
  } catch (err) {
    console.error("❌ Error updateProker:", err.message);
    res.status(500).send("Gagal memperbarui program kerja");
  }
};

// =====================================================
// ❌ Hapus program kerja
// =====================================================
exports.deleteProker = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT Dokumen_pendukung FROM Program_kerja WHERE id_ProgramKerja = ?", [req.params.id]);
    const file = rows.length ? rows[0].Dokumen_pendukung : null;

    await db.query("DELETE FROM Program_kerja WHERE id_ProgramKerja = ?", [req.params.id]);

    if (file) safeRemoveFile(file);

    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil dihapus");
  } catch (err) {
    console.error("❌ Error deleteProker:", err.message);
    res.status(500).send("Gagal menghapus program kerja");
  }
};

// =====================================================
// ⬇️ Download Dokumen Pendukung
// =====================================================
exports.downloadDokumenPendukung = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT Dokumen_pendukung FROM Program_kerja WHERE id_ProgramKerja = ?",
      [req.params.id]
    );

    if (!rows.length || !rows[0].Dokumen_pendukung) {
      return res.status(404).send("Dokumen pendukung tidak ditemukan");
    }

    const fileName = rows[0].Dokumen_pendukung;
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File dokumen pendukung tidak ditemukan di server");
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error("❌ Error downloadDokumenPendukung:", err.message);
    res.status(500).send("Gagal mengunduh dokumen pendukung");
  }
};
