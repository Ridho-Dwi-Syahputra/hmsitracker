// =====================================================
// controllers/HMSI/laporanController.js
// Controller untuk Laporan HMSI
// - CRUD Laporan
// - Upload dokumentasi
// - Sinkronisasi otomatis dengan keuangan
// - Notifikasi otomatis ke DPA
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

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
// Helper: safe query using a connection if provided
// =====================================================
async function runQuery(connOrPool, sql, params = []) {
  if (!connOrPool) throw new Error("runQuery: missing connection/pool");
  return connOrPool.query(sql, params);
}

// =====================================================
// 📄 Ambil semua laporan
// =====================================================
exports.getAllLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    let query = `
      SELECT 
        l.id_laporan AS id,
        l.judul_laporan,
        l.deskripsi_kegiatan,
        l.sasaran,
        l.waktu_tempat,
        l.dana_digunakan,
        l.sumber_dana,
        l.dana_terpakai,
        l.dokumentasi,
        l.tanggal,
        d.nama_divisi,
        p.Nama_ProgramKerja AS namaProker
      FROM Laporan l
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
    `;
    const params = [];

    if (user?.role === "HMSI" && user.id_divisi) {
      query += " WHERE l.id_divisi = ?";
      params.push(user.id_divisi);
    }

    query += " ORDER BY l.tanggal DESC";
    const [rows] = await db.query(query, params);

    const laporan = rows.map((r) => ({
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
      errorMsg: req.query.error || null,
    });
  } catch (err) {
    res.status(500).send("Gagal mengambil data laporan");
  }
};

// =====================================================
// ➕ Form tambah laporan
// =====================================================
exports.getFormLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const [programs] = await db.query(
      `
      SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE u.id_divisi = ?
      `,
      [user.id_divisi]
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
    res.status(500).send("Gagal membuka form tambah laporan");
  }
};

// =====================================================
// 💾 Tambah laporan baru (transactional)
// =====================================================
exports.createLaporan = async (req, res) => {
  let connection;
  try {
    const user = req.session.user;
    const {
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      dana_digunakan,
      sumber_dana_radio,
      sumber_dana_text,
      dana_terpakai,
      persentase_kualitatif,
      persentase_kuantitatif,
      deskripsi_target_kualitatif,
      deskripsi_target_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
    } = req.body;

    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      return res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user,
        activeNav: "Laporan",
        errorMsg: "Judul, Proker, dan Deskripsi wajib diisi.",
        successMsg: null,
        old: req.body,
      });
    }

    if (sumber_dana_radio !== "uang_kas" && !sumber_dana_text) {
      return res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user,
        activeNav: "Laporan",
        errorMsg: "Sumber dana lain harus diisi jika tidak menggunakan kas HMSI.",
        successMsg: null,
        old: req.body,
      });
    }

    // Normalisasi angka
    let danaDigunakanNum = parseFloat(String(dana_digunakan || "0").replace(/[^\d.-]/g, ""));
    let danaTerpakaiNum = parseFloat(String(dana_terpakai || "0").replace(/[^\d.-]/g, ""));
    if (isNaN(danaDigunakanNum)) danaDigunakanNum = 0;
    if (isNaN(danaTerpakaiNum)) danaTerpakaiNum = 0;
    if (danaDigunakanNum > 0 && danaTerpakaiNum === 0) danaTerpakaiNum = danaDigunakanNum;
    if (danaTerpakaiNum > 0 && danaDigunakanNum === 0) danaDigunakanNum = danaTerpakaiNum;

    const sumberDana = sumber_dana_radio === "uang_kas" ? "Uang Kas HMSI" : sumber_dana_text || null;
    const dokumentasi = req.file ? req.file.filename : null;
    const idLaporan = uuidv4();

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertLaporanSQL = `
      INSERT INTO Laporan (
        id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat,
        dana_digunakan, sumber_dana, sumber_dana_lainnya, dana_terpakai,
        persentase_kualitatif, persentase_kuantitatif,
        deskripsi_target_kualitatif, deskripsi_target_kuantitatif,
        kendala, solusi, dokumentasi, id_ProgramKerja, id_divisi, tanggal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `;
    const insertParams = [
      idLaporan,
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      danaDigunakanNum,
      sumberDana,
      sumber_dana_text || null,
      danaTerpakaiNum,
      persentase_kualitatif || null,
      persentase_kuantitatif || null,
      deskripsi_target_kualitatif || null,
      deskripsi_target_kuantitatif || null,
      kendala || null,
      solusi || null,
      dokumentasi,
      id_ProgramKerja,
      user.id_divisi || null,
    ];

    await connection.query(insertLaporanSQL, insertParams);

    // Jika pakai kas HMSI tambahkan entry ke keuangan
    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      const id_keuangan = uuidv4();
      const insertKeuSQL = `
        INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at)
        VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())
      `;
      const insertKeuParams = [
        id_keuangan,
        `Pengeluaran dari Laporan: ${judul_laporan}`,
        danaTerpakaiNum,
        idLaporan,
        user?.id_anggota || null,
      ];
      await connection.query(insertKeuSQL, insertKeuParams);
    }

    // Notifikasi ke DPA
    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} menambahkan laporan baru: "${judul_laporan}"`;
    const notifSQL = `
      INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, target_role, created_at, status_baca)
      VALUES (?, ?, ?, 'DPA', NOW(), 0)
    `;
    const notifParams = [uuidv4(), notifMsg, idLaporan];
    await connection.query(notifSQL, notifParams);

    await connection.commit();
    res.redirect("/hmsi/laporan?success=Laporan berhasil ditambahkan");
  } catch (err) {
    try {
      if (connection) await connection.rollback();
    } catch (_) {}
    res.status(500).send("Gagal menambahkan laporan");
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================
// 📄 Detail laporan
// =====================================================
exports.getDetailLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;

    const [rows] = await db.query(
      `
      SELECT l.*, p.Nama_ProgramKerja AS namaProker, d.nama_divisi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      WHERE l.id_laporan = ?
      `,
      [id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];
    if (user.role === "HMSI" && laporan.id_divisi !== user.id_divisi)
      return res.status(403).send("Tidak boleh akses laporan divisi lain");

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
    res.status(500).send("Gagal mengambil detail laporan");
  }
};

// =====================================================
// ✏️ Form edit laporan
// =====================================================
exports.getEditLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM Laporan WHERE id_laporan = ?", [id]);
    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];
    if (user.role === "HMSI" && laporan.id_divisi !== user.id_divisi)
      return res.status(403).send("Tidak boleh edit laporan divisi lain");

    const [programs] = await db.query(
      `
      SELECT p.id_ProgramKerja AS id, p.Nama_ProgramKerja AS namaProker
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE u.id_divisi = ?
      `,
      [user.id_divisi]
    );

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);

    res.render("hmsi/editLaporan", {
      title: "Edit Laporan",
      user,
      activeNav: "Laporan",
      laporan,
      programs,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    res.status(500).send("Gagal membuka form edit laporan");
  }
};

// =====================================================
// 💾 Update laporan (transactional)
// =====================================================
exports.updateLaporan = async (req, res) => {
  let connection;
  try {
    const user = req.session.user;
    const id = req.params.id;

    const {
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      dana_digunakan,
      sumber_dana_radio,
      sumber_dana_text,
      dana_terpakai,
      persentase_kualitatif,
      persentase_kuantitatif,
      deskripsi_target_kualitatif,
      deskripsi_target_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
    } = req.body;

    const sumberDana = sumber_dana_radio === "uang_kas" ? "Uang Kas HMSI" : sumber_dana_text || null;
    const newFile = req.file ? req.file.filename : null;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT dokumentasi, id_divisi FROM Laporan WHERE id_laporan = ?",
      [id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).send("Laporan tidak ditemukan");
    }

    const oldFile = rows[0].dokumentasi;
    const divisiLaporan = rows[0].id_divisi;

    if (user.role === "HMSI" && divisiLaporan !== user.id_divisi) {
      await connection.rollback();
      return res.status(403).send("Tidak boleh ubah laporan divisi lain");
    }

    // Normalisasi angka
    let danaDigunakanNum = parseFloat(String(dana_digunakan || "0").replace(/[^\d.-]/g, ""));
    let danaTerpakaiNum = parseFloat(String(dana_terpakai || "0").replace(/[^\d.-]/g, ""));
    if (isNaN(danaDigunakanNum)) danaDigunakanNum = 0;
    if (isNaN(danaTerpakaiNum)) danaTerpakaiNum = 0;
    if (danaDigunakanNum > 0 && danaTerpakaiNum === 0) danaTerpakaiNum = danaDigunakanNum;
    if (danaTerpakaiNum > 0 && danaDigunakanNum === 0) danaDigunakanNum = danaTerpakaiNum;

    // Build update
    let query = `
      UPDATE Laporan SET 
        judul_laporan=?, deskripsi_kegiatan=?, sasaran=?, waktu_tempat=?,
        dana_digunakan=?, sumber_dana=?, sumber_dana_lainnya=?, dana_terpakai=?,
        persentase_kualitatif=?, persentase_kuantitatif=?, 
        deskripsi_target_kualitatif=?, deskripsi_target_kuantitatif=?,
        kendala=?, solusi=?, id_ProgramKerja=?, id_divisi=?`;
    const params = [
      judul_laporan,
      deskripsi_kegiatan,
      sasaran,
      waktu_tempat,
      danaDigunakanNum,
      sumberDana,
      sumber_dana_text || null,
      danaTerpakaiNum,
      persentase_kualitatif || null,
      persentase_kuantitatif || null,
      deskripsi_target_kualitatif || null,
      deskripsi_target_kuantitatif || null,
      kendala || null,
      solusi || null,
      id_ProgramKerja || null,
      user.id_divisi || null,
    ];

    if (newFile) {
      query += ", dokumentasi=?";
      params.push(newFile);
    }

    query += " WHERE id_laporan=?";
    params.push(id);

    await connection.query(query, params);

    if (newFile && oldFile) safeRemoveFile(oldFile);

    // Sinkronisasi keuangan
    const [keuRows] = await connection.query(
      "SELECT id_keuangan FROM keuangan WHERE id_laporan=?",
      [id]
    );
    const hasKeu = keuRows.length > 0;

    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      if (hasKeu) {
        await connection.query(
          `UPDATE keuangan SET jumlah=?, sumber=?, tanggal=CURDATE() WHERE id_laporan=?`,
          [danaTerpakaiNum, `Pengeluaran dari Laporan: ${judul_laporan}`, id]
        );
      } else {
        const id_keuangan = uuidv4();
        await connection.query(
          `INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at)
           VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())`,
          [id_keuangan, `Pengeluaran dari Laporan: ${judul_laporan}`, danaTerpakaiNum, id, user.id_anggota || null]
        );
      }
    } else {
      await connection.query("DELETE FROM keuangan WHERE id_laporan=?", [id]);
    }

    // Notifikasi update
    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} memperbarui laporan: "${judul_laporan}"`;
    await connection.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, target_role, created_at, status_baca)
       VALUES (?, ?, ?, 'DPA', NOW(), 0)`,
      [uuidv4(), notifMsg, id]
    );

    await connection.commit();
    res.redirect("/hmsi/laporan?success=Laporan berhasil diperbarui");
  } catch (err) {
    try {
      if (connection) await connection.rollback();
    } catch (_) {}
    res.status(500).send("Gagal memperbarui laporan");
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================
// ❌ Hapus laporan
// =====================================================
exports.deleteLaporan = async (req, res) => {
  let connection;
  try {
    const user = req.session.user;
    const id = req.params.id;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT judul_laporan, dokumentasi, id_divisi FROM Laporan WHERE id_laporan=?",
      [id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).send("Laporan tidak ditemukan");
    }

    const { judul_laporan, dokumentasi, id_divisi } = rows[0];
    if (user.role === "HMSI" && id_divisi !== user.id_divisi) {
      await connection.rollback();
      return res.status(403).send("Tidak boleh hapus laporan divisi lain");
    }

    await connection.query("DELETE FROM keuangan WHERE id_laporan=?", [id]);
    await connection.query("DELETE FROM Laporan WHERE id_laporan=?", [id]);

    if (dokumentasi) safeRemoveFile(dokumentasi);

    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} menghapus laporan: "${judul_laporan}"`;
    await connection.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, created_at, status_baca)
       VALUES (?, ?, 'DPA', NOW(), 0)`,
      [uuidv4(), notifMsg]
    );

    await connection.commit();
    res.redirect("/hmsi/laporan?success=Laporan berhasil dihapus");
  } catch (err) {
    try {
      if (connection) await connection.rollback();
    } catch (_) {}
    res.status(500).send("Gagal menghapus laporan");
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================
// ⬇️ Download Dokumentasi
// =====================================================
exports.downloadDokumentasi = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query("SELECT dokumentasi FROM Laporan WHERE id_laporan=?", [id]);
    if (!rows.length || !rows[0].dokumentasi)
      return res.status(404).send("Dokumentasi tidak ditemukan");

    const fileName = rows[0].dokumentasi;
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (!fs.existsSync(filePath))
      return res.status(404).send("File dokumentasi tidak ditemukan di server");

    res.download(filePath, fileName);
  } catch (err) {
    res.status(500).send("Gagal mengunduh dokumentasi");
  }
};
