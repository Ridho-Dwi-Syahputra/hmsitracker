// =====================================================
// controllers/hmsi/laporanController.js
// CRUD Laporan HMSI (simpan file ke /public/uploads) + role-based access
// + Notifikasi otomatis untuk DPA
// + Sinkronisasi otomatis keuangan (pengeluaran kas HMSI)
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
// 📄 Daftar semua laporan
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
// ➕ Form tambah laporan
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
// 💾 Simpan laporan baru + keuangan
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
      sumber_dana_radio,
      sumber_dana_text,
      dana_terpakai,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
    } = req.body;

    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      return res.redirect("/hmsi/laporan?error=Judul, Proker, Deskripsi wajib diisi");
    }

    const sumberDana = sumber_dana_radio === "uang_kas"
      ? "Uang Kas HMSI"
      : (sumber_dana_text || null);

    // Normalisasi angka
    let danaDigunakanNum = dana_digunakan ? parseFloat(String(dana_digunakan).replace(/[^\d.-]/g, "")) : 0;
    let danaTerpakaiNum = dana_terpakai ? parseFloat(String(dana_terpakai).replace(/[^\d.-]/g, "")) : 0;

    // Samakan jika salah satu kosong
    if (danaDigunakanNum > 0 && danaTerpakaiNum === 0) danaTerpakaiNum = danaDigunakanNum;
    if (danaTerpakaiNum > 0 && danaDigunakanNum === 0) danaDigunakanNum = danaTerpakaiNum;

    const dokumentasi = req.file ? req.file.filename : null;
    const idLaporan = uuidv4();

    await db.query(
      `INSERT INTO Laporan 
        (id_laporan, judul_laporan, deskripsi_kegiatan, sasaran, waktu_tempat, dana_digunakan, 
         sumber_dana, sumber_dana_lainnya, dana_terpakai,
         persentase_kualitatif, persentase_kuantitatif, kendala, solusi, dokumentasi, id_ProgramKerja, divisi, tanggal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        idLaporan,
        judul_laporan,
        deskripsi_kegiatan,
        sasaran,
        waktu_tempat,
        danaDigunakanNum,
        sumberDana,
        sumber_dana_text || null,
        danaTerpakaiNum,
        persentase_kualitatif,
        persentase_kuantitatif,
        kendala,
        solusi,
        dokumentasi,
        id_ProgramKerja || null,
        user.divisi || null,
      ]
    );

    // 🔗 Tambah keuangan jika pakai kas HMSI
    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      const id_keuangan = uuidv4();
      await db.query(
        `INSERT INTO keuangan 
         (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at)
         VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())`,
        [
          id_keuangan,
          `Pengeluaran dari Laporan: ${judul_laporan}`,
          danaTerpakaiNum,
          idLaporan,
          user?.id_anggota || null
        ]
      );
    }

    // ✅ Notifikasi ke DPA
    const pesanNotif = `Divisi ${user.divisi} telah menambahkan laporan baru: ${judul_laporan}`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, created_at, status_baca)
       VALUES (?, ?, ?, NOW(), 0)`,
      [uuidv4(), pesanNotif, idLaporan]
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
// ✏️ Form edit laporan
// =====================================================
exports.getEditLaporan = async (req, res) => {
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
      return res.status(403).send("Tidak boleh edit laporan divisi lain");
    }

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
// 💾 Update laporan + keuangan
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
      sumber_dana_radio,
      sumber_dana_text,
      dana_terpakai,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja,
    } = req.body;

    const sumberDana = sumber_dana_radio === "uang_kas"
      ? "Uang Kas HMSI"
      : (sumber_dana_text || null);

    let danaDigunakanNum = dana_digunakan ? parseFloat(String(dana_digunakan).replace(/[^\d.-]/g, "")) : 0;
    let danaTerpakaiNum = dana_terpakai ? parseFloat(String(dana_terpakai).replace(/[^\d.-]/g, "")) : 0;

    // Samakan jika salah satu kosong
    if (danaDigunakanNum > 0 && danaTerpakaiNum === 0) danaTerpakaiNum = danaDigunakanNum;
    if (danaTerpakaiNum > 0 && danaDigunakanNum === 0) danaDigunakanNum = danaTerpakaiNum;

    const newFile = req.file ? req.file.filename : null;

    const [existingRows] = await db.query(
      `SELECT dokumentasi, divisi
       FROM Laporan
       WHERE id_laporan = ?`,
      [req.params.id]
    );
    if (!existingRows.length) return res.status(404).send("Laporan tidak ditemukan");

    const oldFile = existingRows[0].dokumentasi;
    const divisiLaporan = existingRows[0].divisi;

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
        sumber_dana_lainnya=?,
        dana_terpakai=?,
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
      danaDigunakanNum,
      sumberDana,
      sumber_dana_text || null,
      danaTerpakaiNum,
      persentase_kualitatif,
      persentase_kuantitatif,
      kendala,
      solusi,
      id_ProgramKerja || null,
      user.divisi || null,
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

    // 🔗 Sinkronisasi keuangan
    const [keuRows] = await db.query(`SELECT * FROM keuangan WHERE id_laporan=?`, [req.params.id]);
    const hasKeu = keuRows.length > 0;

    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      if (hasKeu) {
        await db.query(
          `UPDATE keuangan SET jumlah=?, sumber=?, tanggal=CURDATE() WHERE id_laporan=?`,
          [danaTerpakaiNum, `Pengeluaran dari Laporan: ${judul_laporan}`, req.params.id]
        );
      } else {
        const id_keuangan = uuidv4();
        await db.query(
          `INSERT INTO keuangan 
           (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at)
           VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())`,
          [
            id_keuangan,
            `Pengeluaran dari Laporan: ${judul_laporan}`,
            danaTerpakaiNum,
            req.params.id,
            user?.id_anggota || null
          ]
        );
      }
    } else {
      if (hasKeu) {
        await db.query(`DELETE FROM keuangan WHERE id_laporan=?`, [req.params.id]);
      }
    }

    // ✅ Notifikasi update
    const pesanNotif = `Divisi ${user.divisi} telah mengupdate laporan: ${judul_laporan}`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, created_at, status_baca)
       VALUES (?, ?, ?, NOW(), 0)`,
      [uuidv4(), pesanNotif, req.params.id]
    );

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
      `SELECT judul_laporan, dokumentasi, divisi
       FROM Laporan
       WHERE id_laporan = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

    const { judul_laporan, dokumentasi: file, divisi: divisiLaporan } = rows[0];

    if (user && user.role === "HMSI" && user.divisi !== divisiLaporan) {
      return res.status(403).send("Tidak boleh hapus laporan divisi lain");
    }

    await db.query("DELETE FROM keuangan WHERE id_laporan = ?", [req.params.id]);
    await db.query("DELETE FROM Laporan WHERE id_laporan = ?", [req.params.id]);

    if (file) safeRemoveFile(file);

    // ✅ Notifikasi delete
    const pesanNotif = `Divisi ${user.divisi} telah menghapus laporan: ${judul_laporan}`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, created_at, status_baca)
       VALUES (?, ?, NOW(), 0)`,
      [uuidv4(), pesanNotif]
    );

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
    const [rows] = await db.query("SELECT dokumentasi FROM Laporan WHERE id_laporan = ?", [req.params.id]);
    if (!rows.length) return res.status(404).send("Dokumentasi tidak ditemukan");

    const fileName = rows[0].dokumentasi;
    if (!fileName) return res.status(404).send("Tidak ada file dokumentasi");

    const filePath = path.join(UPLOAD_DIR, fileName);
    if (!fs.existsSync(filePath)) return res.status(404).send("File dokumentasi hilang");

    res.download(filePath, fileName);
  } catch (err) {
    console.error("❌ Error downloadDokumentasi:", err.message);
    res.status(500).send("Gagal mengunduh dokumentasi");
  }
};
