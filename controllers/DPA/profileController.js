// controllers/DPA/profileController.js
// =====================================================
// Controller untuk Profil DPA (lihat & edit profil)
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// =====================================================
// Helper: Ambil pesan dari flash atau query param
// =====================================================
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

    const [rows] = await db.query(`
      SELECT 
        u.id_anggota, 
        u.nama, 
        u.email, 
        COALESCE(d.nama_divisi, u.id_divisi) AS divisi, 
        u.role, 
        u.foto_profile
      FROM user u
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
    `, [userId]);

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

    const [rows] = await db.query(`
      SELECT 
        u.id_anggota, 
        u.nama, 
        u.email, 
        COALESCE(d.nama_divisi, u.id_divisi) AS divisi, 
        u.role, 
        u.foto_profile
      FROM user u
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
    `, [userId]);

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

    // 🔸 Validasi wajib
    if (!nama || nama.trim() === "") {
      if (req.flash) req.flash("error", "Nama wajib diisi");
      return res.redirect("/dpa/profile/edit");
    }
    if (!id_anggota || id_anggota.trim() === "") {
      if (req.flash) req.flash("error", "NIM wajib diisi");
      return res.redirect("/dpa/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    // 🔸 Handle upload foto baru
    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "uploads/profile/" + fileName;

      // Hapus foto lama jika ada
      if (req.session.user.foto_profile) {
        const oldPath = path.join("public", req.session.user.foto_profile);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.warn("⚠️ Gagal hapus foto lama:", err.message);
          }
        }
      }

      foto_profile = newPath;
    }

    // 🔸 Validasi password baru
    if (password && password.trim() !== "" && password !== confirm_password) {
      if (req.flash) req.flash("error", "Password dan Konfirmasi Password tidak sama");
      return res.redirect("/dpa/profile/edit");
    }

    // 🔸 Bangun query update
    let query = "UPDATE user SET id_anggota = ?, nama = ?, foto_profile = ?";
    const values = [id_anggota, nama, foto_profile];

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashed);
    }

    query += " WHERE id_anggota = ?";
    values.push(oldId);

    await db.query(query, values);

    // 🔸 Ambil ulang user terbaru untuk refresh session
    const [rows] = await db.query(`
      SELECT 
        u.id_anggota, 
        u.nama, 
        u.email, 
        COALESCE(d.nama_divisi, u.id_divisi) AS divisi, 
        u.role, 
        u.foto_profile
      FROM user u
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
    `, [id_anggota]);

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
