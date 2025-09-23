// File: controllers/HMSI/dashboardController.js (Versi Final & Bersih)

const db = require("../../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Safety Check: Pastikan session dan divisi ada sebelum melakukan apa pun.
    if (!req.session.user || !req.session.user.divisi) {
      console.error("Dashboard Gagal: Session user atau divisi tidak ditemukan.");
      return res.redirect("/auth/login?error=Sesi Anda tidak valid.");
    }

    const userDivisi = req.session.user.divisi;

    // 2. Menjalankan semua 4 query secara bersamaan.
    const [
      totalProkerResult,
      prokerSelesaiResult,
      prokerBerjalanResult,
      totalLaporanResult,
    ] = await Promise.all([
      // Query untuk Total Proker
      db.query(
        `SELECT COUNT(*) AS total FROM Program_kerja pk JOIN User u ON pk.id_anggota = u.id_anggota WHERE u.divisi = ?`,
        [userDivisi]
      ),
      // Query untuk Proker Selesai
      db.query(
        `SELECT COUNT(*) AS total FROM Program_kerja pk JOIN User u ON pk.id_anggota = u.id_anggota WHERE u.divisi = ? AND pk.Tanggal_selesai < CURDATE()`,
        [userDivisi]
      ),
      // Query untuk Proker Berjalan
      db.query(
        `SELECT COUNT(*) AS total FROM Program_kerja pk JOIN User u ON pk.id_anggota = u.id_anggota WHERE u.divisi = ? AND CURDATE() BETWEEN pk.Tanggal_mulai AND pk.Tanggal_selesai`,
        [userDivisi]
      ),
      // Query untuk Total Laporan
      db.query(
        `SELECT COUNT(*) AS total FROM Laporan WHERE divisi = ?`,
        [userDivisi]
      ),
    ]);

    // 3. Mengekstrak angka dari hasil query.
    // Hasil query dari mysql2/promise adalah array [rows, fields].
    // `rows` berisi objek hasil, jadi kita ambil `rows[0]` lalu properti `.total`-nya.
    const totalProker = totalProkerResult[0][0].total;
    const prokerSelesai = prokerSelesaiResult[0][0].total;
    const prokerBerjalan = prokerBerjalanResult[0][0].total;
    const totalLaporan = totalLaporanResult[0][0].total;

    // 4. Merender halaman dengan data yang sudah final.
    res.render("hmsi/hmsiDashboard", {
      title: "Dashboard HMSI",
      user: req.session.user,
      activeNav: "Dashboard",
      totalProker, // Kirim angka langsung
      prokerSelesai,
      prokerBerjalan,
      totalLaporan,
    });

  } catch (error) {
    console.error("❌ Error fatal saat mengambil statistik dasbor:", error.message);
    res.status(500).send("Terjadi kesalahan pada server. Cek log terminal.");
  }
};