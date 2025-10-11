// =====================================================
// controllers/hmsi/notifikasiController.js
// Controller Notifikasi untuk HMSI
// - Menampilkan notifikasi yang ditujukan untuk HMSI (target_role='HMSI')
// - Menyaring notifikasi berdasarkan divisi login
// - Validasi keberadaan data sebelum redirect
// - Redirect ke error.ejs jika data sudah dihapus
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
// 📄 Ambil semua notifikasi untuk HMSI sesuai divisi
// =====================================================
exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "HMSI") {
      return res.status(401).send("Unauthorized");
    }

    const idDivisi = user.id_divisi;
    if (!idDivisi) {
      console.warn("⚠️ HMSI user tidak memiliki id_divisi di session");
      return res.render("hmsi/hmsiNotifikasi", {
        title: "Notifikasi",
        user,
        activeNav: "notifikasi",
        notifikasi: [],
        unreadCount: 0,
      });
    }

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
        p.Nama_ProgramKerja,
        p.Status AS status_proker,
        l.judul_laporan,
        e.status_konfirmasi AS status_evaluasi,
        u.nama AS evaluator,
        CASE 
          WHEN n.id_evaluasi IS NOT NULL THEN 'evaluasi'
          WHEN n.id_laporan IS NOT NULL AND n.id_ProgramKerja IS NULL THEN 'laporan'
          WHEN n.id_ProgramKerja IS NOT NULL THEN 'proker'
          ELSE 'unknown'
        END AS tipe_notifikasi,
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
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      WHERE n.target_role = 'HMSI'
        AND (n.id_divisi = ? OR l.id_divisi = ?)
      ORDER BY n.created_at DESC
      LIMIT 100
      `,
      [idDivisi, idDivisi]
    );

    // 🔹 Mapping data notifikasi dengan link & label yang sesuai
    const notifikasi = rows.map((r) => {
      let linkUrl = "#";
      let linkLabel = "Lihat";

      if (r.is_deleted) {
        linkUrl = `/hmsi/notifikasi/read/${r.id_notifikasi}`;
        linkLabel = "Data Dihapus";
      } else {
        linkUrl = `/hmsi/notifikasi/read/${r.id_notifikasi}`;
        linkLabel = "Lihat";
      }

      return {
        id_notifikasi: r.id_notifikasi,
        pesan: r.pesan,
        tanggalFormatted: formatTanggal(r.created_at),
        linkUrl,
        linkLabel,
        status_baca: r.status_baca,
        divisi: r.nama_divisi || "Unknown",
        tipe: r.tipe_notifikasi,
        is_deleted: r.is_deleted,
        judul_laporan: r.judul_laporan,
        Nama_ProgramKerja: r.Nama_ProgramKerja,
        evaluator: r.evaluator,
        id_evaluasi: r.id_evaluasi,
        id_ProgramKerja: r.id_ProgramKerja,
      };
    });

    // 🔹 Hitung jumlah notifikasi belum dibaca
    const unreadCount = notifikasi.filter((n) => n.status_baca === 0).length;

    // 🔹 Render ke halaman hmsiNotifikasi.ejs
    res.render("hmsi/hmsiNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "notifikasi",
      notifikasi,
      unreadCount,
    });
  } catch (err) {
    console.error("❌ getAllNotifikasi HMSI error:", err.message);
    res.status(500).send("Gagal mengambil notifikasi HMSI");
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
    let redirectUrl = "/hmsi/notifikasi";
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
        redirectUrl = `/hmsi/proker/${notif.id_ProgramKerja}`;
      } else {
        errorTitle = "Program Kerja Dihapus";
        errorMessage = "Program kerja ini telah dihapus oleh DPA atau HMSI.";
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
        redirectUrl = `/hmsi/laporan/${notif.id_laporan}`;
      } else {
        errorTitle = "Laporan Dihapus";
        errorMessage = "Laporan ini telah dihapus oleh DPA atau sistem.";
      }
    }
    // 🔵 CASE 3: Notifikasi terkait Komentar/Evaluasi
    else if (notif.id_evaluasi) {
      // ✅ Ambil evaluasi DAN cek apakah laporan terkait masih ada
      const [evaluasiRows] = await db.query(
        `SELECT e.id_evaluasi, e.id_laporan, l.id_laporan as laporan_exists
         FROM Evaluasi e
         LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
         WHERE e.id_evaluasi = ?`,
        [notif.id_evaluasi]
      );

      if (evaluasiRows.length > 0) {
        const evalData = evaluasiRows[0];
        
        // ✅ Cek apakah laporan terkait masih ada
        if (evalData.laporan_exists) {
          dataExists = true;
          // 🎯 Redirect ke detail LAPORAN (bukan detail evaluasi)
          // Karena evaluasi DPA ditampilkan di halaman detail laporan
          redirectUrl = `/hmsi/laporan/${evalData.id_laporan}`;
        } else {
          // Evaluasi ada tapi laporan sudah dihapus
          errorTitle = "Laporan Dihapus";
          errorMessage = "Laporan terkait evaluasi ini telah dihapus.";
        }
      } else {
        errorTitle = "Komentar Tidak Tersedia";
        errorMessage = "Komentar atau evaluasi ini telah diperbarui atau dihapus oleh DPA.";
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
    console.error("❌ readAndRedirect HMSI error:", err.message);
    return res.render("partials/error", {
      title: "Terjadi Kesalahan",
      message: "Gagal membuka notifikasi. Silakan coba lagi.",
      user: req.session.user,
    });
  }
};

// =====================================================
// 🧹 Hapus semua notifikasi terkait laporan/proker tertentu
// (digunakan ketika HMSI menghapus entitas tersebut)
// =====================================================
exports.deleteAllRelatedNotif = async (entityId, type = "laporan") => {
  try {
    const column = type === "proker" ? "id_ProgramKerja" : "id_laporan";
    await db.query(`DELETE FROM Notifikasi WHERE ${column} = ?`, [entityId]);
    console.log(`🧹 Semua notifikasi terkait ${type} ${entityId} berhasil dihapus`);
  } catch (err) {
    console.error("❌ Error deleteAllRelatedNotif HMSI:", err.message);
  }
};

// =====================================================
// 🧹 Alias tambahan: hapus notifikasi lama untuk Proker
// =====================================================
exports.deleteOldProkerNotif = async (idProker) => {
  try {
    if (!idProker) return;
    await db.query("DELETE FROM Notifikasi WHERE id_ProgramKerja = ?", [idProker]);
    console.log(`🧹 Notifikasi lama untuk Proker ${idProker} dihapus`);
  } catch (err) {
    console.error("❌ Error deleteOldProkerNotif (HMSI):", err.message);
  }
};