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
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      LEFT JOIN divisi d ON l.id_divisi = d.id_divisi
      WHERE l.id_divisi = ?
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
      title: "Telah Dievaluasi",
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
// 📝 Tambah / Update komentar HMSI (versi AJAX friendly)
// =====================================================
exports.addKomentar = async (req, res) => {
  try {
    const user = req.session.user;
    const idDivisi = user?.id_divisi || null;
    const { id } = req.params; // id_evaluasi
    const { komentar_hmsi } = req.body;

    // 🧩 1️⃣ Validasi input: komentar tidak boleh kosong
    if (!komentar_hmsi || komentar_hmsi.trim() === "") {
      // Jika kosong, kirim JSON error agar bisa ditangani di fetch()
      return res.status(400).json({ success: false, message: "Komentar tidak boleh kosong" });
    }

    // 🧠 2️⃣ Update komentar HMSI ke tabel Evaluasi (replace, bukan append)
    await db.query(
      "UPDATE Evaluasi SET komentar_hmsi = ?, updated_at = NOW() WHERE id_evaluasi = ?",
      [komentar_hmsi, id]
    );

    // 🔎 3️⃣ Ambil data laporan terkait — untuk isi pesan notifikasi ke DPA
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

    // 🔔 4️⃣ Jika data laporan ditemukan, buat notifikasi baru untuk DPA
    if (info.length) {
      const data = info[0];

      // 💬 Pesan notifikasi (tidak hapus notifikasi lama — biar histori tetap ada)
      const pesanNotif = `Divisi ${data.nama_divisi} telah memberikan revisi atau komentar baru untuk laporan "${data.judul_laporan}".`;

      // 🟠 Simpan notifikasi baru ke tabel Notifikasi
      await db.query(
        `
        INSERT INTO Notifikasi 
        (id_notifikasi, pesan, target_role, id_divisi, status_baca, id_evaluasi, id_laporan, created_at)
        VALUES (UUID(), ?, 'DPA', ?, 0, ?, ?, NOW())
        `,
        [pesanNotif, idDivisi, id, data.id_laporan]
      );
    }

    // ✅ 5️⃣ Kirim respon JSON sukses (bukan redirect)
    // Agar bisa ditangani oleh fetch() di front-end untuk menampilkan modal sukses
    return res.status(200).json({
      success: true,
      message: "Komentar berhasil ditambahkan dan notifikasi terkirim",
    });

  } catch (err) {
    console.error("❌ Error addKomentar:", err.message);

    // 🚨 6️⃣ Jika error, kirim JSON error juga (bukan res.send)
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan komentar",
      error: err.message,
    });
  }
};

