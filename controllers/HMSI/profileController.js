// =====================================================
// controllers/HMSI/profileController.js
// Controller untuk Profil HMSI (lihat & edit profil)
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// =====================================================
// Helper: baca pesan flash
// =====================================================
function readMsgs(req, key) {
  if (req && typeof req.flash === "function") {
    const arr = req.flash(key);
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return [];
}

// =====================================================
// 📄 GET: Halaman profil HMSI
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      `
      SELECT 
        u.id_anggota,
        u.nama,
        u.email,
        u.role,
        u.foto_profile,
        d.id_divisi,
        d.nama_divisi
      FROM user u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
      `,
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/profile", {
      title: "Profil HMSI",
      user: rows[0],
      activeNav: "Profil",
      errorMsg: readMsgs(req, "error"),
      successMsg: readMsgs(req, "success"),
    });
  } catch (err) {
    console.error("❌ Error getProfile HMSI:", err.message);
    res.status(500).send("Gagal mengambil profil");
  }
};

// =====================================================
// 📄 GET: Halaman edit profil HMSI
// =====================================================
exports.getEditProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      `
      SELECT 
        u.id_anggota,
        u.nama,
        u.email,
        u.role,
        u.foto_profile,
        d.id_divisi,
        d.nama_divisi
      FROM user u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
      `,
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/editProfile", {
      title: "Edit Profil HMSI",
      user: rows[0],
      activeNav: "Profil",
      errorMsg: readMsgs(req, "error"),
      successMsg: readMsgs(req, "success"),
    });
  } catch (err) {
    console.error("❌ Error getEditProfile HMSI:", err.message);
    res.status(500).send("Gagal memuat halaman edit profil");
  }
};

// =====================================================
// 💾 POST: Simpan perubahan profil HMSI
// =====================================================
exports.postEditProfile = async (req, res) => {
  try {
    const oldId = req.session.user?.id_anggota;
    if (!oldId) return res.redirect("/auth/login");

    const { id_anggota, nama, password, confirm_password } = req.body || {};

    if (!nama || !id_anggota) {
      if (req.flash) req.flash("error", "NIM dan Nama wajib diisi");
      return res.redirect("/hmsi/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    // 🔸 Upload foto baru (hapus foto lama)
    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "uploads/profile/" + fileName;

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

    if (password && password.trim() !== "" && password !== confirm_password) {
      if (req.flash) req.flash("error", "Password dan konfirmasi tidak sama");
      return res.redirect("/hmsi/profile/edit");
    }

    // 🔹 Siapkan query update
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

    // 🔹 Refresh session user (ambil ulang dari DB)
    const [rows] = await db.query(
      `
      SELECT 
        u.id_anggota,
        u.nama,
        u.email,
        u.role,
        u.id_divisi,
        u.foto_profile,
        d.nama_divisi
      FROM user u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_anggota = ?
      `,
      [id_anggota]
    );

    if (rows.length) {
      req.session.user = {
        ...rows[0],
        nama_divisi: rows[0].nama_divisi || "Tanpa Divisi",
      };
    }

    if (req.flash) req.flash("success", "Profil berhasil diperbarui");
    res.redirect("/hmsi/profile");
  } catch (err) {
    console.error("❌ Error postEditProfile HMSI:", err.message);
    if (req.flash) req.flash("error", "Gagal menyimpan perubahan profil");
    res.redirect("/hmsi/profile/edit");
  }
};
