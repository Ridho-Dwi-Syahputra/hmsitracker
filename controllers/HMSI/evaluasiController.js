// =====================================================
// controllers/HMSI/evaluasiController.js
// Controller Evaluasi untuk HMSI
// - HMSI dapat melihat evaluasi dari DPA
// - HMSI dapat memberikan komentar tambahan
// - Komentar HMSI selalu replace komentar lama (bukan append)
// - Saat komentar diberikan, notifikasi muncul di DPA
// =====================================================

const db = require("../../config/db");

// =====================================================
// Helper: format tanggal
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
// 📄 Ambil semua evaluasi (khusus laporan divisi HMSI)
// =====================================================
exports.getAllEvaluasi = async (req, res) => {
  try {
    const user = req.session.user;

    const [rows] = await db.query(
      `SELECT e.*, l.judul_laporan, p.Nama_ProgramKerja, u.nama AS evaluator
       FROM Evaluasi e
       JOIN Laporan l ON e.id_laporan = l.id_laporan
       JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE l.divisi = ?
       ORDER BY e.tanggal_evaluasi DESC`,
      [user.divisi]
    );

    const evaluasi = rows.map(r => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal_evaluasi),
    }));

    res.render("hmsi/kelolaEvaluasi", {
      title: "Kelola Evaluasi",
      user,
      activeNav: "Evaluasi DPA",
      evaluasi,
      successMsg: req.query.success || null,
      errorMsg: req.query.error || null,
    });
  } catch (err) {
    console.error("❌ Error getAllEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil evaluasi");
  }
};

// =====================================================
// 📄 Detail evaluasi
// =====================================================
exports.getDetailEvaluasi = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT e.*, l.judul_laporan, l.divisi, p.Nama_ProgramKerja, u.nama AS evaluator
       FROM Evaluasi e
       JOIN Laporan l ON e.id_laporan = l.id_laporan
       JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE e.id_evaluasi = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).send("Evaluasi tidak ditemukan");

    const evaluasi = rows[0];

    // 🔒 Batasi akses hanya ke divisi HMSI terkait
    if (user.role === "HMSI" && user.divisi !== evaluasi.divisi) {
      return res.status(403).send("Tidak boleh akses evaluasi divisi lain");
    }

    evaluasi.tanggalFormatted = formatTanggal(evaluasi.tanggal_evaluasi);

    res.render("hmsi/detailEvaluasi", {
      title: "Detail Evaluasi",
      user,
      activeNav: "Evaluasi DPA",
      evaluasi,
    });
  } catch (err) {
    console.error("❌ Error getDetailEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil detail evaluasi");
  }
};

// =====================================================
// 📝 Tambah / Update komentar HMSI
// - Komentar lama akan diganti dengan komentar baru
// - Setelah submit, HMSI diarahkan kembali ke kelolaEvaluasi.ejs
// - Saat HMSI komentar, DPA dapat notifikasi baru
// =====================================================
exports.addKomentar = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params; // id_evaluasi
    const { komentar_hmsi } = req.body;

    if (!komentar_hmsi || komentar_hmsi.trim() === "") {
      return res.redirect(`/hmsi/evaluasi?error=Komentar tidak boleh kosong`);
    }

    // ✅ Update komentar_hmsi (selalu replace)
    await db.query(
      "UPDATE Evaluasi SET komentar_hmsi = ? WHERE id_evaluasi = ?",
      [komentar_hmsi, id]
    );

    // 🔎 Ambil data evaluasi untuk bikin pesan notifikasi
    const [info] = await db.query(
      `SELECT e.id_laporan, l.judul_laporan, p.Nama_ProgramKerja
       FROM Evaluasi e
       JOIN Laporan l ON e.id_laporan = l.id_laporan
       JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE e.id_evaluasi = ?`,
      [id]
    );

    if (info.length) {
      const data = info[0];
      const pesanNotif = `HMSI (${user.divisi}) memberikan komentar baru pada evaluasi program "${data.Nama_ProgramKerja}"`;

      // 🟠 Simpan notifikasi untuk DPA
      await db.query(
        `INSERT INTO Notifikasi (id_notifikasi, pesan, role, status_baca, id_evaluasi, id_laporan, created_at)
         VALUES (UUID(), ?, 'DPA', 0, ?, ?, NOW())`,
        [pesanNotif, id, data.id_laporan]
      );
    }

    // 🔄 Redirect balik ke kelolaEvaluasi
    res.redirect(`/hmsi/evaluasi?success=Komentar berhasil ditambahkan`);
  } catch (err) {
    console.error("❌ Error addKomentar:", err.message);
    res.status(500).send("Gagal menambahkan komentar");
  }
};
