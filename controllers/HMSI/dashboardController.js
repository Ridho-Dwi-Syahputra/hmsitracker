// =====================================================
// controllers/HMSI/dashboardController.js
// =====================================================

const db = require("../../config/db");


function getDisplayStatus(start, end, status_db) {
  //  Jika status sudah final (diisi DPA), gunakan status dari DB
  if (status_db === "Selesai" || status_db === "Tidak Selesai" || status_db === "Gagal") {
    return status_db;
  }
  
  // Jika status dari DB adalah "Sedang Berjalan", tetap gunakan itu
  if (status_db === "Sedang Berjalan") {
    return status_db;
  }
  
  const today = new Date();
  const startDate = start ? new Date(start) : null;

  // Hanya cek apakah proker sudah dimulai atau belum
  if (startDate && today < startDate) return "Belum Dimulai";
  if (startDate && today >= startDate) return "Sedang Berjalan";
  
  //  Default aman jika tidak ada tanggal mulai
  return "Belum Dimulai";
}

// =====================================================
// GET: Statistik Dashboard
// DIPERBAIKI: Hanya membaca data (READ-ONLY)
// =====================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/auth/login");

    const idDivisi = user.id_divisi || null;
    if (!idDivisi) {
      console.warn(`User ${user.nama} belum memiliki id_divisi.`);
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
      
      // Gunakan helper yang aman UNTUK TAMPILAN
      const status = getDisplayStatus(r.Tanggal_mulai, r.Tanggal_selesai, r.status_db);

      if (status === "Selesai") prokerSelesai++;
      if (status === "Sedang Berjalan") prokerBerjalan++;
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