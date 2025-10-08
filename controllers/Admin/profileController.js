// controllers/admin/profileController.js
// =====================================================
// Controller untuk Profil Admin (lihat & edit profil)
// (Admin = Presidium Inti, role = 'Admin')
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// =====================================================
// 📄 GET: Halaman profil admin
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, role, foto_profile, theme
       FROM user
       WHERE id_anggota = ? AND role = 'Admin'`,
      [userId]
    );

    if (!rows.length) return res.status(404).send("Admin tidak ditemukan");

    // ✅ update session agar konsisten
    req.session.user = rows[0];

    res.render("admin/profile", {
      title: "Profil Admin",
      user: req.session.user,
      activeNav: "profile",
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    console.error("❌ getProfile Admin Error:", err.message);
    res.status(500).send("Gagal mengambil profil admin");
  }
};

// =====================================================
// 📄 GET: Halaman form edit profil
// =====================================================
exports.getEditProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, role, foto_profile, theme
       FROM user
       WHERE id_anggota = ? AND role = 'Admin'`,
      [userId]
    );

    if (!rows.length) return res.status(404).send("Admin tidak ditemukan");

    // ✅ update session
    req.session.user = rows[0];

    res.render("admin/editProfile", {
      title: "Edit Profil Admin",
      user: req.session.user,
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    console.error("❌ getEditProfile Admin Error:", err.message);
    res.status(500).send("Gagal memuat halaman edit profil admin");
  }
};

// =====================================================
// 💾 POST: Simpan perubahan profil
// =====================================================
exports.postEditProfile = async (req, res) => {
  try {
    const oldId = req.session.user?.id_anggota;
    if (!oldId) return res.redirect("/auth/login");

    const { id_anggota, nama, email, password, confirm_password } = req.body;

    if (!nama || nama.trim() === "") {
      req.flash("error", "Nama wajib diisi");
      return res.redirect("/admin/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    // ✅ Handle upload foto profil
    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "uploads/profile/" + fileName;

      if (req.session.user.foto_profile) {
        const oldPath = path.join("public", req.session.user.foto_profile);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }

      foto_profile = newPath;
    }

    // ✅ Validasi password
    if (password && password.trim() !== "" && password !== confirm_password) {
      req.flash("error", "Password dan Konfirmasi Password tidak sama");
      return res.redirect("/admin/profile/edit");
    }

    // ✅ Update profil (termasuk ganti NIM/id_anggota)
    let query = "UPDATE user SET id_anggota = ?, nama = ?, email = ?, foto_profile = ?";
    let values = [id_anggota, nama, email, foto_profile];

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashed);
    }

    query += " WHERE id_anggota = ? AND role = 'Admin'";
    values.push(oldId);

    await db.query(query, values);

    // ✅ Ambil data terbaru untuk session
    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, role, foto_profile, theme
       FROM user
       WHERE id_anggota = ? AND role = 'Admin'`,
      [id_anggota]
    );
    if (rows.length) {
      req.session.user = rows[0];
    }

    req.flash("success", "Profil admin berhasil diperbarui");
    res.redirect("/admin/profile");
  } catch (err) {
    console.error("❌ postEditProfile Admin Error:", err.message);
    req.flash("error", "Gagal menyimpan perubahan profil admin");
    res.redirect("/admin/profile/edit");
  }
};

// =====================================================
// 🌙 Toggle Theme (Light/Dark)
// =====================================================
exports.toggleTheme = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const currentTheme = req.session.user.theme || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    await db.query(
      "UPDATE user SET theme = ? WHERE id_anggota = ? AND role = 'Admin'",
      [newTheme, userId]
    );

    const [rows] = await db.query(
      `SELECT id_anggota, nama, email, role, foto_profile, theme
       FROM user
       WHERE id_anggota = ? AND role = 'Admin'`,
      [userId]
    );
    if (rows.length) req.session.user = rows[0];

    res.redirect("/admin/profile");
  } catch (err) {
    console.error("❌ toggleTheme Admin Error:", err.message);
    req.flash("error", "Gagal mengganti mode tampilan admin");
    res.redirect("/admin/profile");
  }
};
