// =====================================================
// controllers/hmsi/notifikasiController.js
// Controller Notifikasi untuk HMSI
// - Menampilkan notifikasi yang DITUJUKAN untuk HMSI (target_role='HMSI')
// - Menyaring notifikasi berdasarkan divisi login
// - Jika laporan/proker dihapus, notifikasi terkait ikut dihapus (otomatis dari HMSI)
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

    const idDivisi = user.id_divisi;
    if (!idDivisi) {
      console.warn("⚠️ HMSI user tidak memiliki id_divisi di session");
      return res.render("hmsi/hmsiNotifikasi", {
        title: "Notifikasi",
        user,
        activeNav: "notifikasi",
        notifikasi: [],
      });
    }

    // 🔹 Ambil notifikasi khusus divisi HMSI ini
    const [rows] = await db.query(
      `
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.created_at,
        n.status_baca,
        n.id_laporan,
        n.id_ProgramKerja,
        n.id_evaluasi,
        l.judul_laporan,
        p.Nama_ProgramKerja,
        d.nama_divisi,
        u.nama AS evaluator
      FROM Notifikasi n
      LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
      LEFT JOIN Program_kerja p 
        ON (l.id_ProgramKerja = p.id_ProgramKerja OR n.id_ProgramKerja = p.id_ProgramKerja)
      LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      LEFT JOIN Divisi d ON n.id_divisi = d.id_divisi
      WHERE n.target_role = 'HMSI'
        AND (n.id_divisi = ? OR l.id_divisi = ?)
      ORDER BY n.created_at DESC
      `,
      [idDivisi, idDivisi]
    );

    // 🔹 Format data
    const notifikasi = rows.map((n) => {
      const tanggalFormatted = n.created_at
        ? new Date(n.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";

      // 🔗 Tentukan tautan berdasarkan konteks notifikasi
      let linkUrl = "/hmsi/notifikasi";
      let linkLabel = "Lihat Detail";

      if (n.id_evaluasi) {
        linkUrl = `/hmsi/evaluasi/${n.id_evaluasi}`;
        linkLabel = "Lihat Evaluasi";
      } else if (n.Nama_ProgramKerja) {
        linkUrl = "/hmsi/kelola-proker";
        linkLabel = "Kelola Program Kerja";
      } else if (n.judul_laporan) {
        linkUrl = "/hmsi/laporan";
        linkLabel = "Kelola Laporan";
      }

      return { ...n, tanggalFormatted, linkUrl, linkLabel };
    });

    res.render("hmsi/hmsiNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "notifikasi",
      notifikasi,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasi HMSI:", err.message);
    res.status(500).send("Gagal mengambil notifikasi HMSI");
  }
};

// =====================================================
// 🚀 Klik notifikasi = tandai sudah dibaca + redirect
// =====================================================
exports.readAndRedirect = async (req, res) => {
  try {
    const { id } = req.params;
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
      redirectUrl = "/hmsi/kelola-proker";
    } else if (notif.id_laporan) {
      redirectUrl = "/hmsi/laporan";
    }

    // Tandai sudah dibaca
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
// 🧹 Alias tambahan: hapus notifikasi lama untuk Proker (dipanggil dari DPA)
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
