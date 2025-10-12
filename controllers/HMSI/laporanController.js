// =====================================================
// controllers/hmsi/laporanController.js
// Controller untuk Laporan HMSI
// - CRUD Laporan
// - Upload dokumentasi
// - Sinkronisasi otomatis dengan keuangan
// - Notifikasi otomatis ke DPA (target_role system)
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
// 📄 Ambil semua laporan (khusus divisi HMSI aktif)
//    hanya tampilkan yang belum dievaluasi
// =====================================================
exports.getAllLaporan = async (req, res) => {
  try {
    const user = req.session.user;

    const [rows] = await db.query(
      `
      SELECT 
        l.id_laporan AS id,
        l.judul_laporan,
        l.deskripsi_kegiatan,
        l.sasaran,
        l.waktu_tempat,
        l.dana_digunakan,
        l.sumber_dana,
        l.dokumentasi,
        l.tanggal,
        d.nama_divisi,
        p.Nama_ProgramKerja AS namaProker,
        COALESCE(e.status_konfirmasi, 'Belum Dievaluasi') AS status_konfirmasi
      FROM Laporan l
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      WHERE l.id_divisi = ?
        AND (e.status_konfirmasi IS NULL OR e.status_konfirmasi = 'Belum Dievaluasi')
      ORDER BY l.tanggal DESC, l.judul_laporan ASC
      `,
      [user.id_divisi]
    );

    const laporan = rows.map((r) => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal),
      dokumentasi_mime: getMimeFromFile(r.dokumentasi),
    }));

    res.render("hmsi/laporan", {
      title: "Pengajuan Laporan Proker",
      user,
      activeNav: "laporan",
      laporan,
      successMsg: req.query.success || null,
      errorMsg: req.query.error || null,
    });
  } catch (err) {
    console.error("❌ getAllLaporan error:", err.message);
    res.status(500).json({ success: false, error: "Gagal mengambil data laporan" });
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
      SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker
      FROM Program_kerja
      WHERE id_divisi = ?
      ORDER BY Nama_ProgramKerja ASC
      `,
      [user.id_divisi]
    );

    res.render("hmsi/laporanForm", {
      title: "Tambah Laporan",
      user,
      activeNav: "laporan",
      programs,
      laporan: null,
      formAction: "/hmsi/laporan/tambah",
      old: {},
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ getFormLaporan error:", err.message);
    res.status(500).send("Gagal membuka form tambah laporan");
  }
};

// =====================================================
// 💾 Tambah laporan baru
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
      // Logic for validation error...
    }

    const cleanNum = (v) => parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0;
    let danaDigunakanNum = cleanNum(dana_digunakan);
    let danaTerpakaiNum = cleanNum(dana_terpakai);
    if (danaDigunakanNum === 0 && danaTerpakaiNum > 0) danaDigunakanNum = danaTerpakaiNum;
    if (danaTerpakaiNum === 0 && danaDigunakanNum > 0) danaTerpakaiNum = danaDigunakanNum;

    const sumberDana = sumber_dana_radio === "uang_kas" ? "Uang Kas HMSI" : sumber_dana_text || null;
    const dokumentasi = req.file ? req.file.filename : null;
    const idLaporan = uuidv4();

    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
      INSERT INTO Laporan (
        id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat,
        dana_digunakan, sumber_dana, sumber_dana_lainnya, dana_terpakai,
        persentase_kualitatif, persentase_kuantitatif,
        deskripsi_target_kualitatif, deskripsi_target_kuantitatif,
        kendala, solusi, dokumentasi, id_ProgramKerja, id_divisi, tanggal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      `,
      [
        idLaporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat,
        danaDigunakanNum, sumberDana, sumber_dana_text || null, danaTerpakaiNum,
        persentase_kualitatif || null, persentase_kuantitatif || null,
        deskripsi_target_kualitatif || null, deskripsi_target_kuantitatif || null,
        kendala || null, solusi || null, dokumentasi, id_ProgramKerja, user.id_divisi,
      ]
    );

    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      await connection.query(
        `
        INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at) 
        VALUES (UUID(), CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())
        `,
        [`Pengeluaran dari Laporan: ${judul_laporan}`, danaTerpakaiNum, idLaporan, user.id_anggota]
      );
    }

    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} menambahkan laporan baru: "${judul_laporan}"`;
    await connection.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, target_role, id_divisi, created_at, status_baca) 
      VALUES (UUID(), ?, ?, 'DPA', ?, NOW(), 0)
      `,
      [notifMsg, idLaporan, user.id_divisi]
    );

    await connection.commit();
    res.redirect("/hmsi/laporan?success=Laporan berhasil ditambahkan");
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ createLaporan error:", err.message);
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
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT l.*, p.Nama_ProgramKerja AS namaProker, d.nama_divisi, e.status_konfirmasi
      FROM Laporan l
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
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
      activeNav: "laporan",
      laporan,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ getDetailLaporan error:", err.message);
    res.status(500).send("Gagal mengambil detail laporan");
  }
};

// =====================================================
// ✏️ Form edit laporan
// =====================================================
exports.getEditLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT l.*, e.status_konfirmasi
      FROM Laporan l
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      WHERE l.id_laporan = ?
      `,
      [id]
    );

    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const laporan = rows[0];
    if (user.role === "HMSI" && laporan.id_divisi !== user.id_divisi)
      return res.status(403).send("Tidak boleh edit laporan divisi lain");

    const [programs] = await db.query(
      `
      SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker
      FROM Program_kerja
      WHERE id_divisi = ?
      ORDER BY Tanggal_mulai DESC
      `,
      [user.id_divisi]
    );

    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);
    if (laporan.dokumentasi) {
      laporan.filePreview = `/uploads/${laporan.dokumentasi}`;
    } else {
      laporan.filePreview = null;
    }

    const redirectTarget = 
      (laporan.status_konfirmasi === "Revisi" || laporan.status_konfirmasi === "Selesai" || laporan.status_konfirmasi === "Disetujui")
        ? "/hmsi/kelola-evaluasi"
        : "/hmsi/laporan";

    res.render("hmsi/editLaporan", {
      title: "Edit Laporan",
      user,
      activeNav: "laporan",
      laporan,
      programs,
      redirectTarget,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ getEditLaporan error:", err.message);
    res.status(500).send("Gagal membuka form edit laporan");
  }
};

// =====================================================
// 💾 Update laporan
// =====================================================
exports.updateLaporan = async (req, res) => {
  let connection;
  try {
    const user = req.session.user;
    const { id } = req.params;
    const body = req.body;
    const newFile = req.file ? req.file.filename : null;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT l.dokumentasi, l.id_divisi, e.status_konfirmasi
      FROM Laporan l
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      WHERE l.id_laporan = ?
      `,
      [id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).send("Laporan tidak ditemukan");
    }

    const oldFile = rows[0].dokumentasi;
    const divisiLaporan = rows[0].id_divisi;
    const statusEvaluasi = rows[0].status_konfirmasi;

    if (user.role === "HMSI" && divisiLaporan !== user.id_divisi) {
      await connection.rollback();
      return res.status(403).send("Tidak boleh ubah laporan divisi lain");
    }

    const cleanNumber = (v) => parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0;
    let danaDigunakanNum = cleanNumber(body.dana_digunakan);
    let danaTerpakaiNum = cleanNumber(body.dana_terpakai);
    if (danaDigunakanNum === 0 && danaTerpakaiNum > 0) danaDigunakanNum = danaTerpakaiNum;
    if (danaTerpakaiNum === 0 && danaDigunakanNum > 0) danaTerpakaiNum = danaDigunakanNum;

    const sumberDana = body.sumber_dana_radio === "uang_kas" ? "Uang Kas HMSI" : body.sumber_dana_text || null;

    let updateSQL = `
      UPDATE Laporan SET 
        judul_laporan=?, deskripsi_kegiatan=?, sasaran=?, waktu_tempat=?,
        dana_digunakan=?, sumber_dana=?, sumber_dana_lainnya=?, dana_terpakai=?,
        persentase_kualitatif=?, persentase_kuantitatif=?, 
        deskripsi_target_kualitatif=?, deskripsi_target_kuantitatif=?,
        kendala=?, solusi=?, id_ProgramKerja=?, id_divisi=?`;
    const params = [
      body.judul_laporan, body.deskripsi_kegiatan, body.sasaran, body.waktu_tempat,
      danaDigunakanNum, sumberDana, body.sumber_dana_text || null, danaTerpakaiNum,
      body.persentase_kualitatif || null, body.persentase_kuantitatif || null,
      body.deskripsi_target_kualitatif || null, body.deskripsi_target_kuantitatif || null,
      body.kendala || null, body.solusi || null, body.id_ProgramKerja || null, user.id_divisi,
    ];

    if (newFile) {
      updateSQL += ", dokumentasi=?";
      params.push(newFile);
    }

    updateSQL += " WHERE id_laporan=?";
    params.push(id);

    await connection.query(updateSQL, params);
    if (newFile && oldFile) safeRemoveFile(oldFile);

    const [keu] = await connection.query("SELECT id_keuangan FROM keuangan WHERE id_laporan=?", [id]);
    const hasKeu = keu.length > 0;

    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      if (hasKeu) {
        await connection.query(
          `UPDATE keuangan SET jumlah=?, sumber=?, tanggal=CURDATE() WHERE id_laporan=?`,
          [danaTerpakaiNum, `Pengeluaran dari Laporan: ${body.judul_laporan}`, id]
        );
      } else {
        await connection.query(
          `INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at) VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())`,
          [uuidv4(), `Pengeluaran dari Laporan: ${body.judul_laporan}`, danaTerpakaiNum, id, user.id_anggota]
        );
      }
    } else {
      await connection.query("DELETE FROM keuangan WHERE id_laporan=?", [id]);
    }

    const notifMsg = statusEvaluasi
      ? `HMSI dari divisi ${user.nama_divisi || "HMSI"} telah mengedit laporan yang telah dievaluasi: "${body.judul_laporan}"`
      : `Divisi ${user.nama_divisi || "HMSI"} memperbarui laporan: "${body.judul_laporan}"`;

    await connection.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, target_role, id_divisi, created_at, status_baca) VALUES (UUID(), ?, ?, 'DPA', ?, NOW(), 0)`,
      [notifMsg, id, user.id_divisi]
    );

    await connection.commit();

    const redirectTarget = 
      (statusEvaluasi === "Revisi" || statusEvaluasi === "Selesai" || statusEvaluasi === "Disetujui")
        ? "/hmsi/kelola-evaluasi"
        : "/hmsi/laporan";

    res.redirect(`${redirectTarget}?success=Laporan berhasil diperbarui`);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ updateLaporan error:", err.message);
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
    const { id } = req.params;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query("SELECT judul_laporan, dokumentasi, id_divisi FROM Laporan WHERE id_laporan=?", [id]);
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
      `INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, id_laporan, created_at, status_baca) VALUES (UUID(), ?, 'DPA', ?, ?, NOW(), 0)`,
      [notifMsg, user.id_divisi, id]
    );

    await connection.commit();
    res.redirect("/hmsi/laporan?success=Laporan berhasil dihapus");
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ deleteLaporan error:", err.message);
    res.status(500).send("Gagal menghapus laporan");
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================
// ⬇️ Download dokumentasi
// =====================================================
exports.downloadDokumentasi = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT dokumentasi FROM Laporan WHERE id_laporan=?", [id]);
    if (!rows.length || !rows[0].dokumentasi)
      return res.status(404).send("Dokumentasi tidak ditemukan");

    const fileName = rows[0].dokumentasi;
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (!fs.existsSync(filePath))
      return res.status(404).send("File dokumentasi tidak ditemukan di server");

    res.download(filePath, fileName);
  } catch (err) {
    console.error("❌ downloadDokumentasi error:", err.message);
    res.status(500).send("Gagal mengunduh dokumentasi");
  }
};

// =====================================================
// 📄 Ambil daftar laporan yang statusnya "Selesai" (Diterima)
// =====================================================
exports.getLaporanSelesai = async (req, res) => {
  try {
    const user = req.session.user;
    const [rows] = await db.query(
      `
      SELECT 
        l.id_laporan,
        l.judul_laporan,
        p.Nama_ProgramKerja,
        e.tanggal_evaluasi
      FROM Laporan l
      JOIN Evaluasi e ON l.id_laporan = e.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      WHERE l.id_divisi = ? AND e.status_konfirmasi = 'Selesai'
      ORDER BY e.tanggal_evaluasi DESC
      `,
      [user.id_divisi]
    );

    const laporanSelesai = rows.map(item => ({
      ...item,
      tanggalFormatted: formatTanggal(item.tanggal_evaluasi)
    }));
    
    res.render("hmsi/laporanSelesai", {
      title: "Laporan Diterima",
      user,
      activeNav: 'laporanSelesai',
      laporanSelesai,
    });

  } catch (err) {
    console.error("❌ getLaporanSelesai error:", err.message);
    res.status(500).send("Gagal mengambil data laporan yang diterima.");
  }
};

// =====================================================
// 📄 Lihat detail laporan Selesai (mirip DPA view)
// =====================================================
exports.getDetailLaporanSelesai = async (req, res) => {
  try {
    const { idLaporan } = req.params;
    const user = req.session.user;

    const [laporanRows] = await db.query(
      `SELECT l.*, p.Nama_ProgramKerja AS namaProker, d.nama_divisi AS divisi
       FROM Laporan l
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
       WHERE l.id_laporan = ? AND l.id_divisi = ?`,
      [idLaporan, user.id_divisi]
    );

    if (!laporanRows.length) {
      return res.status(404).send("Laporan tidak ditemukan atau Anda tidak memiliki akses.");
    }
    
    const [evaluasiRows] = await db.query(
      `SELECT * FROM Evaluasi WHERE id_laporan = ? AND status_konfirmasi = 'Selesai'`,
      [idLaporan]
    );

    const laporan = laporanRows[0];
    laporan.tanggalFormatted = formatTanggal(laporan.tanggal);
    
    const evaluasi = evaluasiRows.length ? evaluasiRows[0] : null;
    if(evaluasi) {
      evaluasi.tanggal_evaluasi = formatTanggal(evaluasi.tanggal_evaluasi);
    }

    res.render("hmsi/detailLaporanSelesai", {
      title: "Detail Laporan Diterima",
      user,
      activeNav: 'laporanSelesai',
      laporan,
      evaluasi,
    });
  } catch (err) {
    console.error("❌ getDetailLaporanSelesai error:", err.message);
    res.status(500).send("Gagal mengambil detail laporan.");
  }
};