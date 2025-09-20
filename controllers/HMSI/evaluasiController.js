// controllers/HMSI/evaluasiController.js
const db = require("../../config/db");

// =====================================================
// 📄 List Evaluasi (Hanya evaluasi terbaru per laporan)
// =====================================================
exports.getAllEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id_evaluasi, e.komentar, e.status_konfirmasi, e.tanggal_evaluasi,
             l.id_laporan, l.judul_laporan, 
             p.Nama_ProgramKerja,
             u.nama AS evaluator
      FROM Evaluasi e
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
      INNER JOIN (
        SELECT id_laporan, MAX(tanggal_evaluasi) AS last_eval
        FROM Evaluasi
        GROUP BY id_laporan
      ) latest 
      ON e.id_laporan = latest.id_laporan AND e.tanggal_evaluasi = latest.last_eval
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
      title: "Kelola Evaluasi",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Evaluasi",
      evaluasi
    });
  } catch (err) {
    console.error("❌ Error getAllEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil evaluasi");
  }
};

// =====================================================
// 📄 Detail Evaluasi
// =====================================================
exports.getDetailEvaluasi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id_evaluasi, e.komentar, e.status_konfirmasi, e.tanggal_evaluasi,
             l.judul_laporan, p.Nama_ProgramKerja,
             u.nama AS evaluator
      FROM Evaluasi e
      JOIN Laporan l ON e.id_laporan = l.id_laporan
      LEFT JOIN Program_kerja p ON l.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN User u ON e.pemberi_evaluasi = u.id_anggota
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
      activeNav: "Evaluasi",
      evaluasi: ev
    });
  } catch (err) {
    console.error("❌ Error getDetailEvaluasi:", err.message);
    res.status(500).send("Gagal mengambil detail evaluasi");
  }
};

// =====================================================
// 💾 Tambah Evaluasi
// =====================================================
exports.createEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi, id_laporan } = req.body;
    const id_anggota = req.session.user?.id || null;

    await db.query(`
      INSERT INTO Evaluasi (id_evaluasi, komentar, status_konfirmasi, tanggal_evaluasi, id_laporan, pemberi_evaluasi)
      VALUES (UUID(), ?, ?, NOW(), ?, ?)
    `, [komentar, status_konfirmasi, id_laporan, id_anggota]);

    res.redirect("/hmsi/evaluasi");
  } catch (err) {
    console.error("❌ Error createEvaluasi:", err.message);
    res.status(500).send("Gagal menambahkan evaluasi");
  }
};

// =====================================================
// ✏️ Update Evaluasi
// =====================================================
exports.updateEvaluasi = async (req, res) => {
  try {
    const { komentar, status_konfirmasi } = req.body;
    await db.query(`
      UPDATE Evaluasi 
      SET komentar=?, status_konfirmasi=?, tanggal_evaluasi=NOW()
      WHERE id_evaluasi=?
    `, [komentar, status_konfirmasi, req.params.id]);

    res.redirect("/hmsi/evaluasi/" + req.params.id);
  } catch (err) {
    console.error("❌ Error updateEvaluasi:", err.message);
    res.status(500).send("Gagal update evaluasi");
  }
};

// =====================================================
// ❌ Hapus Evaluasi
// =====================================================
exports.deleteEvaluasi = async (req, res) => {
  try {
    await db.query("DELETE FROM Evaluasi WHERE id_evaluasi=?", [req.params.id]);
    res.redirect("/hmsi/evaluasi");
  } catch (err) {
    console.error("❌ Error deleteEvaluasi:", err.message);
    res.status(500).send("Gagal hapus evaluasi");
  }
};
