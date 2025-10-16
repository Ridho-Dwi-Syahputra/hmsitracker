// =====================================================
// controllers/dpa/notifikasiController.js
// Controller untuk Notifikasi DPA (Gabungan: Proker, Laporan, Evaluasi)
// =====================================================

const db = require("../../config/db");

// =====================================================
// Helper: format tanggal Indonesia
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// 📄 Ambil SEMUA notifikasi (Proker, Laporan, Evaluasi)
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;

    // 🔹 Query gabungan dengan deteksi tipe & status dihapus
    const [rows] = await db.query(
      `
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.status_baca,
        n.created_at,
        n.id_ProgramKerja,
        n.id_laporan,
        n.id_evaluasi,
        d.nama_divisi,
        
        -- Data Program Kerja (jika ada)
        p.Nama_ProgramKerja,
        p.Status AS status_proker,
        
        -- Data Laporan (jika ada)
        l.judul_laporan,
        
        -- Data Evaluasi (jika ada)
        e.status_konfirmasi AS status_evaluasi,
        
        -- Deteksi tipe notifikasi
        CASE 
          WHEN n.id_evaluasi IS NOT NULL THEN 'evaluasi'
          WHEN n.id_laporan IS NOT NULL AND n.id_ProgramKerja IS NULL THEN 'laporan'
          WHEN n.id_ProgramKerja IS NOT NULL THEN 'proker'
          ELSE 'unknown'
        END AS tipe_notifikasi,
        
        -- Deteksi apakah data masih ada atau sudah dihapus
        CASE 
          WHEN n.id_evaluasi IS NOT NULL AND e.id_evaluasi IS NULL THEN 1
          WHEN n.id_laporan IS NOT NULL AND l.id_laporan IS NULL THEN 1
          WHEN n.id_ProgramKerja IS NOT NULL AND p.id_ProgramKerja IS NULL THEN 1
          ELSE 0
        END AS is_deleted
      
      FROM Notifikasi n
      LEFT JOIN Divisi d ON n.id_divisi = d.id_divisi
      LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
      LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
      
      WHERE n.target_role = 'DPA'
      ORDER BY n.created_at DESC
      LIMIT 100
      `
    );

    // 🔹 Mapping data notifikasi dengan link & label yang sesuai
    const notifikasi = rows.map((r) => {
      let linkUrl = "#";
      let linkLabel = "Lihat";
      let shortMsg = r.pesan; // ✅ Gunakan pesan asli dari database

      // 🔸 Jika data sudah dihapus
      if (r.is_deleted) {
        linkUrl = `/dpa/readNotifikasi/${r.id_notifikasi}`;
        linkLabel = "Data Dihapus";
      } 
      // 🔸 Jika data masih ada, tentukan link berdasarkan tipe
      else {
        linkUrl = `/dpa/readNotifikasi/${r.id_notifikasi}`;
        linkLabel = "Lihat";
      }

      return {
        id_notifikasi: r.id_notifikasi,
        shortMsg, // ✅ Pesan lengkap dari database
        tanggalFormatted: formatTanggal(r.created_at),
        linkUrl,
        linkLabel,
        status_baca: r.status_baca,
        divisi: r.nama_divisi || "Unknown",
        tipe: r.tipe_notifikasi,
        is_deleted: r.is_deleted,
      };
    });

    // 🔹 Hitung jumlah notifikasi belum dibaca
    const unreadCount = notifikasi.filter((n) => n.status_baca === 0).length;

    // 🔹 Render ke halaman dpaNotifikasi.ejs
    res.render("dpa/dpaNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "Notifikasi",
      notifikasi,
      unreadCount,
      successMsg: req.query.success || null,
      errorMsg: req.query.error || null,
    });
  } catch (err) {
    console.error("❌ getAllNotifikasi error:", err.message);
    res.status(500).send("Gagal mengambil notifikasi");
  }
};

// =====================================================
// ✅ Tandai notifikasi sebagai sudah dibaca (AJAX)
// =====================================================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
      [id]
    );

    res.json({ success: true, message: "Notifikasi ditandai sudah dibaca" });
  } catch (err) {
    console.error("❌ markAsRead error:", err.message);
    res.status(500).json({ success: false, error: "Gagal menandai notifikasi" });
  }
};

// =====================================================
// 🔄 Baca notifikasi & redirect ke halaman terkait
//    dengan VALIDASI data masih ada atau sudah dihapus
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;

    // 🔹 STEP 1: Ambil data notifikasi
    const [notifRows] = await db.query(
      `SELECT * FROM Notifikasi WHERE id_notifikasi = ?`,
      [id]
    );

    if (!notifRows.length) {
      return res.render("partials/error", {
        title: "Notifikasi Tidak Ditemukan",
        message: "Notifikasi yang Anda cari tidak ditemukan di sistem.",
        user,
      });
    }

    const notif = notifRows[0];

    // 🔹 STEP 2: Tandai notifikasi sebagai sudah dibaca
    await db.query(
      "UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?",
      [id]
    );

    // 🔹 STEP 3: Deteksi tipe notifikasi dan validasi keberadaan data
    let dataExists = false;
    let redirectUrl = "/dpa/notifikasi";
    let errorTitle = "Data Tidak Ditemukan";
    let errorMessage = "Data yang Anda cari sudah tidak tersedia.";

    // 🟢 CASE 1: Notifikasi terkait Program Kerja
    if (notif.id_ProgramKerja) {
      const [prokerRows] = await db.query(
        `SELECT id_ProgramKerja FROM Program_kerja WHERE id_ProgramKerja = ?`,
        [notif.id_ProgramKerja]
      );

      if (prokerRows.length > 0) {
        dataExists = true;
        redirectUrl = `/dpa/lihatProker/${notif.id_ProgramKerja}/detail`;
      } else {
        errorTitle = "Program Kerja Dihapus";
        errorMessage = "Program kerja ini telah dihapus oleh HMSI.";
      }
    }
    // 🟡 CASE 2: Notifikasi terkait Laporan (bukan evaluasi)
    else if (notif.id_laporan && !notif.id_evaluasi) {
      const [laporanRows] = await db.query(
        `SELECT id_laporan FROM Laporan WHERE id_laporan = ?`,
        [notif.id_laporan]
      );

      if (laporanRows.length > 0) {
        dataExists = true;
        // KUNCI PERBAIKAN: Ubah 'kelolaLaporan' menjadi 'laporan' agar cocok dengan router
        redirectUrl = `/dpa/laporan/${notif.id_laporan}`;
      } else {
        errorTitle = "Laporan Dihapus";
        errorMessage = "Laporan ini telah dihapus oleh HMSI.";
      }
    }
    // 🔵 CASE 3: Notifikasi terkait Komentar/Evaluasi
    else if (notif.id_evaluasi) {
      const [evaluasiRows] = await db.query(
        `SELECT id_evaluasi, id_laporan FROM Evaluasi WHERE id_evaluasi = ?`,
        [notif.id_evaluasi]
      );

      if (evaluasiRows.length > 0) {
        dataExists = true;
        // KUNCI PERBAIKAN: Ubah 'kelolaLaporan' menjadi 'laporan' agar cocok dengan router
        redirectUrl = `/dpa/laporan/${evaluasiRows[0].id_laporan}`;
      } else {
        errorTitle = "Komentar Tidak Tersedia";
        errorMessage = "Komentar pada laporan ini telah diperbarui atau dihapus oleh HMSI.";
      }
    }

    // 🔹 STEP 4: Render halaman error atau redirect
    if (!dataExists) {
      return res.render("partials/error", {
        title: errorTitle,
        message: errorMessage,
        user,
      });
    }

    // ✅ Data masih ada, redirect ke halaman terkait
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ readAndRedirect error:", err.message);
    return res.render("partials/error", {
      title: "Terjadi Kesalahan",
      message: "Gagal membuka notifikasi. Silakan coba lagi.",
      user: req.session.user,
    });
  }
};