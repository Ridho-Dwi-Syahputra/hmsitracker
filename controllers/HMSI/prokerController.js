// =====================================================
// controllers/hmsi/prokerController.js
// Controller untuk Program Kerja (Proker) HMSI
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

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
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
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
// helper: hitung status otomatis (respect ke DPA)
// =====================================================
function calculateStatusWithLock(start, end, status_db) {
  if (status_db === "Selesai" || status_db === "Gagal") return status_db;

  const today = new Date();
  start = start ? new Date(start) : null;
  end = end ? new Date(end) : null;

  if (start && today < start) return "Belum Dimulai";
  if (start && end && today >= start && today <= end) return "Sedang Berjalan";
  if (end && today > end) return "Selesai";
  return "Belum Dimulai";
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
        d.nama_divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
    `;
    const params = [];

    if (user && user.role === "HMSI") {
      query += " WHERE u.id_divisi = ?";
      params.push(user.id_divisi);
    }

    query += " ORDER BY p.Tanggal_mulai DESC";

    const [rows] = await db.query(query, params);

    const programs = [];
    for (const r of rows) {
      const status = calculateStatusWithLock(r.tanggal_mulai, r.tanggal_selesai, r.status_db);
      if (status !== r.status_db && !(r.status_db === "Selesai" || r.status_db === "Gagal")) {
        await db.query("UPDATE Program_kerja SET Status=? WHERE id_ProgramKerja=?", [status, r.id]);
      }

      programs.push({
        ...r,
        tanggalFormatted: formatTanggal(r.tanggal_mulai),
        status,
      });
    }

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
// 📄 Detail Program Kerja
// =====================================================
exports.getDetailProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.id_ProgramKerja AS id,
        p.Nama_ProgramKerja AS namaProker,
        d.nama_divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db,
        u.id_divisi
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE p.id_ProgramKerja = ?
      `,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Program Kerja tidak ditemukan");
    const proker = rows[0];
    const user = req.session.user;

    if (user.role === "HMSI" && user.id_divisi !== proker.id_divisi) {
      return res.status(403).send("Akses ditolak ke proker divisi lain");
    }

    const status = calculateStatusWithLock(proker.tanggal_mulai, proker.tanggal_selesai, proker.status_db);
    if (status !== proker.status_db && !(proker.status_db === "Selesai" || proker.status_db === "Gagal")) {
      await db.query("UPDATE Program_kerja SET Status=? WHERE id_ProgramKerja=?", [status, proker.id]);
    }

    res.render("hmsi/detailProker", {
      title: "Detail Program Kerja",
      user,
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
// ➕ Tambah Program Kerja
// =====================================================
exports.createProker = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.id_anggota || !user.id_divisi) {
      return res.status(400).send("Data pengguna tidak lengkap untuk membuat program kerja");
    }

    const { 
      namaProker, 
      deskripsi, 
      tanggal_mulai, 
      tanggal_selesai, 
      penanggungJawab,
      targetKuantitatif,
      targetKualitatif 
    } = req.body;

    // 🔹 Validasi wajib isi
    if (
      !namaProker || 
      !deskripsi || 
      !tanggal_mulai || 
      !tanggal_selesai || 
      !penanggungJawab ||
      !targetKuantitatif ||
      !targetKualitatif
    ) {
      return res.render("hmsi/tambahProker", {
        title: "Tambah Program Kerja",
        user,
        activeNav: "Program Kerja",
        old: req.body,
        errorMsg: "Semua field wajib diisi.",
        successMsg: null,
      });
    }

    // 🔹 Validasi tanggal
    if (new Date(tanggal_mulai) > new Date(tanggal_selesai)) {
      return res.render("hmsi/tambahProker", {
        title: "Tambah Program Kerja",
        user,
        activeNav: "Program Kerja",
        old: req.body,
        errorMsg: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai!",
        successMsg: null,
      });
    }

    const dokumen = req.file ? req.file.filename : null;
    const status = calculateStatusWithLock(tanggal_mulai, tanggal_selesai, null);

    // 🟢 Simpan ke database
    await db.query(
      `
      INSERT INTO Program_kerja 
      (id_ProgramKerja, Nama_ProgramKerja, Deskripsi, Tanggal_mulai, Tanggal_selesai, Penanggung_jawab, Target_Kuantitatif, Target_Kualitatif, id_anggota, id_divisi, Dokumen_pendukung, Status)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        namaProker,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        penanggungJawab,
        targetKuantitatif,
        targetKualitatif,
        user.id_anggota,
        user.id_divisi,
        dokumen,
        status,
      ]
    );

    // 🟢 Tambahkan notifikasi ke DPA
    const idNotif = uuidv4();
    const pesan = `Divisi ${user.nama_divisi || "HMSI"} menambahkan Program Kerja baru: "${namaProker}"`;
    await db.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, status_baca, created_at)
      VALUES (?, ?, 'DPA', ?, 0, NOW())
      `,
      [idNotif, pesan, user.id_divisi]
    );

    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil ditambahkan");
  } catch (err) {
    console.error("❌ Error createProker:", err.message);
    res.render("hmsi/tambahProker", {
      title: "Tambah Program Kerja",
      user: req.session.user,
      activeNav: "Program Kerja",
      old: req.body,
      errorMsg: "Terjadi kesalahan saat menyimpan program kerja.",
      successMsg: null,
    });
  }
};


// =====================================================
// ✏️ Ambil data untuk Edit Program
// =====================================================
exports.getEditProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Program_kerja WHERE id_ProgramKerja = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Program kerja tidak ditemukan");
    const proker = rows[0];

    const formatDate = (v) => (!v ? "" : new Date(v).toISOString().split("T")[0]);
    proker.tanggal_mulaiFormatted = formatDate(proker.Tanggal_mulai);
    proker.tanggal_selesaiFormatted = formatDate(proker.Tanggal_selesai);

    res.render("hmsi/editProker", {
      title: "Edit Program Kerja",
      user: req.session.user,
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
// 💾 Update Program Kerja
// =====================================================
exports.updateProker = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.id_anggota || !user.id_divisi) {
      return res.status(400).send("Data pengguna tidak lengkap untuk memperbarui program kerja");
    }

    const { id } = req.params;
    const { 
      namaProker, 
      deskripsi, 
      tanggal_mulai, 
      tanggal_selesai, 
      penanggungJawab,
      targetKuantitatif,
      targetKualitatif
    } = req.body;

    // 🔹 Validasi tanggal
    if (new Date(tanggal_mulai) > new Date(tanggal_selesai)) {
      return res.render("hmsi/editProker", {
        title: "Edit Program Kerja",
        user,
        activeNav: "Program Kerja",
        proker: { ...req.body, id },
        errorMsg: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai!",
        successMsg: null,
      });
    }

    // 🔹 Ambil data lama
    const [existingRows] = await db.query(
      "SELECT Dokumen_pendukung, Status FROM Program_kerja WHERE id_ProgramKerja = ?",
      [id]
    );
    if (!existingRows.length) return res.status(404).send("Program kerja tidak ditemukan");

    const oldFile = existingRows[0].Dokumen_pendukung;
    const status_db = existingRows[0].Status;
    const newFile = req.file ? req.file.filename : null;
    const status = calculateStatusWithLock(tanggal_mulai, tanggal_selesai, status_db);

    // 🟢 Query update dengan field baru
    let query = `
      UPDATE Program_kerja SET 
        Nama_ProgramKerja=?, 
        Deskripsi=?, 
        Tanggal_mulai=?, 
        Tanggal_selesai=?, 
        Penanggung_jawab=?, 
        Target_Kuantitatif=?, 
        Target_Kualitatif=?, 
        id_anggota=?, 
        id_divisi=?, 
        Status=?`;
    const params = [
      namaProker,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
      penanggungJawab,
      targetKuantitatif,
      targetKualitatif,
      user.id_anggota,
      user.id_divisi,
      status,
    ];

    if (newFile) {
      query += `, Dokumen_pendukung=?`;
      params.push(newFile);
    }

    query += ` WHERE id_ProgramKerja=?`;
    params.push(id);

    await db.query(query, params);

    // 🧹 Hapus file lama jika diganti
    if (newFile && oldFile) safeRemoveFile(oldFile);

    // 🟢 Tambahkan notifikasi ke DPA
    const idNotif = uuidv4();
    const pesan = `Divisi ${user.nama_divisi || "HMSI"} memperbarui Program Kerja: "${namaProker}"`;
    await db.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, id_ProgramKerja, status_baca, created_at)
      VALUES (?, ?, 'DPA', ?, ?, 0, NOW())
      `,
      [idNotif, pesan, user.id_divisi, id]
    );

    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil diperbarui");
  } catch (err) {
    console.error("❌ Error updateProker:", err.message);
    res.status(500).send("Gagal memperbarui program kerja");
  }
};


// =====================================================
// ❌ Hapus Program Kerja (hapus juga semua laporan terkait)
// =====================================================
exports.deleteProker = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;

    // 🔹 Ambil nama proker & dokumen
    const [rows] = await db.query(
      "SELECT Nama_ProgramKerja, Dokumen_pendukung FROM Program_kerja WHERE id_ProgramKerja = ?",
      [id]
    );
    if (!rows.length) return res.status(404).send("Program kerja tidak ditemukan");

    const { Nama_ProgramKerja, Dokumen_pendukung } = rows[0];

    // 🗑️ Ambil semua laporan terkait agar bisa hapus file dokumentasinya
    const [laporanRows] = await db.query(
      "SELECT dokumentasi FROM Laporan WHERE id_ProgramKerja = ?",
      [id]
    );

    for (const lap of laporanRows) {
      if (lap.dokumentasi) safeRemoveFile(lap.dokumentasi);
    }

    // 🧹 Hapus laporan terkait
    await db.query("DELETE FROM Laporan WHERE id_ProgramKerja = ?", [id]);

    // 🧹 Hapus notifikasi yang terhubung dengan proker ini
    await db.query("DELETE FROM Notifikasi WHERE id_ProgramKerja = ?", [id]);

    // 🗑️ Hapus dokumen pendukung proker
    if (Dokumen_pendukung) safeRemoveFile(Dokumen_pendukung);

    // 🟢 Notifikasi ke DPA bahwa proker dihapus
    const idNotif = uuidv4();
    const pesan = `Divisi ${user.nama_divisi || "HMSI"} menghapus Program Kerja: "${Nama_ProgramKerja}"`;
    await db.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, status_baca, created_at)
      VALUES (?, ?, 'DPA', ?, 0, NOW())
      `,
      [idNotif, pesan, user.id_divisi]
    );

    // 🔚 Hapus proker terakhir
    await db.query("DELETE FROM Program_kerja WHERE id_ProgramKerja = ?", [id]);

    res.redirect("/hmsi/kelola-proker?success=Program Kerja beserta seluruh laporan terkait telah dihapus");
  } catch (err) {
    console.error("❌ Error deleteProker:", err.message);
    res.status(500).send("Gagal menghapus program kerja beserta laporan terkait");
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
