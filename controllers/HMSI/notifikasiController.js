// controllers/HMSI/notifikasiController.js
const db = require("../../config/db");

// =====================================================
// 📄 Ambil semua notifikasi untuk user HMSI sesuai divisi
// =====================================================
// 📄 Ambil semua notifikasi untuk user HMSI sesuai divisi
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).send("Unauthorized");

    const [rows] = await db.query(
      `SELECT n.*, l.judul_laporan, l.divisi, p.Nama_ProgramKerja
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE l.divisi = ?
       ORDER BY n.created_at DESC`,
      [user.divisi] // hanya notifikasi sesuai divisi user HMSI
    );

    // format tanggal
    const notifikasi = rows.map(n => {
      let tanggalFormatted = "-";
      if (n.created_at) {
        const d = new Date(n.created_at);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
          });
        }
      }
      return { ...n, tanggalFormatted };
    });

    res.render("hmsi/hmsiNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "Notifikasi",
      notifikasi,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasi:", err.message);
    res.status(500).send("Gagal mengambil notifikasi");
  }
};

// =====================================================
// ✅ Tandai notifikasi sebagai sudah dibaca
// =====================================================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE Notifikasi SET status_baca=1 WHERE id_notifikasi=?",
      [id]
    );
    res.redirect("/hmsi/notifikasi");
  } catch (err) {
    console.error("❌ Error markAsRead:", err.message);
    res.status(500).send("Gagal update notifikasi");
  }
};

// =====================================================
// ❌ Hapus notifikasi (opsional, jika diperlukan)
// =====================================================
exports.deleteNotifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM Notifikasi WHERE id_notifikasi=?", [id]);
    res.redirect("/hmsi/notifikasi");
  } catch (err) {
    console.error("❌ Error deleteNotifikasi:", err.message);
    res.status(500).send("Gagal menghapus notifikasi");
  }
};
