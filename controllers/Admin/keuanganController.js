// controllers/Admin/keuanganController.js
// Manajemen Keuangan HMSI (Pemasukan & Pengeluaran)

const db = require("../../config/db"); // koneksi database MySQL
const { v4: uuidv4 } = require("uuid");

// Helper: format tanggal Indonesia
function formatTanggal(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ================== PEMASUKAN ========================

// Halaman kelola kas (pemasukan)
exports.getPemasukan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_keuangan, tanggal, sumber, jumlah
      FROM keuangan
      WHERE tipe = 'Pemasukan'
      ORDER BY tanggal DESC, created_at DESC
    `);

    let totalPemasukan = 0;
    const pemasukan = rows.map((row) => {
      const jumlah = parseFloat(row.jumlah) || 0;
      totalPemasukan += jumlah;
      return {
        ...row,
        tanggalFormatted: formatTanggal(row.tanggal),
        jumlah,
      };
    });

    res.render("admin/kelolaKas", {
      title: "Kelola Uang Kas HMSI",
      user: req.session.user || { nama: "Admin HMSI", foto_profile: null },
      activeNav: "keuangan",
      pemasukan,
      totalPemasukan,
    });
  } catch (err) {
    console.error("❌ Error getPemasukan:", err.message);
    res.status(500).send("Gagal mengambil data pemasukan");
  }
};

// Form tambah pemasukan
exports.getTambahPemasukan = (req, res) => {
  res.render("admin/tambahKas", {
    title: "Tambah Pemasukan Kas",
    user: req.session.user || { nama: "Admin HMSI", foto_profile: null },
    activeNav: "keuangan",
  });
};

// Simpan pemasukan baru
exports.postTambahPemasukan = async (req, res) => {
  try {
    const { sumber, jumlah } = req.body;
    if (!sumber || !jumlah) {
      return res.status(400).send("Sumber dan jumlah wajib diisi");
    }

    const id_keuangan = uuidv4();

    await db.query(
      `INSERT INTO keuangan (id_keuangan, tanggal, tipe, sumber, jumlah, id_anggota, created_at)
       VALUES (?, CURDATE(), 'Pemasukan', ?, ?, ?, NOW())`,
      [id_keuangan, sumber, jumlah, req.session.user?.id_anggota || null]
    );

    res.redirect("/admin/keuangan");
  } catch (err) {
    console.error("❌ Error postTambahPemasukan:", err.message);
    res.status(500).send("Gagal menambah pemasukan");
  }
};

// Form edit pemasukan
exports.getEditPemasukan = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM keuangan WHERE id_keuangan = ? AND tipe = 'Pemasukan'`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).send("Data pemasukan tidak ditemukan");
    }

    res.render("admin/editKas", {
      title: "Edit Pemasukan Kas",
      user: req.session.user || { nama: "Admin HMSI", foto_profile: null },
      activeNav: "keuangan",
      pemasukan: rows[0],
    });
  } catch (err) {
    console.error("❌ Error getEditPemasukan:", err.message);
    res.status(500).send("Gagal mengambil data pemasukan");
  }
};

// Simpan edit pemasukan
exports.postEditPemasukan = async (req, res) => {
  try {
    const { id } = req.params;
    const { sumber, jumlah } = req.body;

    if (!sumber || !jumlah) {
      return res.status(400).send("Sumber dan jumlah wajib diisi");
    }

    await db.query(
      `UPDATE keuangan SET sumber = ?, jumlah = ? WHERE id_keuangan = ? AND tipe = 'Pemasukan'`,
      [sumber, jumlah, id]
    );

    res.redirect("/admin/keuangan");
  } catch (err) {
    console.error("❌ Error postEditPemasukan:", err.message);
    res.status(500).send("Gagal memperbarui pemasukan");
  }
};

// Hapus pemasukan
exports.deletePemasukan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `DELETE FROM keuangan WHERE id_keuangan = ? AND tipe = 'Pemasukan'`,
      [id]
    );
    res.redirect("/admin/keuangan");
  } catch (err) {
    console.error("❌ Error deletePemasukan:", err.message);
    res.status(500).send("Gagal menghapus pemasukan");
  }
};

// ================== PENGELUARAN ======================

// Halaman pengeluaran kas (dari laporan HMSI)
exports.getPengeluaran = async (req, res) => {
  try {

    // NOTE: gunakan nama tabel Program_kerja (sesuai struktur DB) — bukan ProgramKerja
    const query = `
      SELECT 
        k.id_keuangan,
        k.tanggal,
        k.jumlah,
        k.id_laporan,
        l.divisi,
        l.judul_laporan,
        p.Nama_ProgramKerja AS program_kerja,
        k.sumber
      FROM keuangan k
      LEFT JOIN laporan l ON k.id_laporan = l.id_laporan
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      WHERE k.tipe = 'Pengeluaran'
      ORDER BY k.tanggal DESC, k.created_at DESC
    `;


    const [rows] = await db.query(query);



    let totalPengeluaran = 0;
    const pengeluaran = rows.map((row, i) => {
      const jumlah = parseFloat(row.jumlah) || 0;
      totalPengeluaran += jumlah;

      const result = {
        no: i + 1,
        id_keuangan: row.id_keuangan,
        id_laporan: row.id_laporan,
        divisi: row.divisi || "-",
        // program_kerja: pakai nama proker bila ada, fallback ke sumber
        program_kerja: row.program_kerja || row.sumber || "-",
        // judul_laporan: tetap ambil judul laporan (boleh kosong jika tidak terkait laporan)
        judul_laporan: row.judul_laporan || "-",
        dana_terpakai: jumlah,
        tanggal_pengeluaran: formatTanggal(row.tanggal),
      };

      
      return result;
    });



    res.render("admin/pengeluaran", {
      title: "Pengeluaran Kas HMSI",
      user: req.session.user || { nama: "Admin HMSI", foto_profile: null },
      activeNav: "pengeluaran",
      pengeluaran,
      totalPengeluaran,
    });
  } catch (err) {
    console.error("❌ Error getPengeluaran:", err.message);
    res.status(500).send("Gagal mengambil data pengeluaran");
  }
};

// ============ RINGKASAN UNTUK DASHBOARD ==============

// Ambil total kas saat ini untuk dashboard admin
exports.getTotalKas = async (callback) => {
  try {
    const [rows] = await db.query(`
      SELECT
        SUM(CASE WHEN tipe='Pemasukan' THEN jumlah ELSE 0 END) AS total_masuk,
        SUM(CASE WHEN tipe='Pengeluaran' THEN jumlah ELSE 0 END) AS total_keluar
      FROM keuangan
    `);

    const total_masuk = parseFloat(rows[0].total_masuk || 0);
    const total_keluar = parseFloat(rows[0].total_keluar || 0);
    const total_kas = total_masuk - total_keluar;

    callback(null, total_kas);
  } catch (err) {
    console.error("❌ Error getTotalKas:", err.message);
    callback(err);
  }
};
