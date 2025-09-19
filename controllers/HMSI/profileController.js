// controllers/HMSI/profileController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Direktori simpan foto profil
const UPLOAD_DIR = path.join(__dirname, "../../public/uploads/profile");

// Pastikan folder ada
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =====================================================
// 📌 GET: Halaman profil user
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id; // simpan saat login
    if (!userId) return res.redirect("/auth/login");

    const [rows] = await db.query(
      "SELECT id_anggota, nama, email, divisi, role, foto_profile FROM user WHERE id_anggota = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("hmsi/profile", {
      title: "Profil Pengurus",
      user: rows[0],
      activeNav: "Profile",
      errorMsg: req.query.error || null,
      successMsg: req.query.success || null,
    });
  } catch (err) {
    console.error("❌ Error getProfile:", err.message);
    res.status(500).send("Gagal mengambil profil");
  }
};

// =====================================================
// 📌 POST: Update profil (nama + password opsional)
// =====================================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/auth/login");

    const { nama, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
      return res.redirect("/hmsi/profile?error=Password tidak sama");
    }

    let query = "UPDATE user SET nama = ? WHERE id_anggota = ?";
    let values = [nama, userId];

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query = "UPDATE user SET nama = ?, password = ? WHERE id_anggota = ?";
      values = [nama, hashed, userId];
    }

    await db.query(query, values);

    // Update juga session
    req.session.user.name = nama;

    res.redirect("/hmsi/profile?success=Profil berhasil diperbarui");
  } catch (err) {
    console.error("❌ Error updateProfile:", err.message);
    res.status(500).send("Gagal update profil");
  }
};

// =====================================================
// 📌 POST: Upload foto profil
// =====================================================
exports.uploadFoto = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/auth/login");

    if (!req.file) {
      return res.redirect("/hmsi/profile?error=File tidak ditemukan");
    }

    // Nama file unik
    const filename = uuidv4() + path.extname(req.file.originalname);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Pindahkan file dari tmp ke folder upload
    fs.renameSync(req.file.path, filepath);

    // Simpan ke database
    await db.query("UPDATE user SET foto_profile = ? WHERE id_anggota = ?", [
      "profile/" + filename,
      userId,
    ]);

    // Update session
    req.session.user.foto_profile = "profile/" + filename;

    res.redirect("/hmsi/profile?success=Foto profil berhasil diperbarui");
  } catch (err) {
    console.error("❌ Error uploadFoto:", err.message);
    res.status(500).send("Gagal upload foto profil");
  }
};
