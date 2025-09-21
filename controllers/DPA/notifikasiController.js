// controllers/DPA/notifikasiController.js
// =====================================================
// Controller untuk Notifikasi DPA
// =====================================================
// - getAllNotifikasi: notifikasi laporan/proker dari HMSI
// - getAllNotifikasiEvaluasi: notifikasi komentar HMSI pada evaluasi
// - markAsRead: tandai notifikasi sudah dibaca
// - readAndRedirect: tandai & redirect
// =====================================================

const db = require("../../config/db");

/**
 * Helper sederhana untuk mengecek apakah teks pesan
 * mengindikasikan "penambahan laporan baru".
 */
function isNewLaporanText(pesan = "") {
  const txt = String(pesan).toLowerCase();
  return /menambah|menambahkan|ditambahkan|baru|tambah laporan|laporan baru/.test(txt);
}

// =====================================================
// 📄 Ambil semua notifikasi untuk DPA (laporan/proker HMSI)
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "DPA") {
      return res.status(401).send("Unauthorized");
    }

    const [rows] = await db.query(
      `SELECT 
         n.*, 
         l.judul_laporan, 
         l.divisi AS laporan_divisi, 
         p.id_ProgramKerja AS proker_id,
         p.Nama_ProgramKerja
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
       WHERE (n.id_evaluasi IS NULL OR n.id_evaluasi = '')
         AND (n.role IS NULL OR n.role = 'DPA') -- pastikan bukan notif komentar HMSI
         AND LOWER(COALESCE(n.pesan, '')) NOT LIKE '%evaluasi%'
       ORDER BY n.created_at DESC`
    );

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

      const isLaporan = !!n.id_laporan;
      const prokerId = !isLaporan ? (n.proker_id || n.id_ProgramKerja || null) : null;
      const isProker = !!prokerId;

      let linkUrl = "#";
      let linkLabel = "Lihat";

      if (isLaporan) {
        linkUrl = `/dpa/kelolaLaporan/${n.id_laporan}`;
        linkLabel = isNewLaporanText(n.pesan) ? "Lihat Laporan Baru" : "Lihat Laporan";
      } else if (isProker) {
        linkUrl = `/dpa/lihatProker/${prokerId}/detail`;
        linkLabel = "Lihat Program Kerja";
      }

      const divisiText = n.divisi || n.laporan_divisi || "Divisi";

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
        divisi: divisiText,
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
// 📄 Ambil notifikasi komentar evaluasi dari HMSI
// =====================================================
exports.getAllNotifikasiEvaluasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "DPA") {
      return res.status(401).send("Unauthorized");
    }

    const [rows] = await db.query(
      `SELECT 
         n.*,
         e.id_evaluasi,
         e.komentar_hmsi,
         l.id_laporan,
         l.judul_laporan,
         l.divisi,
         p.Nama_ProgramKerja
       FROM Notifikasi n
       JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
       JOIN Laporan l ON e.id_laporan = l.id_laporan
       JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
       WHERE n.id_evaluasi IS NOT NULL
         AND n.role = 'DPA'  -- khusus notif dari HMSI untuk DPA
       ORDER BY n.created_at DESC`
    );

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

      return {
        ...n,
        tanggalFormatted,
        linkUrl: `/dpa/detailLaporan/${n.id_laporan}`,
        linkLabel: "Lihat Komentar HMSI",
        shortMsg: `${n.divisi} menambahkan komentar pada evaluasi proker "${n.Nama_ProgramKerja}"`,
      };
    });

    res.render("dpa/dpaNotifikasiEvaluasi", {
      title: "Notifikasi Evaluasi",
      user,
      activeNav: "Notifikasi Evaluasi",
      notifikasi,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasiEvaluasi DPA:", err.message);
    res.status(500).send("Gagal mengambil notifikasi evaluasi");
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
    return res.redirect("/dpa/dpaNotifikasi");
  } catch (err) {
    console.error("❌ Error markAsRead DPA:", err.message);
    res.status(500).send("Gagal update notifikasi");
  }
};

// =====================================================
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    let redirectUrl = req.query.to ? decodeURIComponent(req.query.to) : "/dpa/dpaNotifikasi";

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
