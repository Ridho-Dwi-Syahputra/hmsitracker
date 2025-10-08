// controllers/HMSI/profileController.js
// =====================================================
// Controller untuk Profil HMSI (lihat & edit profil)
// =====================================================

const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const multer = require("multer");

// =====================================================
// 🧩 Konfigurasi Multer untuk Upload Foto Profil
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/profile"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

// =====================================================
// 📄 GET: Halaman profil
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id_anggota;
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      `SELECT u.id_anggota, u.nama, u.email, u.role, u.foto_profile, u.theme,
              u.id_divisi, d.nama_divisi
       FROM user u
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.id_anggota = ?`,
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
    console.error("❌ Error getProfile:", err.message);
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

    // Ambil data user + daftar divisi untuk dropdown
    const [userRows] = await db.query(
      `SELECT u.id_anggota, u.nama, u.email, u.role, u.foto_profile, u.theme,
              u.id_divisi, d.nama_divisi
       FROM user u
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.id_anggota = ?`,
      [userId]
    );

    const [divisiRows] = await db.query(
      "SELECT * FROM divisi ORDER BY nama_divisi ASC"
    );

    if (!userRows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/editProfile", {
      title: "Edit Profil",
      user: userRows[0],
      divisiList: divisiRows,
      errorMsg: req.flash("error"),
      successMsg: req.flash("success"),
    });
  } catch (err) {
    console.error("❌ Error getEditProfile:", err.message);
    res.status(500).send("Gagal memuat halaman edit profil");
  }
};

// =====================================================
// 💾 POST: Simpan perubahan profil
// =====================================================
exports.postEditProfile = async (req, res) => {
  try {
    const oldId = req.session.user?.id_anggota;
    if (!oldId) return res.redirect("/auth/login");

    const { id_anggota, nama, password, confirm_password, id_divisi } = req.body;

    if (!nama || nama.trim() === "") {
      req.flash("error", "Nama wajib diisi");
      return res.redirect("/hmsi/profile/edit");
    }
    if (!id_anggota || id_anggota.trim() === "") {
      req.flash("error", "NIM wajib diisi");
      return res.redirect("/hmsi/profile/edit");
    }
    if (!id_divisi || id_divisi.trim() === "") {
      req.flash("error", "Divisi wajib dipilih");
      return res.redirect("/hmsi/profile/edit");
    }

    let foto_profile = req.session.user.foto_profile;

    // ✅ Jika ada file baru
    if (req.file) {
      const fileName = req.file.filename;
      const newPath = "profile/" + fileName;

      if (req.session.user.foto_profile) {
        const oldPath = path.join(
          __dirname,
          "../../public/uploads",
          req.session.user.foto_profile
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      foto_profile = newPath;
    }

    if (password && password.trim() !== "" && password !== confirm_password) {
      req.flash("error", "Password dan Konfirmasi Password tidak sama");
      return res.redirect("/hmsi/profile/edit");
    }

    // Update data
    let query =
      "UPDATE user SET id_anggota = ?, nama = ?, id_divisi = ?, foto_profile = ?";
    const values = [id_anggota, nama, id_divisi, foto_profile];

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashed);
    }

    query += " WHERE id_anggota = ?";
    values.push(oldId);

    await db.query(query, values);

    // Refresh session
    const [rows] = await db.query(
      `SELECT u.id_anggota, u.nama, u.email, u.role, u.foto_profile, u.theme,
              u.id_divisi, d.nama_divisi
       FROM user u
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.id_anggota = ?`,
      [id_anggota]
    );

    if (rows.length) {
      req.session.user = {
        ...req.session.user,
        ...rows[0],
        divisi: rows[0].nama_divisi,
        id_divisi: rows[0].id_divisi,
      };
    }

    req.flash("success", "Profil berhasil diperbarui");
    res.redirect("/hmsi/profile");
  } catch (err) {
    console.error("❌ Error postEditProfile:", err.message);
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
      `SELECT u.id_anggota, u.nama, u.email, u.role, u.foto_profile, u.theme,
              u.id_divisi, d.nama_divisi
       FROM user u
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
       WHERE u.id_anggota = ?`,
      [userId]
    );

    if (rows.length)
      req.session.user = {
        ...req.session.user,
        ...rows[0],
        divisi: rows[0].nama_divisi,
      };

    res.redirect("/hmsi/profile");
  } catch (err) {
    console.error("❌ Error toggleTheme:", err.message);
    req.flash("error", "Gagal mengganti mode tampilan");
    res.redirect("/hmsi/profile");
  }
};
