// =====================================================
// controllers/Admin/userController.js
// CRUD User untuk Admin HMSI (versi relasional divisi)
// =====================================================

const db = require("../../config/db");
const bcrypt = require("bcryptjs");

// =====================================================
// 📄 List user
// =====================================================
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, d.nama_divisi
      FROM user u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      ORDER BY u.updated_at DESC
    `);

    const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");

    res.render("admin/kelolaUser", {
      title: "Kelola User",
      user: req.session.user,
      activeNav: "users",
      users: rows,
      divisiList,
      errorMsg: null,
      successMsg: null
    });
  } catch (err) {
    console.error("❌ Error getAllUsers:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};


// =====================================================
// ➕ Form tambah user
// =====================================================
exports.getTambahUser = async (req, res) => {
  try {
    const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");

    res.render("admin/tambahUser", {
      title: "Tambah User",
      user: req.session.user,
      activeNav: "users",
      old: {},
      errorMsg: null,
      successMsg: null,
      divisiList,
    });
  } catch (err) {
    console.error("❌ Error getTambahUser:", err.message);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// =====================================================
// ➕ Proses tambah user
// =====================================================
exports.postTambahUser = async (req, res) => {
  try {
    const { id_anggota, nama, email, password, role, id_divisi } = req.body;

    if (!id_anggota || !nama || !email || !password || !role) {
      const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");
      return res.render("admin/tambahUser", {
        title: "Tambah User",
        user: req.session.user,
        activeNav: "users",
        old: req.body,
        errorMsg: "Semua field wajib diisi!",
        successMsg: null,
        divisiList,
      });
    }

    // Divisi hanya untuk role HMSI
    let divisiValue = null;
    if (role === "HMSI") {
      if (!id_divisi) {
        const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");
        return res.render("admin/tambahUser", {
          title: "Tambah User",
          user: req.session.user,
          activeNav: "users",
          old: req.body,
          errorMsg: "Pilih divisi untuk role HMSI!",
          successMsg: null,
          divisiList,
        });
      }
      divisiValue = id_divisi;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO user (id_anggota, nama, email, password, role, id_divisi)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_anggota, nama, email, hashedPassword, role, divisiValue]
    );

    // ✅ REDIRECT DENGAN PARAMETER SUCCESS
    res.redirect("/admin/user/tambah?success=true");
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

    const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");

    res.render("admin/editUser", {
      title: "Edit User",
      user: req.session.user,
      activeNav: "users",
      userData: rows[0],
      errorMsg: null,
      successMsg: null,
      divisiList,
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
    const { nama, email, password, role, id_divisi } = req.body;

    let divisiValue = null;
    if (role === "HMSI") {
      divisiValue = id_divisi || null;
    }

    let query, params;
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE user 
               SET nama=?, email=?, password=?, role=?, id_divisi=? 
               WHERE id_anggota=?`;
      params = [nama, email, hashedPassword, role, divisiValue, id];
    } else {
      query = `UPDATE user 
               SET nama=?, email=?, role=?, id_divisi=? 
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