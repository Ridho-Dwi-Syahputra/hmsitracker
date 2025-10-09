// File: controllers/HMSI/dashboardController.js
const db = require("../../config/db");

// 🔹 helper: hitung status otomatis dengan respect ke keputusan DPA
function calculateStatusWithLock(start, end, status_db) {
  if (status_db === "Selesai" || status_db === "Gagal") {
    return status_db;
  }

  const today = new Date();
  start = start ? new Date(start) : null;
  end = end ? new Date(end) : null;

  if (start && today < start) return "Belum Dimulai";
  if (start && end && today >= start && today <= end) return "Sedang Berjalan";
  if (end && today > end) return "Selesai";
  return "Belum Dimulai";
}

// =====================================================
// 📊 Dashboard HMSI (berdasarkan divisi login)
// =====================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const user = req.session.user;
    const idDivisi = user?.id_divisi || null;

    if (!user || !idDivisi) {
      console.error("Dashboard Gagal: Session user/id_divisi tidak ditemukan.");
      return res.redirect("/auth/login?error=Sesi Anda tidak valid.");
    }

    // 🔹 Ambil semua proker milik divisi user
    const [rows] = await db.query(
      `SELECT 
        pk.id_ProgramKerja AS id,
        pk.Nama_ProgramKerja AS namaProker,
        pk.Tanggal_mulai AS tanggal_mulai,
        pk.Tanggal_selesai AS tanggal_selesai,
        pk.Status AS status_db,
        d.nama_divisi
       FROM Program_kerja pk
       JOIN User u ON pk.id_anggota = u.id_anggota
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.id_divisi = ?`,
      [idDivisi]
    );

    let totalProker = 0;
    let prokerSelesai = 0;
    let prokerBerjalan = 0;

    rows.forEach(r => {
      totalProker++;
      const status = calculateStatusWithLock(r.tanggal_mulai, r.tanggal_selesai, r.status_db);
      if (status === "Selesai") prokerSelesai++;
      if (status === "Sedang Berjalan") prokerBerjalan++;
    });

    // 🔹 Hitung total laporan
    const [laporanRows] = await db.query(
      `SELECT COUNT(*) AS total FROM Laporan WHERE id_divisi = ?`,
      [idDivisi]
    );
    const totalLaporan = laporanRows[0]?.total || 0;

    res.render("hmsi/hmsiDashboard", {
      title: "Dashboard HMSI",
      user,
      activeNav: "Dashboard",
      totalProker,
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
    });

  } catch (error) {
    console.error("❌ Error getDashboardStats:", error.message);
    res.status(500).send("Terjadi kesalahan pada server. Cek log terminal.");
  }
};
