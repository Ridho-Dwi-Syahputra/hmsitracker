// =====================================================
// middlewares/unreadNotif.js
// Middleware global untuk menghitung notifikasi HMSI
// =====================================================

const db = require("../config/db");

async function unreadNotif(req, res, next) {
  try {
    res.locals.unreadCount = 0; // default

    // Jalankan hanya untuk user HMSI yang login
    if (req.session.user && req.session.user.role === "HMSI") {
      const idDivisi = req.session.user.id_divisi || null;

      if (idDivisi) {
        const [rows] = await db.query(
          `SELECT COUNT(*) AS unreadCount
           FROM Notifikasi n
           WHERE n.role = 'HMSI'
             AND n.status_baca = 0
             AND n.id_divisi = ?`,
          [idDivisi]
        );

        res.locals.unreadCount = rows[0]?.unreadCount || 0;
      } else {
        console.warn("⚠️ HMSI user tidak memiliki id_divisi di session");
      }
    }
  } catch (err) {
    console.error("❌ Middleware unreadNotif error:", err.message);
    res.locals.unreadCount = 0;
  }

  next();
}

module.exports = unreadNotif;
