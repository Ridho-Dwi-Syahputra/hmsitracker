// =====================================================
// controllers/dpa/dpaDashboardController.js
// Controller khusus untuk Dashboard DPA
// =====================================================

const db = require("../../config/db");

// =====================================================
// 📊 GET: Statistik Dashboard DPA
// =====================================================
exports.getDpaDashboardStats = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || user.role !== "DPA") {
      console.error("⚠️ Akses ditolak: bukan DPA atau sesi tidak valid.");
      return res.redirect("/auth/login?error=Akses ditolak.");
    }

    // =====================================================
    // 📦 Ambil semua statistik secara paralel
    // =====================================================
    const [
      totalProkerResult,
      prokerSelesaiResult,
      prokerBerjalanResult,
      totalLaporanResult,
      perDivisiResult
    ] = await Promise.all([
      // 1️⃣ Total program kerja
      db.query(`SELECT COUNT(*) AS total FROM Program_kerja`),

      // 2️⃣ Program kerja yang sudah selesai (Tanggal_selesai < hari ini)
      db.query(`
        SELECT COUNT(*) AS total 
        FROM Program_kerja 
        WHERE Tanggal_selesai < CURDATE()
      `),

      // 3️⃣ Program kerja yang sedang berjalan
      db.query(`
        SELECT COUNT(*) AS total 
        FROM Program_kerja 
        WHERE CURDATE() BETWEEN Tanggal_mulai AND Tanggal_selesai
      `),

      // 4️⃣ Total laporan dari semua divisi
      db.query(`SELECT COUNT(*) AS total FROM Laporan`),

      // 5️⃣ Statistik per divisi (optional, untuk grafik)
      db.query(`
        SELECT 
          COALESCE(d.nama_divisi, u.id_divisi) AS divisi,
          COUNT(p.id_ProgramKerja) AS totalProker
        FROM Program_kerja p
        LEFT JOIN User u ON p.id_anggota = u.id_anggota
        LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
        GROUP BY divisi
        ORDER BY divisi ASC
      `)
    ]);

    // =====================================================
    // 📈 Ekstraksi hasil query
    // =====================================================
    const totalProker = totalProkerResult[0][0].total || 0;
    const prokerSelesai = prokerSelesaiResult[0][0].total || 0;
    const prokerBerjalan = prokerBerjalanResult[0][0].total || 0;
    const totalLaporan = totalLaporanResult[0][0].total || 0;

    const perDivisiData = perDivisiResult[0].map(row => ({
      divisi: row.divisi || "Tidak diketahui",
      totalProker: row.totalProker
    }));

    // =====================================================
    // 🎨 Render ke EJS
    // =====================================================
    res.render("dpa/dpaDashboard", {
      title: "Dashboard DPA",
      user,
      activeNav: "Dashboard",
      totalProker,
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
      perDivisiData // bisa dipakai di chart front-end
    });
  } catch (error) {
    console.error("❌ Error saat mengambil statistik DPA:", error.message);
    res.status(500).send("Terjadi kesalahan pada server. Cek log untuk detail.");
  }
};
