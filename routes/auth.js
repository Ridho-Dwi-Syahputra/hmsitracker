// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==============================
// GET: Form login
// ==============================
router.get("/login", (req, res) => {
  // Kalau sudah login, langsung redirect ke dashboard sesuai role
  if (req.session.user) {
    if (req.session.user.role === "Admin") return res.redirect("/admin/dashboard");
    if (req.session.user.role === "DPA") return res.redirect("/dpa/dashboard");
    if (req.session.user.role === "HMSI") return res.redirect("/hmsi/dashboard");
  }

  res.render("auth/login", { errorMsg: null });
});

// ==============================
// POST: Proses login
// ==============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, password, role, divisi, foto_profile
       FROM user
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.render("auth/login", { errorMsg: "Email atau password salah!" });
    }

    const user = rows[0];

    // ==============================
    // 🔐 Cek password (bcrypt / plain)
    // ==============================
    let isMatch = false;
    if (user.password && user.password.startsWith("$2b$")) {
      // password tersimpan dengan bcrypt
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // fallback untuk password lama (plain text)
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.render("auth/login", { errorMsg: "Email atau password salah!" });
    }

    // ==============================
    // 🔑 Simpan ke session
    // ==============================
    req.session.user = {
      // field lama (biar controller lama tetap jalan)
      id: user.id_anggota,
      name: user.nama,
      role: user.role,
      divisi: user.divisi || null,

      // field tambahan (konsistensi dengan profileController & sidebar)
      id_anggota: user.id_anggota,
      nama: user.nama,
      email: user.email,
      foto_profile: user.foto_profile || null,
    };

    // ==============================
    // 🚦 Redirect sesuai role
    // ==============================
    if (user.role === "Admin") return res.redirect("/admin/dashboard");
    if (user.role === "DPA") return res.redirect("/dpa/dashboard");
    if (user.role === "HMSI") return res.redirect("/hmsi/dashboard");

    // fallback
    return res.redirect("/");
  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.render("auth/login", { errorMsg: "Terjadi kesalahan server" });
  }
});

// ==============================
// GET: Logout
// ==============================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
