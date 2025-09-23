// controllers/DPA/profileController.js
// =====================================================
// Controller untuk Profil DPA (lihat & edit profil)
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Helper untuk flash / query param message
function readMsgs(req, key) {
  if (req && typeof req.flash === "function") {
    try {
      const arr = req.flash(key);
      if (Array.isArray(arr) && arr.length) return arr;
    } catch {}
  }
  if (req.query && req.query[key]) return [req.query[key]];
  return [];
}

// =====================================================
// 📄 GET: Halaman profil
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile FROM user WHERE id_anggota = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("dpa/profile", {
      title: "Profil DPA",
      user: rows[0],
      activeNav: "Profil",
      errorMsg: readMsgs(req, "error"),
      successMsg: readMsgs(req, "success"),
    });
  } catch (err) {
    console.error("❌ Error getProfile DPA:", err.message);
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
      "SELECT id_anggota, nama, email, divisi, role, foto_profile FROM user WHERE id_anggota = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("dpa/editProfile", {
      title: "Edit Profil DPA",
      user: rows[0],
      activeNav: "Profil",
      errorMsg: readMsgs(req, "error"),
      successMsg: readMsgs(req, "success"),
    });
  } catch (err) {
    console.error("❌ Error getEditProfile DPA:", err.message);
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

    const { id_anggota, nama, password, confirm_password } = req.body || {};

    // validasi
    if (!nama || nama.trim() === "") {
      if (req.flash) req.flash("error", "Nama wajib diisi");
      return res.redirect("/dpa/profile/edit");
    }
    if (!id_anggota || id_anggota.trim() === "") {
      if (req.flash) req.flash("error", "NIM wajib diisi");
      return res.redirect("/dpa/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    // handle foto upload
    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "uploads/profile/" + fileName;

      // hapus foto lama
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

    // validasi password
    if (password && password.trim() !== "" && password !== confirm_password) {
      if (req.flash) req.flash("error", "Password dan Konfirmasi Password tidak sama");
      return res.redirect("/dpa/profile/edit");
    }

    // build query
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

    // update session
    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile FROM user WHERE id_anggota = ?",
      [id_anggota]
    );
    if (rows.length) {
      req.session.user = rows[0];
    }

    if (req.flash) req.flash("success", "Profil berhasil diperbarui");
    res.redirect("/dpa/profile");
  } catch (err) {
    console.error("❌ Error postEditProfile DPA:", err.message);
    if (req.flash) req.flash("error", "Gagal menyimpan perubahan profil");
    res.redirect("/dpa/profile/edit");
  }
};
