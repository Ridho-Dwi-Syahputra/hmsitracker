// =====================================================
// controllers/hmsi/prokerController.js
// =====================================================

const db = require("../../config/db"); 
const path = require("path");          
const fs = require("fs");              
const { v4: uuidv4 } = require("uuid"); 

const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

// -----------------------------------------------------
// BAGIAN HELPER FUNCTIONS (Logika Pendukung)
// -----------------------------------------------------


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


function safeRemoveFile(filename) {
  if (!filename) return;
  try {
    const fp = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  } catch (err) {
    console.error("Gagal menghapus file lama:", err.message);
  }
}

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


function getStatusFromDB(status_db) {
  if (status_db && status_db.trim() !== '') {
    return status_db;
  }
  return "Sedang Berjalan";
}


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

    // Filter Proker berdasarkan divisi user HMSI
    if (user && user.role === "HMSI") {
      query += " WHERE u.id_divisi = ?";
      params.push(user.id_divisi);
    }

    query += " ORDER BY p.Tanggal_mulai DESC";
    const [rows] = await db.query(query, params);

    const programs = [];
    for (const r of rows) {
      const status = getStatusFromDB(r.status_db);
      programs.push({
        id: r.id,
        namaProker: r.namaProker,
        divisi: r.divisi || "Tidak Diketahui",
        deskripsi: r.deskripsi,
        tanggal_mulai: r.tanggal_mulai,
        tanggal_selesai: r.tanggal_selesai,
        penanggungJawab: r.penanggungJawab,
        dokumen_pendukung: r.dokumen_pendukung,
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
    console.error("Error getAllProker:", err.message);
    // Error handling untuk view
    res.render("hmsi/kelolaProker", {
      title: "Kelola Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Program Kerja",
      programs: [],
    });
  }
};

/**
 * [READ] Mengambil dan menampilkan detail satu Program Kerja.
 * Termasuk Validasi Keamanan (HMSI tidak boleh akses divisi lain).
 */
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
        p.Target_Kuantitatif,
        p.Target_Kualitatif,
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

    // Logika Keamanan: Validasi akses Proker divisi lain
    if (user.role === "HMSI" && user.id_divisi !== proker.id_divisi) {
      return res.status(403).send("Akses ditolak ke proker divisi lain");
    }

    const status = getStatusFromDB(proker.status_db);

    res.render("hmsi/detailProker", {
      title: "Detail Program Kerja",
      user,
      activeNav: "Program Kerja",
      proker: {
        id: proker.id,
        namaProker: proker.namaProker,
        divisi: proker.divisi || "Tidak Diketahui",
        deskripsi: proker.deskripsi,
        tanggal_mulai: proker.tanggal_mulai,
        tanggal_selesai: proker.tanggal_selesai,
        tanggalMulaiFormatted: formatTanggal(proker.tanggal_mulai),
        tanggalSelesaiFormatted: formatTanggal(proker.tanggal_selesai),
        penanggungJawab: proker.penanggungJawab,
        dokumen_pendukung: proker.dokumen_pendukung,
        Target_Kuantitatif: proker.Target_Kuantitatif || "-",
        Target_Kualitatif: proker.Target_Kualitatif || "-",
        status,
        dokumenMime: getMimeFromFile(proker.dokumen_pendukung),
      },
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("Error getDetailProker:", err.message);
    res.status(500).send("Gagal mengambil detail program kerja");
  }
};

/**
 * [CREATE] Menyimpan data Program Kerja baru ke database.
 * Termasuk Validasi input dan Notifikasi DPA.
 */
exports.createProker = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.id_anggota || !user.id_divisi) {
      return res.status(400).send("Data pengguna tidak lengkap untuk membuat program kerja");
    }

    const { 
      namaProker, deskripsi, tanggal_mulai, tanggal_selesai, 
      penanggungJawab, targetKuantitatif, targetKualitatif 
    } = req.body;

    // Validasi Wajib Isi
    if (
      !namaProker || !deskripsi || !tanggal_mulai || !tanggal_selesai || 
      !penanggungJawab || !targetKuantitatif || !targetKualitatif
    ) {
      return res.render("hmsi/tambahProker", {
        title: "Tambah Program Kerja", user, activeNav: "Program Kerja", old: req.body,
        errorMsg: "Semua field wajib diisi.", successMsg: null,
      });
    }

    // Validasi Tanggal (Logika Bisnis)
    if (new Date(tanggal_mulai) > new Date(tanggal_selesai)) {
      return res.render("hmsi/tambahProker", {
        title: "Tambah Program Kerja", user, activeNav: "Program Kerja", old: req.body,
        errorMsg: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai!", successMsg: null,
      });
    }

    const dokumen = req.file ? req.file.filename : null;
    const status = "Sedang Berjalan"; // Status default Proker baru
    const idProker = uuidv4();

    // Operasi DB 1: INSERT data Program_kerja
    await db.query(
      `
      INSERT INTO Program_kerja 
      (id_ProgramKerja, Nama_ProgramKerja, Deskripsi, Tanggal_mulai, Tanggal_selesai, Penanggung_jawab, Target_Kuantitatif, Target_Kualitatif, id_anggota, id_divisi, Dokumen_pendukung, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idProker, namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, 
        targetKuantitatif, targetKualitatif, user.id_anggota, user.id_divisi, dokumen, status,
      ]
    );

    // Operasi DB 2: INSERT Notifikasi ke DPA
    const idNotif = uuidv4();
    const pesan = `Divisi ${user.nama_divisi || "HMSI"} menambahkan Program Kerja baru: "${namaProker}"`;
    await db.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, id_ProgramKerja, status_baca, created_at)
      VALUES (?, ?, 'DPA', ?, ?, 0, NOW())
      `,
      [idNotif, pesan, user.id_divisi, idProker]
    );

    // Sukses: Redirect ke halaman kelola
    res.redirect("/hmsi/kelola-proker?success=Program Kerja berhasil ditambahkan");
  } catch (err) {
    console.error("Error createProker:", err.message);
    // Error Handling: Render ulang form edit dengan pesan error
    res.render("hmsi/tambahProker", {
      title: "Tambah Program Kerja", user: req.session.user, activeNav: "Program Kerja", 
      old: req.body, errorMsg: "Terjadi kesalahan saat menyimpan program kerja.", successMsg: null,
    });
  }
};

/**
 * [UI READ] Mengambil data Proker untuk mengisi form Edit.
 * Termasuk Validasi Bisnis (status final tidak boleh diedit).
 */
exports.getEditProker = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Program_kerja WHERE id_ProgramKerja = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Program kerja tidak ditemukan");
    const proker = rows[0];

    // Logika Bisnis: Cegah edit Proker yang sudah final
    if (proker.Status === "Selesai" || proker.Status === "Tidak Selesai") {
      return res.status(403).send('Program kerja dengan status "Selesai" atau "Tidak Selesai" tidak dapat diubah.');
    }

    const formatDate = (v) => (!v ? "" : new Date(v).toISOString().split("T")[0]);
    proker.tanggal_mulaiFormatted = formatDate(proker.Tanggal_mulai);
    proker.tanggal_selesaiFormatted = formatDate(proker.Tanggal_selesai);

    res.render("hmsi/editProker", {
      title: "Edit Program Kerja", user: req.session.user, activeNav: "Program Kerja",
      proker, errorMsg: null, successMsg: null,
    });
  } catch (err) {
    console.error("Error getEditProker:", err.message);
    res.status(500).send("Gagal mengambil data program kerja");
  }
};

/**
 * [UPDATE] Memperbarui data Program Kerja di database.
 * Termasuk penanganan file lama, Validasi status final, dan Notifikasi DPA.
 */
exports.updateProker = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.id_anggota || !user.id_divisi) {
      return res.status(400).send("Data pengguna tidak lengkap untuk memperbarui program kerja");
    }

    const { id } = req.params;
    const { 
      namaProker, deskripsi, tanggal_mulai, tanggal_selesai, 
      penanggungJawab, targetKuantitatif, targetKualitatif
    } = req.body;

    // Validasi Tanggal
    if (new Date(tanggal_mulai) > new Date(tanggal_selesai)) {
      return res.render("hmsi/editProker", {
        title: "Edit Program Kerja", user, activeNav: "Program Kerja", 
        proker: { ...req.body, id }, errorMsg: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai!", successMsg: null,
      });
    }

    // Operasi DB 1: SELECT data lama (untuk status dan dokumen lama)
    const [existingRows] = await db.query(
      "SELECT Dokumen_pendukung, Status FROM Program_kerja WHERE id_ProgramKerja = ?",
      [id]
    );
    if (!existingRows.length) return res.status(404).send("Program kerja tidak ditemukan");

    const oldFile = existingRows[0].Dokumen_pendukung;
    const status_db = existingRows[0].Status;

    // Logika Bisnis: Cegah update Proker yang sudah final
    if (status_db === "Selesai" || status_db === "Tidak Selesai") {
      return res.status(403).send('Program kerja dengan status "Selesai" atau "Tidak Selesai" tidak dapat diubah.');
    }

    const newFile = req.file ? req.file.filename : null;
    const status = getStatusFromDB(status_db); // Status tidak berubah oleh update HMSI

    // Operasi DB 2: UPDATE data Program_kerja
    let query = `
      UPDATE Program_kerja SET 
        Nama_ProgramKerja=?, Deskripsi=?, Tanggal_mulai=?, Tanggal_selesai=?, 
        Penanggung_jawab=?, Target_Kuantitatif=?, Target_Kualitatif=?, id_anggota=?, 
        id_divisi=?, Status=?`;
    const params = [
      namaProker, deskripsi, tanggal_mulai, tanggal_selesai, penanggungJawab, 
      targetKuantitatif, targetKualitatif, user.id_anggota, user.id_divisi, status,
    ];

    if (newFile) {
      query += `, Dokumen_pendukung=?`;
      params.push(newFile);
    }

    query += ` WHERE id_ProgramKerja=?`;
    params.push(id);

    await db.query(query, params);
    
    // Operasi File: Hapus file lama jika ada file baru
    if (newFile && oldFile) safeRemoveFile(oldFile);

    // Operasi DB 3: INSERT Notifikasi ke DPA
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
    console.error("Error updateProker:", err.message);
    res.status(500).send("Gagal memperbarui program kerja");
  }
};

/**
 * [DELETE] Menghapus Program Kerja dan laporan/file terkait.
 * Termasuk Validasi status final dan Notifikasi DPA.
 */
exports.deleteProker = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;

    // Operasi DB 1: SELECT data lama (untuk status dan dokumen lama)
    const [rows] = await db.query(
      "SELECT Nama_ProgramKerja, Dokumen_pendukung, Status FROM Program_kerja WHERE id_ProgramKerja = ?",
      [id]
    );
    if (!rows.length) return res.status(404).send("Program kerja tidak ditemukan");

    const { Nama_ProgramKerja, Dokumen_pendukung, Status } = rows[0];

    // Logika Bisnis: Cegah hapus Proker yang sudah final
    if (Status === "Selesai" || Status === "Tidak Selesai") {
      return res.status(403).send('Program kerja dengan status "Selesai" atau "Tidak Selesai" tidak dapat dihapus.');
    }

    // Operasi DB 2: SELECT dokumen laporan terkait
    const [laporanRows] = await db.query(
      "SELECT dokumentasi FROM Laporan WHERE id_ProgramKerja = ?",
      [id]
    );

    // Operasi File: Hapus semua file dokumentasi laporan
    for (const lap of laporanRows) {
      if (lap.dokumentasi) safeRemoveFile(lap.dokumentasi);
    }

    // Operasi DB 3: DELETE laporan terkait
    await db.query("DELETE FROM Laporan WHERE id_ProgramKerja = ?", [id]);

    // Operasi File: Hapus dokumen pendukung proker utama
    if (Dokumen_pendukung) safeRemoveFile(Dokumen_pendukung);

    // Operasi DB 4: INSERT Notifikasi ke DPA
    const idNotif = uuidv4();
    const pesan = `Divisi ${user.nama_divisi || "HMSI"} menghapus Program Kerja: "${Nama_ProgramKerja}"`;
    await db.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, id_ProgramKerja, status_baca, created_at)
      VALUES (?, ?, 'DPA', ?, ?, 0, NOW())
      `,
      [idNotif, pesan, user.id_divisi, id]
    );

    // Operasi DB 5: DELETE Program_kerja utama
    await db.query("DELETE FROM Program_kerja WHERE id_ProgramKerja = ?", [id]);

    res.redirect("/hmsi/kelola-proker?success=Program Kerja beserta seluruh laporan terkait telah dihapus");
  } catch (err) {
    console.error("Error deleteProker:", err.message);
    res.status(500).send("Gagal menghapus program kerja beserta laporan terkait");
  }
};

/**
 * [DOWNLOAD] Mengunduh dokumen pendukung yang terkait dengan Proker.
 */
exports.downloadDokumenPendukung = async (req, res) => {
  try {
    // Operasi DB 1: SELECT nama file dari DB
    const [rows] = await db.query(
      "SELECT Dokumen_pendukung FROM Program_kerja WHERE id_ProgramKerja = ?",
      [req.params.id]
    );

    // Validasi 1: File tidak ditemukan di database
    if (!rows.length || !rows[0].Dokumen_pendukung) {
      return res.status(404).send("Dokumen pendukung tidak ditemukan");
    }

    const fileName = rows[0].Dokumen_pendukung;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Validasi 2: File tidak ditemukan di server (sistem file)
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File dokumen pendukung tidak ditemukan di server");
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error("Error downloadDokumenPendukung:", err.message);
    res.status(500).send("Gagal mengunduh dokumen pendukung");
  }
};