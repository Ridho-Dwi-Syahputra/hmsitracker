// controllers/DPA/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi DPA
// - Hanya menampilkan notifikasi yang dibuat oleh HMSI (tambah/edit laporan atau proker)
// - Mengabaikan notifikasi evaluasi (id_evaluasi IS NOT NULL atau teks evaluasi)
// - Klik notifikasi = otomatis tandai sudah dibaca + redirect ke detail
// =====================================================

const db = require("../../config/db");

/**
 * Helper sederhana untuk mengecek apakah teks pesan sepertinya
 * mengindikasikan "penambahan laporan baru".
 */
function isNewLaporanText(pesan = "") {
  const txt = String(pesan).toLowerCase();
  return /menambah|menambahkan|ditambahkan|baru|tambah laporan|laporan baru/.test(txt);
}

// =====================================================
// 📄 Ambil semua notifikasi untuk DPA (hanya notifikasi HMSI)
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;

    // 🔒 hanya DPA boleh akses
    if (!user || user.role !== "DPA") {
      return res.status(401).send("Unauthorized");
    }

    // Ambil notifikasi dari HMSI (exclude evaluasi)
    const [rows] = await db.query(
      `SELECT 
         n.*, 
         l.judul_laporan, 
         l.divisi AS laporan_divisi, 
         p.id_ProgramKerja AS proker_id,
         p.Nama_ProgramKerja
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p 
         ON n.id_ProgramKerja = p.id_ProgramKerja
       WHERE (n.id_evaluasi IS NULL OR n.id_evaluasi = '')
         AND LOWER(COALESCE(n.pesan, '')) NOT LIKE '%evaluasi%'
         AND (
           n.id_laporan IS NOT NULL
           OR n.id_ProgramKerja IS NOT NULL
           OR LOWER(COALESCE(n.pesan, '')) LIKE '%program kerja%'
           OR LOWER(COALESCE(n.pesan, '')) LIKE '%laporan%'
         )
       ORDER BY n.created_at DESC`
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

      // 🔑 Prioritas: Laporan > Proker
      const isLaporan = !!n.id_laporan;
      const prokerId = !isLaporan ? (n.proker_id || n.id_ProgramKerja || null) : null;
      const isProker = !!prokerId;

      // tentukan link & label
      let linkUrl = "#";
      let linkLabel = "Lihat";

      if (isLaporan) {
        linkUrl = `/dpa/kelolaLaporan/${n.id_laporan}`;
        linkLabel = isNewLaporanText(n.pesan) ? "Lihat Laporan Baru" : "Lihat Laporan";
      } else if (isProker) {
        linkUrl = `/dpa/lihatProker/${prokerId}/detail`;
        linkLabel = "Lihat Program Kerja";
      }

      // short message
      const divisiText =
        (n.divisi && n.divisi !== "-")
          ? n.divisi
          : (n.laporan_divisi && n.laporan_divisi !== "-")
          ? n.laporan_divisi
          : "Divisi";

      const shortMsg = isLaporan
        ? `${divisiText} telah menambahkan Laporan baru`
        : `${divisiText} telah membuat Program Kerja baru`;

      return {
        ...n,
        tanggalFormatted,
        _isProker: isProker,
        _isLaporan: isLaporan,
        linkUrl,
        linkLabel,
        shortMsg,
        divisi: n.divisi || n.laporan_divisi || "-",
      };
    });

    res.render("dpa/dpaNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "Notifikasi",
      notifikasi,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasi DPA:", err.message);
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
    return res.redirect("/dpa/dpaNotifikasi");
  } catch (err) {
    console.error("❌ Error markAsRead DPA:", err.message);
    res.status(500).send("Gagal update notifikasi");
  }
};

// =====================================================
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect ke tujuan (readAndRedirect)
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    let redirectUrl = req.query.to ? decodeURIComponent(req.query.to) : "/dpa/dpaNotifikasi";

    // hanya izinkan redirect ke /dpa/*
    if (!(typeof redirectUrl === "string" && redirectUrl.startsWith("/dpa"))) {
      redirectUrl = "/dpa/dpaNotifikasi";
    }

    await db.query(
      "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
      [id]
    );

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Error readAndRedirect DPA:", err.message);
    res.status(500).send("Gagal membaca notifikasi");
  }
};

// =====================================================
// ❌ Hapus notifikasi (opsional)
// =====================================================
// exports.deleteNotifikasi = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await db.query("DELETE FROM Notifikasi WHERE id_notifikasi = ?", [id]);
//     return res.redirect("/dpa/dpaNotifikasi");
//   } catch (err) {
//     console.error("❌ Error deleteNotifikasi DPA:", err.message);
//     res.status(500).send("Gagal menghapus notifikasi");
//   }
// };
