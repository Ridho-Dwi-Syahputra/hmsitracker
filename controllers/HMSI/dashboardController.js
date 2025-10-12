// =====================================================
// controllers/HMSI/dashboardController.js
// =====================================================

const db = require("../../config/db");


function calculateStatusWithLock(start, end, status_db) {
  if (status_db === "Selesai" || status_db === "Gagal") return status_db;

  const today = new Date();
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;

  if (s && today < s) return "Belum Dimulai";
  if (s && e && today >= s && today <= e) return "Sedang Berjalan";
  if (e && today > e) return "Selesai";
  return "Belum Dimulai";
}

exports.getDashboardStats = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/auth/login");

    const idDivisi = user.id_divisi || null;
    if (!idDivisi) {
      console.warn(`⚠️ User ${user.nama} belum memiliki id_divisi.`);
      return res.render("hmsi/hmsiDashboard", {
        title: "Dashboard HMSI",
        user,
        activeNav: "Dashboard",
        totalProker: 0,
        prokerSelesai: 0,
        prokerBerjalan: 0,
        totalLaporan: 0,
        unreadCount: res.locals.unreadCount || 0,
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        pk.id_ProgramKerja AS id,
        pk.Nama_ProgramKerja AS namaProker,
        pk.Tanggal_mulai,
        pk.Tanggal_selesai,
        pk.Status AS status_db
      FROM Program_kerja pk
      WHERE pk.id_divisi = ?
      `,
      [idDivisi]
    );

    let totalProker = 0;
    let prokerSelesai = 0;
    let prokerBerjalan = 0;

    for (const r of rows) {
      totalProker++;
      const status = calculateStatusWithLock(r.Tanggal_mulai, r.Tanggal_selesai, r.status_db);
      if (status === "Selesai") prokerSelesai++;
      if (status === "Sedang Berjalan") prokerBerjalan++;

      // Update status otomatis jika belum final
      if (status !== r.status_db && !["Selesai", "Gagal"].includes(r.status_db)) {
        await db.query(`UPDATE Program_kerja SET Status=? WHERE id_ProgramKerja=?`, [
          status,
          r.id,
        ]);
      }
    }

    // =====================================================
    // 🔹Hitung laporan milik divisi
    // =====================================================
    const [laporanRows] = await db.query(
      `SELECT COUNT(*) AS total FROM Laporan WHERE id_divisi = ?`,
      [idDivisi]
    );

    const totalLaporan = laporanRows[0]?.total || 0;

    // =====================================================
    // Render Dashboard
    // =====================================================
    res.render("hmsi/hmsiDashboard", {
      title: "Dashboard HMSI",
      user,
      activeNav: "Dashboard",
      totalProker,
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
      unreadCount: res.locals.unreadCount || 0,
    });
  } catch (err) {
    console.error("❌ Error getDashboardStats:", err.message);
    res.status(500).send("Terjadi kesalahan server saat memuat dashboard HMSI.");
  }
};
