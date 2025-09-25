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

exports.getDashboardStats = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.divisi) {
      console.error("Dashboard Gagal: Session user/divisi tidak ditemukan.");
      return res.redirect("/auth/login?error=Sesi Anda tidak valid.");
    }

    const userDivisi = req.session.user.divisi;

    // 🔹 Ambil semua proker milik divisi user
    const [rows] = await db.query(
      `SELECT 
        pk.id_ProgramKerja AS id,
        pk.Nama_ProgramKerja AS namaProker,
        pk.Tanggal_mulai AS tanggal_mulai,
        pk.Tanggal_selesai AS tanggal_selesai,
        pk.Status AS status_db
       FROM Program_kerja pk
       JOIN User u ON pk.id_anggota = u.id_anggota
       WHERE u.divisi = ?`,
      [userDivisi]
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
      `SELECT COUNT(*) AS total FROM Laporan WHERE divisi = ?`,
      [userDivisi]
    );
    const totalLaporan = laporanRows[0]?.total || 0;

    res.render("hmsi/hmsiDashboard", {
      title: "Dashboard HMSI",
      user: req.session.user,
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
