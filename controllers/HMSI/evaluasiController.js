// =====================================================
// controllers/HMSI/evaluasiController.js
// Controller Evaluasi untuk HMSI
// =====================================================
// 🔸 HMSI dapat melihat evaluasi dari DPA
// 🔸 HMSI dapat memberikan komentar tambahan
// 🔸 Komentar HMSI selalu replace komentar lama (bukan append)
// 🔸 Saat komentar diberikan, notifikasi baru muncul di DPA
// 🔸 Tidak menghapus notifikasi lama agar histori tetap ada
// =====================================================

const db = require("../../config/db");

// =====================================================
// Helper: format tanggal (Bahasa Indonesia Sederhana)
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue || dateValue === "0000-00-00") return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  
  // Format: "Minggu, 12 Oktober 2025"
  return d.toLocaleDateString("id-ID", {
    weekday: "long",  // Nama hari lengkap
    day: "numeric",   // Tanggal
    month: "long",    // Nama bulan lengkap
    year: "numeric"   // Tahun
  });
}

// =====================================================
// Helper: ambil jumlah notifikasi belum dibaca
// =====================================================
async function getUnreadCount(id_divisi) {
  try {
    const [rows] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM Notifikasi n
      JOIN Laporan l ON n.id_laporan = l.id_laporan
      WHERE n.target_role = 'HMSI' 
        AND n.status_baca = 0 
        AND l.id_divisi = ?
      `,
      [id_divisi]
    );
    return rows[0]?.count || 0;
  } catch (err) {
    console.error("❌ Error getUnreadCount:", err.message);
    return 0;
  }
}

// =====================================================
// 📄 Ambil semua evaluasi (khusus laporan divisi HMSI)
// =====================================================
exports.getKelolaEvaluasi = async (req, res) => {
  try {
    const user = req.session.user;
    const idDivisi = user?.id_divisi || null;

    // KUNCI PERBAIKAN: Query ini menggunakan INNER JOIN dengan subquery untuk
    // mendapatkan evaluasi terbaru. Metode ini sangat kompatibel dengan berbagai versi database.
    const [rows] = await db.query(
      `
      SELECT 
        e.*, 
        l.judul_laporan, 
        p.Nama_ProgramKerja, 
        u.nama AS evaluator, 
        d.nama_divisi,
        l.id_laporan
      FROM Evaluasi e
      -- Filter untuk memastikan hanya evaluasi TERBARU (ID tertinggi) per laporan yang diambil
      INNER JOIN (
        SELECT MAX(id_evaluasi) as max_id
        FROM Evaluasi
        GROUP BY id_laporan
      ) latest_eval ON e.id_evaluasi = latest_eval.max_id
      -- Lanjutkan JOIN ke tabel lain seperti biasa
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      LEFT JOIN divisi d ON l.id_divisi = d.id_divisi
      -- Terapkan filter akhir SETELAH mendapatkan data evaluasi terbaru
      WHERE l.id_divisi = ? AND e.status_konfirmasi = 'Revisi'
      ORDER BY e.tanggal_evaluasi DESC
      `,
      [idDivisi]
    );

    const evaluasi = rows.map((r) => ({
      ...r,
      tanggalFormatted: formatTanggal(r.tanggal_evaluasi),
      isRevisi: r.status_konfirmasi === "Revisi",
    }));

    const unreadCount = await getUnreadCount(idDivisi);

    res.render("HMSI/kelolaEvaluasi", {
      title: "Laporan Revisi",
      user,
      activeNav: "kelolaEvaluasi",
      evaluasi,
      successMsg: req.query.success || null,
      errorMsg: req.query.error || null,
      unreadCount,
    });
  } catch (err) {
    console.error("❌ Error getKelolaEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil data evaluasi");
  }
};
// =====================================================
// 📄 Detail evaluasi
// =====================================================
exports.getDetailEvaluasi = async (req, res) => {
  try {
    const user = req.session.user;
    const idDivisi = user?.id_divisi || null;
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        e.*, 
        l.judul_laporan, 
        l.id_divisi, 
        p.Nama_ProgramKerja, 
        u.nama AS evaluator, 
        d.nama_divisi
      FROM Evaluasi e
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      LEFT JOIN divisi d ON l.id_divisi = d.id_divisi
      WHERE e.id_evaluasi = ?
      `,
      [id]
    );

    if (!rows.length) return res.status(404).send("Evaluasi tidak ditemukan");

    const evaluasi = rows[0];

    // 🔒 Batasi akses hanya ke divisi HMSI terkait
    if (user.role === "HMSI" && idDivisi !== evaluasi.id_divisi) {
      return res.status(403).send("Tidak boleh akses evaluasi divisi lain");
    }

    evaluasi.tanggalFormatted = formatTanggal(evaluasi.tanggal_evaluasi);
    const unreadCount = await getUnreadCount(idDivisi);

    res.render("HMSI/detailEvaluasi", {
      title: "Detail Evaluasi",
      user,
      activeNav: "kelolaEvaluasi",
      evaluasi,
      unreadCount,
    });
  } catch (err) {
    console.error("❌ Error getDetailEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil detail evaluasi");
  }
};

// =====================================================
// 📝 Tambah / Update komentar HMSI
// =====================================================
exports.addKomentar = async (req, res) => {
  try {
    const user = req.session.user;
    const idDivisi = user?.id_divisi || null;
    const { id } = req.params; // id_evaluasi
    const { komentar_hmsi } = req.body;

    if (!komentar_hmsi || komentar_hmsi.trim() === "") {
      return res.redirect(`/hmsi/kelola-evaluasi?error=Komentar tidak boleh kosong`);
    }

    // ✅ Update komentar HMSI (replace komentar lama)
    await db.query(
      "UPDATE Evaluasi SET komentar_hmsi = ?, updated_at = NOW() WHERE id_evaluasi = ?",
      [komentar_hmsi, id]
    );

    // 🔎 Ambil data laporan terkait untuk pesan notifikasi
    const [info] = await db.query(
      `
      SELECT 
        e.id_laporan, 
        l.judul_laporan, 
        p.Nama_ProgramKerja,
        d.nama_divisi
      FROM Evaluasi e
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      JOIN divisi d ON l.id_divisi = d.id_divisi
      WHERE e.id_evaluasi = ?
      `,
      [id]
    );

    if (info.length) {
      const data = info[0];

      // 💬 Pesan notifikasi baru — tanpa hapus notifikasi lama
      const pesanNotif = `Divisi ${data.nama_divisi} telah memberikan revisi atau komentar baru untuk laporan "${data.judul_laporan}".`;

      // 🟠 Simpan notifikasi baru untuk DPA
      await db.query(
        `
        INSERT INTO Notifikasi 
        (id_notifikasi, pesan, target_role, id_divisi, status_baca, id_evaluasi, id_laporan, created_at)
        VALUES (UUID(), ?, 'DPA', ?, 0, ?, ?, NOW())
        `,
        [pesanNotif, idDivisi, id, data.id_laporan]
      );
    }

    // 🔄 Redirect balik ke halaman kelola evaluasi
    res.redirect(`/hmsi/kelola-evaluasi?success=Komentar berhasil ditambahkan`);
  } catch (err) {
    console.error("❌ Error addKomentar:", err.message);
    res.status(500).send("Gagal menambahkan komentar");
  }
};