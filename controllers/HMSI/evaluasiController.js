// controllers/HMSI/evaluasiController.js
const db = require("../../config/db");

// 📄 List Evaluasi
exports.getAllEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, l.deskripsi_kegiatan AS namaLaporan
      FROM Evaluasi e
      LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
      ORDER BY e.tanggal_evaluasi DESC
    `);

    const evaluasi = rows.map(r => {
      let tanggalFormatted = "-";
      if (r.tanggal_evaluasi) {
        const d = new Date(r.tanggal_evaluasi);
        if (!isNaN(d.getTime())) {
          tanggalFormatted = d.toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
          });
        }
      }
      return { ...r, tanggalFormatted };
    });

    res.render("hmsi/kelolaEvaluasi", {
      title: "Kelola Evaluasi DPA",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Evaluasi DPA",
      evaluasi
    });
  } catch (err) {
    console.error("❌ Error getAllEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil evaluasi");
  }
};

// 📄 Detail Evaluasi
exports.getDetailEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, l.deskripsi_kegiatan AS namaLaporan
      FROM Evaluasi e
      LEFT JOIN Laporan l ON e.id_laporan = l.id_laporan
      WHERE e.id_evaluasi = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).send("Evaluasi tidak ditemukan");

    let ev = rows[0];
    let tanggalFormatted = "-";
    if (ev.tanggal_evaluasi) {
      const d = new Date(ev.tanggal_evaluasi);
      if (!isNaN(d.getTime())) {
        tanggalFormatted = d.toLocaleDateString("id-ID", {
          day: "2-digit", month: "short", year: "numeric"
        });
      }
    }
    ev.tanggalFormatted = tanggalFormatted;

    res.render("hmsi/detailEvaluasi", {
      title: "Detail Evaluasi",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Evaluasi DPA",
      evaluasi: ev
    });
  } catch (err) {
    console.error("❌ Error getDetailEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil detail evaluasi");
  }
};

// 💾 Tambah Evaluasi
exports.createEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi, id_laporan } = req.body;
    await db.query(`
      INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan)
      VALUES (UUID(), ?, ?, CURDATE(), ?)
    `, [komentar, status_konfirmasi, id_laporan]);

    res.redirect("/hmsi/evaluasi");
  } catch (err) {
    console.error("❌ Error createEvaluasi:", err.message);
    res.status(500).send("Gagal menambahkan evaluasi");
  }
};

// ✏️ Update Evaluasi
exports.updateEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi } = req.body;
    await db.query(`
      UPDATE Evaluasi SET komentar=?, status_konfirmasi=?, tanggal_evaluasi=CURDATE()
      WHERE id_evaluasi=?
    `, [komentar, status_konfirmasi, req.params.id]);

    res.redirect("/hmsi/evaluasi/" + req.params.id);
  } catch (err) {
    console.error("❌ Error updateEvaluasi:", err.message);
    res.status(500).send("Gagal update evaluasi");
  }
};

// ❌ Hapus Evaluasi
exports.deleteEvaluasi = async (req, res) => {
  try {
    await db.query("DELETE FROM Evaluasi WHERE id_evaluasi=?", [req.params.id]);
    res.redirect("/hmsi/evaluasi");
  } catch (err) {
    console.error("❌ Error deleteEvaluasi:", err.message);
    res.status(500).send("Gagal hapus evaluasi");
  }
};
