// =====================================================
// controllers/Admin/divisiController.js
// CRUD Divisi (menggunakan respons JSON untuk AJAX)
// =====================================================
const db = require("../../config/db");

// =====================================================
// GET - Daftar Divisi (Non-AJAX, tetap render EJS)
// =====================================================
exports.getKelolaDivisi = async (req, res) => {
  try {
    const [divisiList] = await db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC");

    res.render("admin/kelolaDivisi", {
      title: "Kelola Divisi",
      user: req.session.user,
      divisiList,
      activeNav: "divisi",
    });
  } catch (err) {
    console.error("❌ [divisiController.getKelolaDivisi] Error:", err);
    req.flash("error", "Gagal memuat daftar divisi!");
    res.redirect("/admin");
  }
};

// =====================================================
// POST - Tambah Divisi (Non-AJAX, gunakan flash + redirect)
// =====================================================
exports.addDivisi = async (req, res) => {
  try {
    const { nama_divisi, deskripsi } = req.body;
    const namaTrim = nama_divisi?.trim();

    if (!namaTrim) {
      req.flash("error", "Nama divisi wajib diisi!");
      return res.redirect("/admin/kelola-divisi");
    }

    // Cek duplikasi nama
    const [cekNama] = await db.query("SELECT id_divisi FROM divisi WHERE nama_divisi = ?", [namaTrim]);
    if (cekNama.length > 0) {
      req.flash("error", `Divisi "${namaTrim}" sudah ada!`);
      return res.redirect("/admin/kelola-divisi");
    }

    await db.query(
      "INSERT INTO divisi (nama_divisi, deskripsi) VALUES (?, ?)",
      [namaTrim, deskripsi?.trim() || null]
    );

    req.flash("success", `Divisi "${namaTrim}" berhasil ditambahkan!`);
    return res.redirect("/admin/kelola-divisi");
  } catch (err) {
    console.error("❌ [divisiController.addDivisi] Error:", err);
    req.flash("error", "Terjadi kesalahan saat menambahkan divisi!");
    return res.redirect("/admin/kelola-divisi");
  }
};

// =====================================================
// POST - Update Divisi (Non-AJAX, gunakan flash + redirect)
// =====================================================
exports.updateDivisi = async (req, res) => {
  try {
    const { id_divisi, nama_divisi, deskripsi } = req.body;
    const namaTrim = nama_divisi?.trim();

    if (!namaTrim) {
      req.flash("error", "Nama divisi tidak boleh kosong!");
      return res.redirect("/admin/kelola-divisi");
    }

    // Cek apakah nama baru sudah digunakan divisi lain
    const [cekDuplikat] = await db.query(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ? AND id_divisi != ?",
      [namaTrim, id_divisi]
    );
    if (cekDuplikat.length > 0) {
      req.flash("error", `Divisi dengan nama "${namaTrim}" sudah digunakan!`);
      return res.redirect("/admin/kelola-divisi");
    }

    await db.query(
      "UPDATE divisi SET nama_divisi = ?, deskripsi = ? WHERE id_divisi = ?",
      [namaTrim, deskripsi?.trim() || null, id_divisi]
    );

    req.flash("success", `Divisi "${namaTrim}" berhasil diperbarui!`);
    return res.redirect("/admin/kelola-divisi");
  } catch (err) {
    console.error("❌ [divisiController.updateDivisi] Error:", err);
    req.flash("error", "Terjadi kesalahan saat memperbarui divisi!");
    return res.redirect("/admin/kelola-divisi");
  }
};

// =====================================================
// GET - Hapus Divisi (Non-AJAX, gunakan flash + redirect)
// =====================================================
exports.deleteDivisi = async (req, res) => {
  try {
    const { id_divisi } = req.params;

    // Cek apakah divisi sedang digunakan oleh user
    const [usedByUser] = await db.query("SELECT COUNT(*) AS total FROM user WHERE id_divisi = ?", [id_divisi]);
    if (usedByUser[0]?.total > 0) {
      req.flash("error", "Divisi ini tidak dapat dihapus karena masih digunakan oleh user!");
      return res.redirect("/admin/kelola-divisi");
    }

    await db.query("DELETE FROM divisi WHERE id_divisi = ?", [id_divisi]);

    req.flash("success", "Divisi berhasil dihapus!");
    return res.redirect("/admin/kelola-divisi");
  } catch (err) {
    console.error("❌ [divisiController.deleteDivisi] Error:", err);
    req.flash("error", "Terjadi kesalahan saat menghapus divisi!");
    return res.redirect("/admin/kelola-divisi");
  }
};