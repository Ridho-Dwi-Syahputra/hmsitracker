// =====================================================
// controllers/DPA/prokerController.js
// Controller khusus DPA untuk Program Kerja
// =====================================================

const db = require("../../config/db");
const { v4: uuidv4 } = require("uuid"); // untuk id notifikasi
const { deleteOldProkerNotif } = require("../HMSI/notifikasiController");

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
// helper: hitung status otomatis (fallback untuk Belum Dimulai/Sedang Berjalan)
// =====================================================
function calculateStatus(start, end) {
  const today = new Date();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (startDate && today < startDate) return "Belum Dimulai";
  if (startDate && endDate && today >= startDate && today <= endDate) return "Sedang Berjalan";
  if (endDate && today > endDate) return "Selesai";
  return "Belum Dimulai";
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
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      ORDER BY p.Tanggal_mulai DESC
    `);

    const programs = rows.map(r => {
      // Gunakan status dari DB kalau sudah "Selesai"/"Tidak Selesai"
      let status = r.status_db;
      if (!status || ["Belum Dimulai", "Sedang Berjalan"].includes(status)) {
        status = calculateStatus(r.tanggal_mulai, r.tanggal_selesai);
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
      programs,
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
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      WHERE p.id_ProgramKerja = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).send("Program Kerja tidak ditemukan");

    const r = rows[0];
    const status = r.status_db && ["Sedang Berjalan","Selesai","Tidak Selesai"].includes(r.status_db)
      ? r.status_db
      : calculateStatus(r.tanggal_mulai, r.tanggal_selesai);

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
      status
    };

    res.render("dpa/detailProker", {
      title: "Detail Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Daftar Program Kerja",
      proker,
      errorMsg: null,
      successMsg: null,
    });
  } catch (err) {
    console.error("❌ Error getDetailProkerDPA:", err.message);
    res.status(500).send("Gagal mengambil detail program kerja");
  }
};

// =====================================================
// 🔄 Ubah status Proker (khusus DPA)
// =====================================================
exports.updateStatusProker = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["Sedang Berjalan", "Selesai", "Tidak Selesai"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }

    // 🔹 Ambil info proker dulu untuk notifikasi
    const [rows] = await db.query(
      `SELECT p.Nama_ProgramKerja AS namaProker, u.divisi AS divisi
       FROM Program_kerja p
       LEFT JOIN User u ON p.id_anggota = u.id_anggota
       WHERE p.id_ProgramKerja = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: "Proker tidak ditemukan" });

    const proker = rows[0];

    // Update status
    await db.query(
      "UPDATE Program_kerja SET Status=? WHERE id_ProgramKerja=?",
      [status, id]
    );

    // 🔴 Hapus notifikasi lama sebelum menambah yang baru
    await deleteOldProkerNotif(id);

    // 🟠 Tambahkan notifikasi ke HMSI divisi terkait
    const idNotifikasi = uuidv4();
    const pesan = `DPA telah mengubah status Program Kerja "${proker.namaProker}" milik divisi ${proker.divisi} menjadi ${status}`;
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, role, divisi, status_baca, id_ProgramKerja, created_at)
       VALUES (?, ?, 'HMSI', ?, 0, ?, NOW())`,
      [idNotifikasi, pesan, proker.divisi, id]
    );

    res.json({ success: true, message: `Status program kerja diubah menjadi ${status}` });
  } catch (err) {
    console.error("❌ Error updateStatusProker:", err.message);
    res.status(500).json({ success: false, message: "Gagal mengubah status proker" });
  }
};
