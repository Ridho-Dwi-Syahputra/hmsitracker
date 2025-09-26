// =====================================================
// controllers/DPA/dpaDashboardController.js
// Controller khusus untuk Dashboard DPA
// =====================================================

const db = require("../../config/db"); // <-- PERUBAHAN DI SINI

exports.getDpaDashboardStats = async (req, res) => {
  try {
    // Untuk DPA, kita tidak memfilter berdasarkan divisi, jadi kita ambil semua.
    const [
      totalProkerResult,
      prokerSelesaiResult,
      prokerBerjalanResult,
      totalLaporanResult,
    ] = await Promise.all([
      // 1. Hitung TOTAL program kerja dari SEMUA divisi
      db.query(`SELECT COUNT(*) AS total FROM Program_kerja`),

      // 2. Hitung program kerja SELESAI dari SEMUA divisi
      db.query(
        `SELECT COUNT(*) AS total FROM Program_kerja WHERE Tanggal_selesai < CURDATE()`
      ),

      // 3. Hitung program kerja BERJALAN dari SEMUA divisi
      db.query(
        `SELECT COUNT(*) AS total FROM Program_kerja WHERE CURDATE() BETWEEN Tanggal_mulai AND Tanggal_selesai`
      ),

      // 4. Hitung TOTAL laporan dari SEMUA divisi
      db.query(`SELECT COUNT(*) AS total FROM Laporan`),
    ]);

    // Mengekstrak angka dari hasil query
    const totalProker = totalProkerResult[0][0].total;
    const prokerSelesai = prokerSelesaiResult[0][0].total;
    const prokerBerjalan = prokerBerjalanResult[0][0].total;
    const totalLaporan = totalLaporanResult[0][0].total;

    // Merender halaman dpaDashboard dengan semua data statistik
    res.render("dpa/dpaDashboard", {
      title: "Dashboard DPA",
      user: req.session.user,
      activeNav: "Dashboard",
      totalProker,
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil statistik DPA:", error.message);
    res.status(500).send("Terjadi kesalahan pada server.");
  }
};