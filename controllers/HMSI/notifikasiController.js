// controllers/HMSI/notifikasiController.js
const db = require("../../config/db");

exports.getAllNotifikasi = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).send("Unauthorized");

    // ambil notifikasi sesuai divisi user HMSI
    const [rows] = await db.query(
      `SELECT n.*, l.judul_laporan, p.Nama_ProgramKerja, p.Divisi
       FROM Notifikasi n
       LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
       LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
       WHERE p.Divisi = ? 
       ORDER BY n.id_notifikasi DESC`,
      [user.divisi]   // asumsinya user HMSI punya field `divisi` di session
    );

    res.render("hmsi/hmsiNotifikasi", {
      title: "Notifikasi",
      user,
      activeNav: "Notifikasi",
      notifikasi: rows,
    });
  } catch (err) {
    console.error("❌ Error getAllNotifikasi:", err.message);
    res.status(500).send("Gagal mengambil notifikasi");
  }
};
