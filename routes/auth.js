// =====================================================
// routes/auth.js
// Modul autentikasi (Login & Logout)
// =====================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// =====================================================
// GET: Form Login
// =====================================================
router.get("/login", (req, res) => {
  // Jika sudah login, redirect sesuai role
  if (req.session.user) {
    const { role } = req.session.user;
    if (role === "Admin") return res.redirect("/admin/dashboard");
    if (role === "DPA") return res.redirect("/dpa/dashboard");
    if (role === "HMSI") return res.redirect("/hmsi/dashboard");
  }

  res.render("auth/login", { errorMsg: null });
});

// =====================================================
// POST: Proses Login
// =====================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔹 Cari user + JOIN tabel divisi
    const [rows] = await db.query(
      `SELECT 
          u.id_anggota, u.nama, u.email, u.password, u.role, 
          u.id_divisi, u.foto_profile, d.nama_divisi
       FROM user u
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.render("auth/login", { errorMsg: "Email atau password salah!" });
    }

    const user = rows[0];

    // =====================================================
    // 🔐 Cek password (bcrypt / fallback plain)
    // =====================================================
    let isMatch = false;
    if (user.password && user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password; // fallback (lama)
    }

    if (!isMatch) {
      return res.render("auth/login", { errorMsg: "Email atau password salah!" });
    }

    // =====================================================
    // 🧠 Simpan user ke session
    // =====================================================
    req.session.user = {
      id: user.id_anggota, // kompatibilitas lama
      id_anggota: user.id_anggota,
      nama: user.nama,
      email: user.email,
      role: user.role,
      id_divisi: user.id_divisi || null,
      nama_divisi: user.nama_divisi || null,
      foto_profile: user.foto_profile || null,
    };

    // =====================================================
    // 🚦 Redirect sesuai role
    // =====================================================
    if (user.role === "Admin") return res.redirect("/admin/dashboard");
    if (user.role === "DPA") return res.redirect("/dpa/dashboard");
    if (user.role === "HMSI") return res.redirect("/hmsi/dashboard");

    return res.redirect("/");
  } catch (err) {
    console.error("❌ [auth.js] Error saat login:", err.message);
    res.render("auth/login", { errorMsg: "Terjadi kesalahan server. Coba lagi nanti." });
  }
});

// =====================================================
// GET: Logout
// =====================================================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
