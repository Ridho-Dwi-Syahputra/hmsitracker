// =====================================================
// controllers/Admin/userController.js
// CRUD User untuk Admin HMSI
// =====================================================

const db = require("../../config/db");
const bcrypt = require("bcryptjs");

// Divisi valid untuk HMSI
const VALID_DIVISI = [
  "Internal",
  "Medkraf",
  "Eksternal",
  "Bikraf",
  "PSI",
  "PSDM",
  "RTK",
];

// =====================================================
// 📄 List user
// =====================================================
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM user ORDER BY updated_at DESC");

    res.render("admin/kelolaUser", {
      title: "Kelola User",
      user: req.session.user,
      activeNav: "users",
      users: rows,
    });
  } catch (err) {
    console.error("❌ Error getAllUsers:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// =====================================================
// ➕ Form tambah user
// =====================================================
exports.getTambahUser = (req, res) => {
  res.render("admin/tambahUser", {
    title: "Tambah User",
    user: req.session.user,
    activeNav: "users",
    old: {},
    errorMsg: null,
    successMsg: null,
    validDivisi: VALID_DIVISI,
  });
};

// =====================================================
// ➕ Proses tambah user
// =====================================================
exports.postTambahUser = async (req, res) => {
  try {
    const { id_anggota, nama, email, password, role, divisi } = req.body;

    if (!id_anggota || !nama || !email || !password || !role) {
      return res.render("admin/tambahUser", {
        title: "Tambah User",
        user: req.session.user,
        activeNav: "users",
        old: req.body,
        errorMsg: "Semua field wajib diisi!",
        successMsg: null,
        validDivisi: VALID_DIVISI,
      });
    }

    // Validasi divisi kalau role = HMSI
    let divisiValue = null;
    if (role === "HMSI") {
      if (!divisi || !VALID_DIVISI.includes(divisi)) {
        return res.render("admin/tambahUser", {
          title: "Tambah User",
          user: req.session.user,
          activeNav: "users",
          old: req.body,
          errorMsg: "Divisi tidak valid untuk role HMSI!",
          successMsg: null,
          validDivisi: VALID_DIVISI,
        });
      }
      divisiValue = divisi;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO user (id_anggota, nama, email, password, role, divisi)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_anggota, nama, email, hashedPassword, role, divisiValue]
    );

    res.redirect("/admin/kelola-user");
  } catch (err) {
    console.error("❌ Error postTambahUser:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// =====================================================
// ✏️ Form edit user
// =====================================================
exports.getEditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM user WHERE id_anggota = ?", [id]);

    if (!rows.length) return res.status(404).send("User tidak ditemukan");

    res.render("admin/editUser", {
      title: "Edit User",
      user: req.session.user,
      activeNav: "users",
      userData: rows[0],
      errorMsg: null,
      successMsg: null,
      validDivisi: VALID_DIVISI,
    });
  } catch (err) {
    console.error("❌ Error getEditUser:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// =====================================================
// ✏️ Proses update user
// =====================================================
exports.postEditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, role, divisi } = req.body;

    // Divisi hanya untuk HMSI
    let divisiValue = null;
    if (role === "HMSI") {
      if (divisi && VALID_DIVISI.includes(divisi)) {
        divisiValue = divisi;
      }
    }

    let query, params;
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE user 
               SET nama=?, email=?, password=?, role=?, divisi=? 
               WHERE id_anggota=?`;
      params = [nama, email, hashedPassword, role, divisiValue, id];
    } else {
      query = `UPDATE user 
               SET nama=?, email=?, role=?, divisi=? 
               WHERE id_anggota=?`;
      params = [nama, email, role, divisiValue, id];
    }

    await db.query(query, params);
    res.redirect("/admin/kelola-user");
  } catch (err) {
    console.error("❌ Error postEditUser:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// =====================================================
// 🗑️ Hapus user
// =====================================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM user WHERE id_anggota = ?", [id]);
    res.redirect("/admin/kelola-user");
  } catch (err) {
    console.error("❌ Error deleteUser:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};
