// controllers/HMSI/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi HMSI
// - Hanya menampilkan notifikasi evaluasi dari DPA
// - Klik notifikasi = otomatis tandai sudah dibaca + redirect ke detail evaluasi laporan
// =====================================================

const db = require("../../config/db");

// =====================================================
// 📄 Ambil semua notifikasi untuk user HMSI sesuai divisi
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "HMSI") {
      return res.status(401).send("Unauthorized");
    }

    // Ambil semua notifikasi sesuai divisi HMSI
    const [rows] = await db.query(
      `SELECT 
         n.*,
         l.judul_laporan,
         l.divisi,
         p.Nama_ProgramKerja
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.divisi = ?
         AND n.id_evaluasi IS NOT NULL
         AND LOWER(COALESCE(n.pesan, '')) LIKE '%evaluasi%'
       ORDER BY n.created_at DESC`,
      [user.divisi] // hanya notifikasi sesuai divisi user HMSI
    );

    // Format tanggal + siapkan data
    const notifikasi = rows.map((n) => {
      let tanggalFormatted = "-";
      if (n.created_at) {
        const d = new Date(n.created_at);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }

      return {
        ...n,
        tanggalFormatted,
        linkUrl: `/hmsi/notifikasi/read/${n.id_notifikasi}`, // bubble klik → tandai terbaca + redirect
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
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect ke evaluasi
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil data notifikasi
    const [rows] = await db.query(
      `SELECT id_laporan FROM Notifikasi WHERE id_notifikasi=?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.redirect("/hmsi/notifikasi");
    }

    const notif = rows[0];

    // Update status → terbaca
    await db.query(
      "UPDATE Notifikasi SET status_baca=1 WHERE id_notifikasi=?",
      [id]
    );

    // Redirect ke detail evaluasi laporan
    if (notif.id_laporan) {
      return res.redirect(`/hmsi/evaluasi/${notif.id_laporan}`);
    }

    // Fallback → kembali ke daftar notifikasi
    return res.redirect("/hmsi/notifikasi");
  } catch (err) {
    console.error("❌ Error readAndRedirect HMSI:", err.message);
    res.status(500).send("Gagal membaca notifikasi");
  }
};
