// controllers/HMSI/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi HMSI
// - Menampilkan notifikasi evaluasi dari DPA
// - Menampilkan notifikasi update status Proker dari DPA
// - Klik notifikasi = otomatis tandai sudah dibaca + redirect
// - Jika status Proker berubah, notifikasi lama dihapus
// =====================================================

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
      `SELECT n.*, l.judul_laporan, p.Nama_ProgramKerja, u.nama AS evaluator
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON 
          (l.id_ProgramKerja = p.id_ProgramKerja OR n.id_ProgramKerja = p.id_ProgramKerja)
       LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
       LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
       WHERE n.divisi = ?
         AND (
              (n.role = 'HMSI')             -- notif untuk HMSI (status Proker dari DPA)
              OR (n.id_evaluasi IS NOT NULL) -- evaluasi dari DPA
             )
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

      let linkUrl = `/hmsi/evaluasi/${n.id_evaluasi}`;
      let linkLabel = "Lihat Evaluasi";

      // 🔹 Kalau notifikasi ini terkait status Proker
      if (n.id_ProgramKerja && !n.id_evaluasi) {
        // langsung arahkan ke halaman kelola-proker
        linkUrl = "/hmsi/kelola-proker";
        linkLabel = "Kelola Program Kerja";
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
// ✅ Tandai notifikasi sebagai sudah dibaca
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
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;

    // ambil notifikasi
    const [rows] = await db.query(
      "SELECT * FROM Notifikasi WHERE id_notifikasi = ?",
      [id]
    );
    if (!rows.length) return res.redirect("/hmsi/notifikasi");

    const notif = rows[0];
    let redirectUrl = "/hmsi/notifikasi";

    if (notif.id_evaluasi) {
      redirectUrl = `/hmsi/evaluasi/${notif.id_evaluasi}`;
    } else if (notif.id_ProgramKerja) {
      redirectUrl = "/hmsi/kelola-proker"; // 🔹 fix: pakai dash
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

// =====================================================
// 🗑️ Hapus notifikasi lama kalau status Proker berubah
// =====================================================
exports.deleteOldProkerNotif = async (idProker) => {
  try {
    await db.query(
      "DELETE FROM Notifikasi WHERE id_ProgramKerja = ? AND role = 'HMSI'",
      [idProker]
    );
  } catch (err) {
    console.error("❌ Error deleteOldProkerNotif HMSI:", err.message);
  }
};
