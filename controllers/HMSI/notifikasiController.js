// =====================================================
// controllers/hmsi/notifikasiController.js
// Controller Notifikasi untuk HMSI
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

    const [rows] = await db.query(
      `
      SELECT 
        n.id_notifikasi, n.pesan, n.status_baca, n.created_at,
        n.id_ProgramKerja, n.id_laporan, n.id_evaluasi,
        d.nama_divisi, p.Nama_ProgramKerja, l.judul_laporan,
        e.status_konfirmasi AS status_evaluasi, u.nama AS evaluator,
        CASE 
          WHEN n.id_evaluasi IS NOT NULL THEN 'evaluasi'
          WHEN n.id_laporan IS NOT NULL THEN 'laporan'
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
      WHERE n.target_role = 'HMSI' AND (n.id_divisi = ? OR l.id_divisi = ?)
      ORDER BY n.created_at DESC
      LIMIT 100
      `,
      [idDivisi, idDivisi]
    );

    const notifikasi = rows.map((r) => {
      const linkUrl = `/hmsi/notifikasi/read/${r.id_notifikasi}`;
      const linkLabel = r.is_deleted ? "Data Dihapus" : "Lihat";

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
      };
    });

    const unreadCount = notifikasi.filter((n) => n.status_baca === 0).length;

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
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;

    const [notifRows] = await db.query(
      `SELECT * FROM Notifikasi WHERE id_notifikasi = ?`,
      [id]
    );

    if (!notifRows.length) {
      return res.render("partials/error", {
        title: "Notifikasi Tidak Ditemukan",
        message: "Notifikasi yang Anda cari tidak ditemukan.",
        user,
      });
    }

    const notif = notifRows[0];
    await db.query("UPDATE Notifikasi SET status_baca = 1 WHERE id_notifikasi = ?", [id]);

    let redirectUrl = "/hmsi/notifikasi";
    let errorTitle = "Data Tidak Ditemukan";
    let errorMessage = "Data yang Anda cari mungkin telah dihapus.";

    // ✅ DIPERBAIKI: Logika redirect untuk notifikasi evaluasi
    if (notif.id_evaluasi) {
      const [evalRows] = await db.query(
        `SELECT id_evaluasi FROM Evaluasi WHERE id_evaluasi = ?`, [notif.id_evaluasi]
      );
      if (evalRows.length > 0) {
        // Langsung arahkan ke halaman detail evaluasi
        redirectUrl = `/hmsi/kelola-evaluasi/${notif.id_evaluasi}`;
        return res.redirect(redirectUrl);
      } else {
        errorTitle = "Evaluasi Dihapus";
        errorMessage = "Data evaluasi ini telah dihapus atau diperbarui oleh DPA.";
      }
    }
    // Logika untuk notifikasi laporan (tidak berubah)
    else if (notif.id_laporan) {
      const [laporanRows] = await db.query(
        `SELECT id_laporan FROM Laporan WHERE id_laporan = ?`, [notif.id_laporan]
      );
      if (laporanRows.length > 0) {
        redirectUrl = `/hmsi/laporan/${notif.id_laporan}`;
        return res.redirect(redirectUrl);
      } else {
        errorTitle = "Laporan Dihapus";
      }
    }
    // Logika untuk notifikasi program kerja (tidak berubah)
    else if (notif.id_ProgramKerja) {
      const [prokerRows] = await db.query(
        `SELECT id_ProgramKerja FROM Program_kerja WHERE id_ProgramKerja = ?`, [notif.id_ProgramKerja]
      );
      if (prokerRows.length > 0) {
        redirectUrl = `/hmsi/proker/${notif.id_ProgramKerja}`;
        return res.redirect(redirectUrl);
      } else {
        errorTitle = "Program Kerja Dihapus";
      }
    }

    // Jika data tidak ditemukan setelah validasi, tampilkan halaman error
    return res.render("partials/error", {
      title: errorTitle,
      message: errorMessage,
      user,
    });

  } catch (err) {
    console.error("❌ readAndRedirect HMSI error:", err.message);
    return res.render("partials/error", {
      title: "Terjadi Kesalahan",
      message: "Gagal membuka notifikasi. Silakan coba lagi.",
      user: req.session.user,
    });
  }
};

// ... (sisa file tidak perlu diubah) ...

// =====================================================
// 🧹 Hapus semua notifikasi terkait laporan/proker tertentu
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