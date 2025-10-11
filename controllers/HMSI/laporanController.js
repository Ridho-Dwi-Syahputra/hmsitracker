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
// Helper: safe query using a connection if provided
// =====================================================
async function runQuery(connOrPool, sql, params = []) {
  if (!connOrPool) throw new Error("runQuery: missing connection/pool");
  return connOrPool.query(sql, params);
}

// =====================================================
// Helper: cek apakah laporan sudah dievaluasi
// =====================================================
async function isLaporanDievaluasi(conn, idLaporan) {
  const [rows] = await conn.query(
    "SELECT status_konfirmasi FROM Evaluasi WHERE id_laporan = ? LIMIT 1",
    [idLaporan]
  );
  if (!rows.length) return false;
  return ["Revisi", "Selesai"].includes(rows[0].status_konfirmasi);
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

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true, data: laporan });
    }

    res.render("hmsi/laporan", {
      title: "Daftar Laporan",
      user,
      activeNav: "Laporan",
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
// ➕ Form tambah laporan (perbaikan dropdown Program Kerja)
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
      activeNav: "Laporan",
      programs,
      laporan: null,              // ✅ tambahkan ini
      formAction: "/hmsi/laporan/tambah", // ✅ tambahkan ini
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
// 💾 Tambah laporan baru (versi revisi penuh, logika lama dipertahankan)
// =====================================================
exports.createLaporan = async (req, res) => {
  let connection;
  try {
    const user = req.session.user;
    const body = req.body;

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
    } = body;

    // =============================
    // 🔸 VALIDASI DASAR
    // =============================
    if (!judul_laporan || !id_ProgramKerja || !deskripsi_kegiatan) {
      // AJAX → JSON response
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res
          .status(400)
          .json({ success: false, error: "Judul, Proker, dan Deskripsi wajib diisi." });
      }

      const [programs] = await db.query(
        `SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja WHERE id_divisi = ?`,
        [user.id_divisi]
      );

      // 🔹 Tambahkan laporan & formAction biar EJS tidak error
      return res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user,
        activeNav: "Laporan",
        errorMsg: "Judul, Proker, dan Deskripsi wajib diisi.",
        successMsg: null,
        old: body,
        programs,
        laporan: null,
        formAction: "/hmsi/laporan/tambah",
      });
    }

    if (sumber_dana_radio !== "uang_kas" && !sumber_dana_text) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Sumber dana lain harus diisi jika tidak menggunakan kas HMSI.",
          });
      }

      const [programs] = await db.query(
        `SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja WHERE id_divisi = ?`,
        [user.id_divisi]
      );

      return res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user,
        activeNav: "Laporan",
        errorMsg: "Sumber dana lain harus diisi jika tidak menggunakan kas HMSI.",
        successMsg: null,
        old: body,
        programs,
        laporan: null,
        formAction: "/hmsi/laporan/tambah",
      });
    }

    // =============================
    // 🔹 Normalisasi angka
    // =============================
    const cleanNum = (v) =>
      parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0;

    let danaDigunakanNum = cleanNum(dana_digunakan);
    let danaTerpakaiNum = cleanNum(dana_terpakai);

    if (danaDigunakanNum === 0 && danaTerpakaiNum > 0)
      danaDigunakanNum = danaTerpakaiNum;
    if (danaTerpakaiNum === 0 && danaDigunakanNum > 0)
      danaTerpakaiNum = danaDigunakanNum;

    const sumberDana =
      sumber_dana_radio === "uang_kas"
        ? "Uang Kas HMSI"
        : sumber_dana_text || null;

    const dokumentasi = req.file ? req.file.filename : null;
    const idLaporan = uuidv4();

    // =============================
    // 💾 Transaksi DB
    // =============================
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
        user.id_divisi,
      ]
    );

    // =============================
    // 💰 Sinkronisasi keuangan otomatis
    // =============================
    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      await connection.query(
        `
        INSERT INTO keuangan (
          id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at
        ) VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())
        `,
        [
          uuidv4(),
          `Pengeluaran dari Laporan: ${judul_laporan}`,
          danaTerpakaiNum,
          idLaporan,
          user.id_anggota,
        ]
      );
    }

    // =============================
    // 🔔 Notifikasi otomatis ke DPA
    // =============================
    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} menambahkan laporan baru: "${judul_laporan}"`;
    await connection.query(
      `
      INSERT INTO Notifikasi (
        id_notifikasi, pesan, id_laporan, target_role, id_divisi, created_at, status_baca
      ) VALUES (?, ?, ?, 'DPA', ?, NOW(), 0)
      `,
      [uuidv4(), notifMsg, idLaporan, user.id_divisi]
    );

    await connection.commit();

    // =============================
    // 🔁 RESPONSE
    // =============================
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({
        success: true,
        message: "Laporan berhasil ditambahkan.",
      });
    }

    res.redirect("/hmsi/laporan?success=Laporan berhasil ditambahkan");
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ createLaporan error:", err.message);

    // Jika request AJAX
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res
        .status(500)
        .json({ success: false, error: "Gagal menambahkan laporan" });
    }

    // ✅ Tambah render fallback agar tidak blank saat gagal
    try {
      const user = req.session.user;
      const [programs] = await db.query(
        `SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja WHERE id_divisi = ?`,
        [user.id_divisi]
      );

      res.render("hmsi/laporanForm", {
        title: "Tambah Laporan",
        user,
        activeNav: "Laporan",
        errorMsg: "Terjadi kesalahan saat menyimpan laporan.",
        successMsg: null,
        old: req.body,
        programs,
        laporan: null,
        formAction: "/hmsi/laporan/tambah",
      });
    } catch (renderErr) {
      console.error("❌ Render fallback gagal:", renderErr.message);
      res.status(500).send("Gagal menambahkan laporan");
    }
  } finally {
    if (connection) connection.release();
  }
};


// =====================================================
// 📄 Detail laporan (tidak diubah)
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
      activeNav: "Laporan",
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
// ✏️ Form edit laporan (sinkron dropdown & preview file lama)
// =====================================================
exports.getEditLaporan = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;

    // 🔸 Ambil data laporan + status evaluasi
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

    // 🔹 Dropdown: ambil program kerja dari divisi aktif (sinkron dengan getFormLaporan)
    const [programs] = await db.query(
      `
      SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker
      FROM Program_kerja
      WHERE id_divisi = ?
      ORDER BY Tanggal_mulai DESC
      `,
      [user.id_divisi]
    );

    // 🔹 Tambah properti untuk preview file lama (jika ada)
    laporan.dokumentasi_mime = getMimeFromFile(laporan.dokumentasi);
    if (laporan.dokumentasi) {
      laporan.filePreview = `/uploads/${laporan.dokumentasi}`; // untuk <img> / <a> preview di EJS
    } else {
      laporan.filePreview = null;
    }

    const redirectTarget = laporan.status_konfirmasi
      ? "/hmsi/evaluasi"
      : "/hmsi/laporan";

    // 🔹 Render ke form edit
    res.render("hmsi/editLaporan", {
      title: "Edit Laporan",
      user,
      activeNav: "Laporan",
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
// 💾 Update laporan (revisi ringan + dukungan AJAX, logika lama dipertahankan)
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
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(404).json({ success: false, error: "Laporan tidak ditemukan" });
      }
      return res.status(404).send("Laporan tidak ditemukan");
    }

    const oldFile = rows[0].dokumentasi;
    const divisiLaporan = rows[0].id_divisi;
    const statusEvaluasi = rows[0].status_konfirmasi;

    if (user.role === "HMSI" && divisiLaporan !== user.id_divisi) {
      await connection.rollback();
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(403).json({ success: false, error: "Tidak boleh ubah laporan divisi lain" });
      }
      return res.status(403).send("Tidak boleh ubah laporan divisi lain");
    }

    // angka normalisasi
    const cleanNumber = (v) =>
      parseFloat(String(v || "0").replace(/[^\d.-]/g, "")) || 0;
    let danaDigunakanNum = cleanNumber(body.dana_digunakan);
    let danaTerpakaiNum = cleanNumber(body.dana_terpakai);
    if (danaDigunakanNum === 0 && danaTerpakaiNum > 0)
      danaDigunakanNum = danaTerpakaiNum;
    if (danaTerpakaiNum === 0 && danaDigunakanNum > 0)
      danaTerpakaiNum = danaDigunakanNum;

    const sumberDana =
      body.sumber_dana_radio === "uang_kas"
        ? "Uang Kas HMSI"
        : body.sumber_dana_text || null;

    // update laporan
    let updateSQL = `
      UPDATE Laporan SET 
        judul_laporan=?, deskripsi_kegiatan=?, sasaran=?, waktu_tempat=?,
        dana_digunakan=?, sumber_dana=?, sumber_dana_lainnya=?, dana_terpakai=?,
        persentase_kualitatif=?, persentase_kuantitatif=?, 
        deskripsi_target_kualitatif=?, deskripsi_target_kuantitatif=?,
        kendala=?, solusi=?, id_ProgramKerja=?, id_divisi=?`;
    const params = [
      body.judul_laporan,
      body.deskripsi_kegiatan,
      body.sasaran,
      body.waktu_tempat,
      danaDigunakanNum,
      sumberDana,
      body.sumber_dana_text || null,
      danaTerpakaiNum,
      body.persentase_kualitatif || null,
      body.persentase_kuantitatif || null,
      body.deskripsi_target_kualitatif || null,
      body.deskripsi_target_kuantitatif || null,
      body.kendala || null,
      body.solusi || null,
      body.id_ProgramKerja || null,
      user.id_divisi,
    ];

    if (newFile) {
      updateSQL += ", dokumentasi=?";
      params.push(newFile);
    }

    updateSQL += " WHERE id_laporan=?";
    params.push(id);

    await connection.query(updateSQL, params);
    if (newFile && oldFile) safeRemoveFile(oldFile);

    // sinkronisasi keuangan
    const [keu] = await connection.query(
      "SELECT id_keuangan FROM keuangan WHERE id_laporan=?",
      [id]
    );
    const hasKeu = keu.length > 0;

    if (sumberDana === "Uang Kas HMSI" && danaTerpakaiNum > 0) {
      if (hasKeu) {
        await connection.query(
          `UPDATE keuangan SET jumlah=?, sumber=?, tanggal=CURDATE() WHERE id_laporan=?`,
          [danaTerpakaiNum, `Pengeluaran dari Laporan: ${body.judul_laporan}`, id]
        );
      } else {
        await connection.query(
          `
          INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_laporan, id_anggota, created_at)
          VALUES (?, CURDATE(), 'Pengeluaran', ?, ?, ?, ?, NOW())
          `,
          [
            uuidv4(),
            `Pengeluaran dari Laporan: ${body.judul_laporan}`,
            danaTerpakaiNum,
            id,
            user.id_anggota,
          ]
        );
      }
    } else {
      await connection.query("DELETE FROM keuangan WHERE id_laporan=?", [id]);
    }

    // notifikasi DPA
    const notifMsg = statusEvaluasi
      ? `HMSI dari divisi ${user.nama_divisi || "HMSI"} telah mengedit laporan yang telah dievaluasi: "${body.judul_laporan}"`
      : `Divisi ${user.nama_divisi || "HMSI"} memperbarui laporan: "${body.judul_laporan}"`;

    await connection.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, id_laporan, target_role, id_divisi, created_at, status_baca)
      VALUES (?, ?, ?, 'DPA', ?, NOW(), 0)
      `,
      [uuidv4(), notifMsg, id, user.id_divisi]
    );

    await connection.commit();

    const redirectTarget = statusEvaluasi ? "/hmsi/evaluasi" : "/hmsi/laporan";

    // ==== NEW: Responsif terhadap jenis request ====
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({
        success: true,
        message: "Laporan berhasil diperbarui",
        redirect: redirectTarget,
      });
    }

    res.redirect(`${redirectTarget}?success=Laporan berhasil diperbarui`);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ updateLaporan error:", err.message);

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ success: false, error: "Gagal memperbarui laporan" });
    }

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

    // ❌ Jangan hapus notifikasi lama, biarkan histori tetap ada
    // await connection.query("DELETE FROM Notifikasi WHERE id_laporan=?", [id]);

    // 🧹 Hapus keuangan & laporan
    await connection.query("DELETE FROM keuangan WHERE id_laporan=?", [id]);
    await connection.query("DELETE FROM Laporan WHERE id_laporan=?", [id]);
    if (dokumentasi) safeRemoveFile(dokumentasi);

    // 🟢 Notifikasi baru ke DPA (sertakan id_laporan)
    const notifMsg = `Divisi ${user.nama_divisi || "HMSI"} menghapus laporan: "${judul_laporan}"`;
    await connection.query(
      `
      INSERT INTO Notifikasi (id_notifikasi, pesan, target_role, id_divisi, id_laporan, created_at, status_baca)
      VALUES (?, ?, 'DPA', ?, ?, NOW(), 0)
      `,
      [uuidv4(), notifMsg, user.id_divisi, id]
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
    const [rows] = await db.query(
      "SELECT dokumentasi FROM Laporan WHERE id_laporan=?",
      [id]
    );

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
