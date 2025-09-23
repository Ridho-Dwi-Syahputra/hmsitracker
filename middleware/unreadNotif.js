// =====================================================
// middlewares/unreadNotif.js
// Middleware global untuk menghitung notifikasi HMSI
// =====================================================

const db = require("../config/db");

async function unreadNotif(req, res, next) {
  try {
    // default selalu 0
    res.locals.unreadCount = 0;

    // hanya kalau ada user HMSI yang login
    if (req.session.user && req.session.user.role === "HMSI") {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS unreadCount 
         FROM Notifikasi 
         WHERE role = 'HMSI' 
           AND status_baca = 0 
           AND divisi = ?`,
        [req.session.user.divisi]
      );

      res.locals.unreadCount = rows[0]?.unreadCount || 0;
    }
  } catch (err) {
    console.error("❌ Middleware unreadNotif error:", err.message);
    res.locals.unreadCount = 0; // fallback
  }
  next();
}

module.exports = unreadNotif;
