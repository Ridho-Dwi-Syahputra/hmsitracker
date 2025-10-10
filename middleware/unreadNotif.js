// =====================================================
// middlewares/unreadNotif.js
// Middleware global untuk menghitung notifikasi belum dibaca
// =====================================================

const db = require("../config/db");

async function unreadNotif(req, res, next) {
  try {
    res.locals.unreadCount = 0;
    const user = req.session.user;
    if (!user) return next(); // Belum login

    const { role, id_divisi } = user;

    // =====================================================
    // 🔹 HMSI → hitung notifikasi untuk divisi HMSI terkait
    // =====================================================
    if (role === "HMSI") {
      if (!id_divisi) {
        console.warn(
          "⚠️ HMSI user tidak memiliki id_divisi di session (abaikan unread count)"
        );
        return next();
      }

      const [rows] = await db.query(
        `
        SELECT COUNT(*) AS unreadCount
        FROM Notifikasi n
        LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
        WHERE n.target_role = 'HMSI'
          AND n.status_baca = 0
          AND (
            n.id_divisi = ? OR l.id_divisi = ?
          )
        `,
        [id_divisi, id_divisi]
      );

      res.locals.unreadCount = rows[0]?.unreadCount || 0;
      return next();
    }

    // =====================================================
    // 🔹 DPA → hitung notifikasi dari HMSI (target_role = 'DPA')
    // =====================================================
    if (role === "DPA") {
      const [rows] = await db.query(
        `
        SELECT COUNT(*) AS unreadCount
        FROM Notifikasi n
        WHERE (n.role = 'HMSI' OR n.role IS NULL)
          AND n.target_role = 'DPA'
          AND n.status_baca = 0
        `
      );

      res.locals.unreadCount = rows[0]?.unreadCount || 0;
      return next();
    }

    // =====================================================
    // 🔹 Admin → hitung semua notifikasi belum dibaca
    // =====================================================
    if (role === "Admin") {
      const [rows] = await db.query(`
        SELECT COUNT(*) AS unreadCount
        FROM Notifikasi
        WHERE status_baca = 0
      `);

      res.locals.unreadCount = rows[0]?.unreadCount || 0;
      return next();
    }

    // =====================================================
    // 🔹 Role lain → biarkan default 0
    // =====================================================
    next();
  } catch (err) {
    console.error("❌ Middleware unreadNotif error:", err.message);
    res.locals.unreadCount = 0;
    next();
  }
}

module.exports = unreadNotif;
