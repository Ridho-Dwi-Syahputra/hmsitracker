// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==============================
// Form login
// ==============================
router.get("/login", (req, res) => {
  res.render("auth/login", { errorMsg: null });
});

// ==============================
// Proses login
// ==============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ambil user dari tabel user langsung
    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, password, role, divisi
       FROM user
       WHERE email = ? AND password = ?
       LIMIT 1`,
      [email, password]
    );

    if (!rows.length) {
      return res.render("auth/login", { errorMsg: "Email atau password salah!" });
    }

    const user = rows[0];

    // simpan ke session
    req.session.user = {
      id: user.id_anggota,
      name: user.nama,
      role: user.role,
      divisi: user.divisi || null, // khusus HMSI
    };

    // redirect sesuai role
    if (user.role === "Admin") return res.redirect("/admin/dashboard");
    if (user.role === "DPA") return res.redirect("/dpa/dashboard");
    if (user.role === "HMSI") return res.redirect("/hmsi/dashboard");

    return res.redirect("/");
  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.render("auth/login", { errorMsg: "Terjadi kesalahan server" });
  }
});

// ==============================
// Logout
// ==============================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
