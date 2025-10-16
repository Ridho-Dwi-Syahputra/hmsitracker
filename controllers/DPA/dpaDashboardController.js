// =====================================================
// controllers/dpa/dpaDashboardController.js
// Controller khusus untuk Dashboard DPA (VERSI FINAL DIPERBAIKI)
// =====================================================

const db = require("../../config/db");

// Helper untuk format tanggal
function formatTanggal(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// =====================================================
// 📊 GET: Statistik Dashboard DPA
// =====================================================
exports.getDpaDashboardStats = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "DPA") {
      console.error("Akses ditolak: bukan DPA atau sesi tidak valid.");
      return res.redirect("/auth/login?error=Akses ditolak.");
    }

    const [
      totalProkerResult,
      prokerSelesaiResult,
      prokerBerjalanResult,
      laporanBelumEvaluasiResult,
      laporanRevisiResult,
      recentHmsiActivitiesResult,
      totalLaporanResult,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM Program_kerja`),
      db.query(`SELECT COUNT(*) AS total FROM Program_kerja WHERE Status = 'Selesai'`),
      db.query(`SELECT COUNT(*) AS total FROM Program_kerja WHERE CURDATE() BETWEEN Tanggal_mulai AND Tanggal_selesai AND (Status IS NULL OR Status = 'Sedang Berjalan')`),
      db.query(`SELECT COUNT(*) AS total FROM Laporan l LEFT JOIN Evaluasi e ON l.id_laporan = e.id_laporan WHERE e.id_evaluasi IS NULL`),
      db.query(`
        SELECT COUNT(*) AS total FROM Evaluasi e
        WHERE e.status_konfirmasi = 'Revisi' AND e.tanggal_evaluasi = (
          SELECT MAX(sub_e.tanggal_evaluasi) FROM Evaluasi sub_e WHERE sub_e.id_laporan = e.id_laporan
        )
      `),
      db.query(`
        (
            -- Aktivitas 1: Laporan baru diajukan
            SELECT
                CONCAT('Mengajukan laporan: "', l.judul_laporan, '"') as description,
                d.nama_divisi,
                l.tanggal as activity_timestamp
            FROM Laporan l
            JOIN Divisi d ON l.id_divisi = d.id_divisi
        )
        UNION ALL
        (
            -- Aktivitas 2: HMSI membalas/mengomentari evaluasi
            SELECT
                CONCAT('Membalas evaluasi pada: "', l.judul_laporan, '"') as description,
                d.nama_divisi,
                e.updated_at as activity_timestamp
            FROM Evaluasi e
            JOIN Laporan l ON e.id_laporan = l.id_laporan
            JOIN Divisi d ON l.id_divisi = d.id_divisi
            /* ✅ KUNCI PERBAIKAN: Mengganti e.created_at menjadi e.tanggal_evaluasi */
            WHERE e.komentar_hmsi IS NOT NULL AND e.updated_at > e.tanggal_evaluasi
        )
        ORDER BY activity_timestamp DESC
        LIMIT 5
      `),
      db.query(`SELECT COUNT(*) AS total FROM Laporan`),
    ]);

    const totalProker = totalProkerResult[0][0].total || 0;
    const prokerSelesai = prokerSelesaiResult[0][0].total || 0;
    const prokerBerjalan = prokerBerjalanResult[0][0].total || 0;
    const totalLaporan = totalLaporanResult[0][0].total || 0;
    const laporanBelumEvaluasi = laporanBelumEvaluasiResult[0][0].total || 0;
    const laporanRevisi = laporanRevisiResult[0][0].total || 0;

    const recentHmsiActivities = recentHmsiActivitiesResult[0].map(item => ({
      ...item,
      tanggalFormatted: formatTanggal(item.activity_timestamp)
    }));
    
    res.render("dpa/dpaDashboard", {
      title: "Dashboard DPA",
      user,
      activeNav: "Dashboard",
      totalProker,
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
      laporanBelumEvaluasi,
      laporanRevisi,
      recentHmsiActivities,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil statistik DPA:", error.message);
    res.status(500).send("Terjadi kesalahan pada server. Cek log untuk detail.");
  }
};