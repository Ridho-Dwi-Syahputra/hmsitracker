// =====================================================
// controllers/Admin/divisiController.js
// CRUD Divisi (menggunakan respons JSON untuk AJAX)
// =====================================================
const db = require("../../config/db");

// =====================================================
// 📄 GET - Daftar Divisi (Non-AJAX, tetap render EJS)
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
// ➕ POST - Tambah Divisi (AJAX)
// =====================================================
exports.addDivisi = async (req, res) => {
  try {
    const { nama_divisi, deskripsi } = req.body;
    const namaTrim = nama_divisi?.trim();

    if (!namaTrim) {
      // Mengembalikan status 400 untuk validasi gagal
      return res.status(400).json({ success: false, message: "Nama divisi wajib diisi!" });
    }

    // Cek duplikasi nama
    const [cekNama] = await db.query("SELECT id_divisi FROM divisi WHERE nama_divisi = ?", [namaTrim]);
    if (cekNama.length > 0) {
      // Mengembalikan status 409 (Conflict) untuk duplikasi
      return res.status(409).json({ success: false, message: `Divisi "${namaTrim}" sudah ada!` });
    }

    await db.query(
      "INSERT INTO divisi (nama_divisi, deskripsi) VALUES (?, ?)",
      [namaTrim, deskripsi?.trim() || null]
    );

    // Mengembalikan status 200 OK untuk sukses
    return res.status(200).json({ success: true, message: `Divisi "${namaTrim}" berhasil ditambahkan!` });
  } catch (err) {
    console.error("❌ [divisiController.addDivisi] Error:", err);
    // Mengembalikan status 500 untuk error server
    return res.status(500).json({ success: false, message: "Terjadi kesalahan saat menambahkan divisi!" });
  }
};

// =====================================================
// ✏️ POST - Update Divisi (AJAX)
// =====================================================
exports.updateDivisi = async (req, res) => {
  try {
    const { id_divisi, nama_divisi, deskripsi } = req.body;
    const namaTrim = nama_divisi?.trim();

    if (!namaTrim) {
      // Mengembalikan status 400 untuk validasi gagal
      return res.status(400).json({ success: false, message: "Nama divisi tidak boleh kosong!" });
    }

    // Cek apakah nama baru sudah digunakan divisi lain
    const [cekDuplikat] = await db.query(
      "SELECT id_divisi FROM divisi WHERE nama_divisi = ? AND id_divisi != ?",
      [namaTrim, id_divisi]
    );
    if (cekDuplikat.length > 0) {
      // Mengembalikan status 409 (Conflict) untuk duplikasi
      return res.status(409).json({ success: false, message: `Divisi dengan nama "${namaTrim}" sudah digunakan!` });
    }

    await db.query(
      "UPDATE divisi SET nama_divisi = ?, deskripsi = ? WHERE id_divisi = ?",
      [namaTrim, deskripsi?.trim() || null, id_divisi]
    );

    // Mengembalikan status 200 OK untuk sukses
    return res.status(200).json({ success: true, message: `Divisi "${namaTrim}" berhasil diperbarui!` });
  } catch (err) {
    console.error("❌ [divisiController.updateDivisi] Error:", err);
    // Mengembalikan status 500 untuk error server
    return res.status(500).json({ success: false, message: "Terjadi kesalahan saat memperbarui divisi!" });
  }
};

// =====================================================
// 🗑️ GET - Hapus Divisi (AJAX)
// =====================================================
exports.deleteDivisi = async (req, res) => {
  try {
    const { id_divisi } = req.params;

    // Cek apakah divisi sedang digunakan oleh user
    const [usedByUser] = await db.query("SELECT COUNT(*) AS total FROM user WHERE id_divisi = ?", [id_divisi]);
    if (usedByUser[0].total > 0) {
      // Mengembalikan status 409 (Conflict) karena masih memiliki anggota
      return res.status(409).json({ 
        success: false, 
        message: "Divisi ini tidak dapat dihapus karena masih memiliki anggota terkait." 
      });
    }

    await db.query("DELETE FROM divisi WHERE id_divisi = ?", [id_divisi]);

    // Mengembalikan status 200 OK untuk sukses
    return res.status(200).json({ success: true, message: "Divisi berhasil dihapus!" });
  } catch (err) {
    console.error("❌ [divisiController.deleteDivisi] Error:", err);
    // Mengembalikan status 500 untuk error server
    return res.status(500).json({ success: false, message: "Terjadi kesalahan saat menghapus divisi!" });
  }
};