// controllers/HMSI/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi HMSI
// - Hanya menampilkan notifikasi evaluasi dari DPA
// - Klik notifikasi = otomatis tandai sudah dibaca + redirect ke detail evaluasi laporan
// =====================================================

// controllers/HMSI/notifikasiController.js
const db = require("../../config/db");

// =====================================================
// 📄 Ambil semua notifikasi untuk HMSI sesuai divisi
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "HMSI") {
      return res.status(401).send("Unauthorized");
    }

    const [rows] = await db.query(
      `SELECT n.*, l.judul_laporan, p.Nama_ProgramKerja
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE n.divisi = ?
       ORDER BY n.created_at DESC`,
      [user.divisi]
    );

    const notifikasi = rows.map(n => {
      // format tanggal
      let tanggalFormatted = "-";
      if (n.created_at) {
        const d = new Date(n.created_at);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
          });
        }
      }

      // tentukan link & label
      let linkUrl = "#";
      let linkLabel = "Lihat";

      if (n.id_evaluasi) {
        linkUrl = `/hmsi/evaluasi/${n.id_evaluasi}`;
        linkLabel = "Lihat Evaluasi";
      } else if (n.id_laporan) {
        linkUrl = `/hmsi/laporan/${n.id_laporan}`;
        linkLabel = "Lihat Laporan";
      } else if (n.id_ProgramKerja) {
        linkUrl = `/hmsi/proker/${n.id_ProgramKerja}`;
        linkLabel = "Lihat Program Kerja";
      }

      return {
        ...n,
        tanggalFormatted,
        linkUrl,
        linkLabel
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
