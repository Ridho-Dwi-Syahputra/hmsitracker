// controllers/admin/adminDashboardController.js
// =====================================================
// Controller untuk Dashboard Admin
// =====================================================

const db = require("../../config/db"); // Asumsikan koneksi database ada di sini

// =====================================================
// 📄 GET: Halaman Dashboard Admin (dengan ringkasan data)
// =====================================================
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user?.id_anggota;
        // Redirect ke login jika tidak ada user di session
        if (!userId) return res.redirect("/auth/login");

        // 1. Hitung total user
        // Query: SELECT COUNT(id_anggota) AS total_users FROM user
        const [totalUserRows] = await db.query(
            "SELECT COUNT(id_anggota) AS total_users FROM user"
        );
        const totalUsers = totalUserRows[0].total_users;

        // 2. Hitung jumlah divisi (Menggunakan tabel 'divisi' yang baru)
        // Query: SELECT COUNT(id_divisi) AS total_divisi FROM divisi
        const [totalDivisiRows] = await db.query(
            "SELECT COUNT(id_divisi) AS total_divisi FROM divisi" // ✅ Diperbaiki
        );
        const totalDivisi = totalDivisiRows[0].total_divisi;

        res.render("admin/adminDashboard", {
            title: "Dashboard Admin",
            user: req.session.user,
            activeNav: "dashboard",
            dashboardData: {
                totalUsers,
                totalDivisi,
            },
        });
    } catch (err) {
        console.error("❌ getDashboard Admin Error:", err.message);
        res.status(500).send("Gagal memuat dashboard admin");
    }
};