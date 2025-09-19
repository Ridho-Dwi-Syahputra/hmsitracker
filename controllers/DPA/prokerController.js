// =====================================================
// controllers/DPA/prokerController.js
// Controller khusus DPA untuk Program Kerja
// (Read-only: hanya bisa lihat, tidak bisa tambah/edit/hapus)
// =====================================================

const db = require("../../config/db");

// =====================================================
// helper: format tanggal ke format Indonesia
// =====================================================
function formatTanggal(dateValue) {
  if (!dateValue || dateValue === "0000-00-00") return "-";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =====================================================
// 📋 Ambil semua program kerja (untuk DPA lihatProker)
// =====================================================
exports.getAllProkerDPA = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_ProgramKerja AS id,
        p.Nama_ProgramKerja AS namaProker,
        u.divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      ORDER BY p.Tanggal_mulai DESC
    `);

    // Tambahkan status otomatis berdasarkan tanggal
    const programs = rows.map(r => {
      const today = new Date();
      const start = r.tanggal_mulai ? new Date(r.tanggal_mulai) : null;
      const end = r.tanggal_selesai ? new Date(r.tanggal_selesai) : null;

      let status = "Belum Dimulai";
      if (start && today >= start && (!end || today <= end)) {
        status = "Sedang Berjalan";
      } else if (end && today > end) {
        status = "Selesai";
      }

      return {
        id: r.id,
        namaProker: r.namaProker,
        divisi: r.divisi,
        deskripsi: r.deskripsi,
        tanggal_mulai: r.tanggal_mulai,
        tanggal_selesai: r.tanggal_selesai,
        penanggungJawab: r.penanggungJawab,
        dokumen_pendukung: r.dokumen_pendukung,
        tanggalMulaiFormatted: formatTanggal(r.tanggal_mulai),
        tanggalSelesaiFormatted: formatTanggal(r.tanggal_selesai),
        status
      };
    });

    res.render("dpa/lihatProker", {
      title: "Daftar Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Daftar Program Kerja",
      programs: programs,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getAllProkerDPA:", err.message);
    res.render("dpa/lihatProker", {
      title: "Daftar Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Daftar Program Kerja",
      programs: [],
      errorMsg: "Gagal memuat daftar program kerja.",
      successMsg: null,
    });
  }
};

// =====================================================
// 📄 Ambil detail 1 program kerja (untuk DPA detailProker)
// =====================================================
exports.getDetailProkerDPA = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        p.id_ProgramKerja AS id,
        p.Nama_ProgramKerja AS namaProker,
        u.divisi AS divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE p.id_ProgramKerja = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).send("Program Kerja tidak ditemukan");
    }

    const r = rows[0];

    // Tentukan status otomatis
    const today = new Date();
    const start = r.tanggal_mulai ? new Date(r.tanggal_mulai) : null;
    const end = r.tanggal_selesai ? new Date(r.tanggal_selesai) : null;

    let status = "Belum Dimulai";
    if (start && today >= start && (!end || today <= end)) {
      status = "Sedang Berjalan";
    } else if (end && today > end) {
      status = "Selesai";
    }

    const proker = {
      id: r.id,
      namaProker: r.namaProker,
      divisi: r.divisi,
      deskripsi: r.deskripsi,
      tanggal_mulai: r.tanggal_mulai,
      tanggal_selesai: r.tanggal_selesai,
      penanggungJawab: r.penanggungJawab,
      dokumen_pendukung: r.dokumen_pendukung,
      tanggalMulaiFormatted: formatTanggal(r.tanggal_mulai),
      tanggalSelesaiFormatted: formatTanggal(r.tanggal_selesai),
      status: status
    };

    res.render("dpa/detailProker", {
      title: "Detail Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Daftar Program Kerja",
      proker: proker,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getDetailProkerDPA:", err.message);
    res.status(500).send("Gagal mengambil detail program kerja");
  }
};
