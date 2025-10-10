// controllers/dpa/notifikasiController.js
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

    // 🔹 Hanya notifikasi yang target_role = 'DPA'
    const [rows] = await db.query(`
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.created_at,
        n.status_baca,
        l.id_laporan,
        l.judul_laporan,
        l.id_divisi AS laporan_divisi_id,
        d.nama_divisi,
        p.id_ProgramKerja AS proker_id,
        p.Nama_ProgramKerja
      FROM Notifikasi n
      LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
      LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON COALESCE(l.id_divisi, n.id_divisi) = d.id_divisi
      WHERE n.target_role = 'DPA'
        AND (n.id_evaluasi IS NULL OR n.id_evaluasi = '')
        AND LOWER(COALESCE(n.pesan, '')) NOT LIKE '%evaluasi%'
      ORDER BY n.created_at DESC
    `);

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

      const isLaporan = !!n.id_laporan;
      const isProker = !!n.proker_id;
      let linkUrl = "#";
      let linkLabel = "Lihat";

      if (isLaporan) {
        linkUrl = `/dpa/kelolaLaporan/${n.id_laporan}`;
        linkLabel = isNewLaporanText(n.pesan)
          ? "Lihat Laporan Baru"
          : "Lihat Laporan";
      } else if (isProker) {
        linkUrl = `/dpa/lihatProker/${n.proker_id}/detail`;
        linkLabel = "Lihat Program Kerja";
      }

      const divisiText = n.nama_divisi || "Divisi Tidak Dikenal";
      const shortMsg = isLaporan
        ? `${divisiText} telah menambahkan laporan baru`
        : `${divisiText} telah membuat program kerja baru`;

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

    // 🔹 Ambil hanya notifikasi evaluasi yang target_role = 'DPA'
    const [rows] = await db.query(`
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.created_at,
        n.status_baca,
        e.id_evaluasi,
        e.komentar_hmsi,
        l.id_laporan,
        l.judul_laporan,
        l.id_divisi AS laporan_divisi_id,
        d.nama_divisi,
        p.Nama_ProgramKerja
      FROM Notifikasi n
      JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Divisi d ON l.id_divisi = d.id_divisi
      WHERE n.target_role = 'DPA'
      ORDER BY n.created_at DESC
    `);

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

      const divisiText = n.nama_divisi || "Divisi Tidak Dikenal";

      return {
        ...n,
        tanggalFormatted,
        linkUrl: `/dpa/detailLaporan/${n.id_laporan}`,
        linkLabel: "Lihat Komentar HMSI",
        shortMsg: `${divisiText} menambahkan komentar pada evaluasi proker "${n.Nama_ProgramKerja}"`,
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
    await db.query("UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?", [id]);
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

    await db.query("UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?", [id]);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Error readAndRedirect DPA:", err.message);
    res.status(500).send("Gagal membaca notifikasi");
  }
};
