// controllers/HMSI/profileController.js
// =====================================================
// Controller untuk Profil HMSI (lihat & edit profil)
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// =====================================================
// 📄 GET: Halaman profil
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile, theme FROM user WHERE id_anggota = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/profile", {
      title: "Profil Pengurus",
      user: rows[0],
      activeNav: "Profil",
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    res.status(500).send("Gagal mengambil profil");
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
      "SELECT id_anggota, nama, email, divisi, role, foto_profile, theme FROM user WHERE id_anggota = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/editProfile", {
      title: "Edit Profil",
      user: rows[0],
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    res.status(500).send("Gagal memuat halaman edit profil");
  }
};

// =====================================================
// 💾 POST: Simpan perubahan profil (pakai multer)
// =====================================================
exports.postEditProfile = async (req, res) => {
  try {
    const oldId = req.session.user?.id_anggota;
    if (!oldId) return res.redirect("/auth/login");

    const { id_anggota, nama, password, confirm_password } = req.body;

    if (!nama || nama.trim() === "") {
      req.flash("error", "Nama wajib diisi");
      return res.redirect("/hmsi/profile/edit");
    }

    if (!id_anggota || id_anggota.trim() === "") {
      req.flash("error", "NIM wajib diisi");
      return res.redirect("/hmsi/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "uploads/profile/" + fileName;

      if (req.session.user.foto_profile) {
        const oldPath = path.join("public", req.session.user.foto_profile);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch {}
        }
      }

      foto_profile = newPath;
    }

    if (password && password.trim() !== "" && password !== confirm_password) {
      req.flash("error", "Password dan Konfirmasi Password tidak sama");
      return res.redirect("/hmsi/profile/edit");
    }

    let query = "UPDATE user SET id_anggota = ?, nama = ?, foto_profile = ?";
    let values = [id_anggota, nama, foto_profile];

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashed);
    }

    query += " WHERE id_anggota = ?";
    values.push(oldId);

    await db.query(query, values);

    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile, theme FROM user WHERE id_anggota = ?",
      [id_anggota]
    );
    if (rows.length) {
      req.session.user = rows[0];
    }

    req.flash("success", "Profil berhasil diperbarui");
    res.redirect("/hmsi/profile");
  } catch (err) {
    req.flash("error", "Gagal menyimpan perubahan profil");
    res.redirect("/hmsi/profile/edit");
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

    await db.query("UPDATE user SET theme = ? WHERE id_anggota = ?", [
      newTheme,
      userId,
    ]);

    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile, theme FROM user WHERE id_anggota = ?",
      [userId]
    );
    if (rows.length) req.session.user = rows[0];

    res.redirect("/hmsi/profile");
  } catch (err) {
    req.flash("error", "Gagal mengganti mode tampilan");
    res.redirect("/hmsi/profile");
  }
};
