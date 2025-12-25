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
  if (req.session.user) {
    const { role } = req.session.user;
    if (role === "Admin") return res.redirect("/admin/dashboard");
    if (role === "DPA") return res.redirect("/dpa/dashboard");
    if (role === "HMSI") return res.redirect("/hmsi/dashboard");
  }

  res.render("auth/login"); // errorMsg diambil dari res.locals.errorMsg
});

// =====================================================
// POST: Proses Login
// =====================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.id_anggota,
        u.nama,
        u.email,
        u.password,
        u.role,
        u.id_divisi,
        u.foto_profile,
        d.nama_divisi
      FROM user u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!rows.length) {
      req.flash("error", "Email atau password salah!");
      return res.redirect("/auth/login");
    }

    const user = rows[0];

    // Verifikasi password
    let isMatch = false;
    if (user.password?.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      req.flash("error", "Email atau password salah!");
      return res.redirect("/auth/login");
    }

    // Simpan session
    req.session.user = {
      id_anggota: user.id_anggota,
      nama: user.nama,
      email: user.email,
      role: user.role,
      id_divisi: user.id_divisi || null,
      nama_divisi: user.nama_divisi || (user.role === "HMSI" ? "Tidak Ada Divisi" : null),
      foto_profile: user.foto_profile || null,
    };

    // =====================================================
    // ⚙️ Validasi HMSI tanpa divisi (untuk debugging)
    // =====================================================
    if (user.role === "HMSI" && !user.id_divisi) {
      console.warn(
        `⚠️ HMSI "${user.nama}" login tanpa id_divisi! Beberapa fitur mungkin tidak berfungsi.`
      );
    }

    console.log(
      `✅ Login sukses: ${user.nama} (${user.role}${
        user.nama_divisi ? " - " + user.nama_divisi : ""
      })`
    );

    // =====================================================
    // 🚦 Redirect berdasarkan role
    // =====================================================
    switch (user.role) {
      case "Admin":
        return res.redirect("/admin/dashboard");
      case "DPA":
        return res.redirect("/dpa/dashboard");
      case "HMSI":
        return res.redirect("/hmsi/dashboard");
      default:
        return res.redirect("/");
    }
  } catch (err) {
    console.error("❌ [auth.js] Error saat login:", err.message);
    res.render("auth/login", {
      errorMsg: "Terjadi kesalahan server. Silakan coba lagi nanti.",
    });
  }
});

// =====================================================
// GET: Logout
// =====================================================
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(" Error saat destroy session:", err.message);
    res.redirect("/auth/login");
  });
});

module.exports = router;
