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
// POST: Proses Login (diekspos untuk unit test)
// =====================================================
async function postLogin(req, res) {
  const { email, password } = req.body;
  const emailTrim = email?.trim();
  const passwordTrim = password?.trim();

  try {
    // Validasi form dasar sesuai ekspektasi UI
    if (!emailTrim) {
      if (typeof req.flash === "function") {
        req.flash("error", "Email wajib diisi");
        return res.redirect("/auth/login");
      }
      return res.render("auth/login", { errorMsg: "Email wajib diisi" });
    }

    if (!passwordTrim) {
      if (typeof req.flash === "function") {
        req.flash("error", "Password wajib diisi");
        return res.redirect("/auth/login");
      }
      return res.render("auth/login", { errorMsg: "Password wajib diisi" });
    }

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
      [emailTrim]
    );

    if (!rows.length) {
      if (typeof req.flash === "function") {
        req.flash("error", "Email atau password salah");
        return res.redirect("/auth/login");
      }
      return res.render("auth/login", { errorMsg: "Email atau password salah" });
    }

    const user = rows[0];

    // Verifikasi password
    let isMatch = false;
    if (user.password?.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(passwordTrim, user.password);
    } else {
      isMatch = passwordTrim === user.password;
    }

    if (!isMatch) {
      if (typeof req.flash === "function") {
        req.flash("error", "Email atau password salah");
        return res.redirect("/auth/login");
      }
      return res.render("auth/login", { errorMsg: "Email atau password salah" });
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
}

router.post("/login", postLogin);

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
module.exports.__testables = { postLogin };
