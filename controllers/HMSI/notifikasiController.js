// controllers/HMSI/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi HMSI
// - Hanya menampilkan notifikasi evaluasi dari DPA
// - Klik notifikasi = otomatis tandai sudah dibaca + redirect ke detail evaluasi laporan
// =====================================================

const db = require("../../config/db");

// =====================================================
// 📄 Ambil semua notifikasi evaluasi untuk HMSI sesuai divisi
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "HMSI") {
      return res.status(401).send("Unauthorized");
    }

    const [rows] = await db.query(
      `SELECT n.*, l.judul_laporan, p.Nama_ProgramKerja, u.nama AS evaluator
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE n.divisi = ?
         AND n.id_evaluasi IS NOT NULL
         AND (n.role IS NULL OR n.role = 'HMSI')   -- ✅ hanya notif untuk HMSI
       ORDER BY n.created_at DESC`,
      [user.divisi]
    );

    const notifikasi = rows.map(n => {
      let tanggalFormatted = "-";
      if (n.created_at) {
        const d = new Date(n.created_at);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
        }
      }

      return {
        ...n,
        tanggalFormatted,
        linkUrl: `/hmsi/evaluasi/${n.id_evaluasi}`,
        linkLabel: "Lihat Evaluasi"
      };
    });

    res.render("hmsi/hmsiNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "Notifikasi",
      notifikasi,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasi HMSI:", err.message);
    res.status(500).send("Gagal mengambil notifikasi");
  }
};

// =====================================================
// ✅ Tandai notifikasi sebagai sudah dibaca (simple)
// =====================================================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
      [id]
    );
    return res.redirect("/hmsi/notifikasi");
  } catch (err) {
    console.error("❌ Error markAsRead HMSI:", err.message);
    res.status(500).send("Gagal update notifikasi");
  }
};

// =====================================================
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect ke tujuan
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    let redirectUrl = req.query.to ? decodeURIComponent(req.query.to) : "/hmsi/notifikasi";

    // hanya izinkan redirect ke /hmsi/*
    if (!(typeof redirectUrl === "string" && redirectUrl.startsWith("/hmsi"))) {
      redirectUrl = "/hmsi/notifikasi";
    }

    await db.query(
      "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
      [id]
    );

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Error readAndRedirect HMSI:", err.message);
    res.status(500).send("Gagal membaca notifikasi");
  }
};
