// controllers/Admin/dashboardController.js
const db = require("../../config/db");
const keuanganController = require("./keuanganController");

// ======================
// 📊 Dashboard Admin HMSI
// ======================
exports.getDashboard = async (req, res) => {
  try {
    // 1️⃣ Hitung jumlah user berdasarkan role
    const [userRows] = await db.query(`
      SELECT role, COUNT(*) as total
      FROM user
      GROUP BY role
    `);

    // Default 0
    let totalDPA = 0;
    let totalHMSI = 0;

    // Loop hasil query untuk ambil jumlah user per role
    userRows.forEach((row) => {
      if (row.role === "DPA") totalDPA = row.total;
      if (row.role === "HMSI") totalHMSI = row.total;
    });

    // 2️⃣ Ambil total kas dari keuanganController
    keuanganController.getTotalKas((err, totalKas) => {
      if (err) {
        console.error("❌ Error getTotalKas:", err.message);
        return res.status(500).send("Gagal mengambil data kas");
      }

      // Format kas agar siap ditampilkan di EJS (Rp dengan pemisah ribuan)
      const totalKasFormatted = totalKas.toLocaleString("id-ID");

      // 3️⃣ Render halaman dashboard admin
      res.render("admin/adminDashboard", {
        title: "Dashboard Admin",
        user: req.session.user || { nama: "Admin HMSI" }, // default jika session kosong
        activeNav: "dashboard", // agar sidebar highlight di Dashboard
        totalDPA,               // jumlah user role DPA
        totalHMSI,              // jumlah user role HMSI
        totalKas,               // nilai kas numerik (untuk chart)
        totalKasFormatted,      // nilai kas sudah diformat (untuk ditampilkan teks)
      });
    });
  } catch (err) {
    console.error("❌ Error getDashboard:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};
