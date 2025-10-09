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
        u.id_divisi AS divisi,
        d.nama_divisi AS nama_divisi,       -- 🧩 UPDATE: ambil nama divisi dari tabel divisi
        d.id_divisi AS id_divisi,           -- 🧩 UPDATE: ambil id_divisi dari tabel divisi
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi  -- 🧩 UPDATE: join tabel divisi
      ORDER BY p.Tanggal_mulai DESC
    `);
 
    const programs = rows.map(r => {
      // Gunakan status dari DB kalau sudah "Selesai"/"Gagal"
      let status = r.status_db;
      if (!status || ["Belum Dimulai", "Sedang Berjalan"].includes(status)) {
        status = calculateStatus(r.tanggal_mulai, r.tanggal_selesai);
      }

      return {
        id: r.id,
        namaProker: r.namaProker,
        divisi: r.nama_divisi || r.divisi,   // 🧩 UPDATE: fallback ke nama_divisi jika tersedia
        id_divisi: r.id_divisi,              // 🧩 UPDATE: sertakan id_divisi untuk kebutuhan notifikasi
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
        u.id_divisi AS divisi,
        d.nama_divisi AS nama_divisi,     -- 🧩 UPDATE
        d.id_divisi AS id_divisi,         -- 🧩 UPDATE
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi   -- 🧩 UPDATE
      WHERE p.id_ProgramKerja = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).send("Program Kerja tidak ditemukan");
    }

    const r = rows[0];
    
    // ✅ PERBAIKAN: Gunakan status dari DB jika valid, atau hitung otomatis
    let status = r.status_db;
    if (!status || !["Belum Dimulai", "Sedang Berjalan", "Selesai", "Gagal"].includes(status)) {
      status = calculateStatus(r.tanggal_mulai, r.tanggal_selesai);
    }
    
    console.log('📊 Status dari database:', r.status_db);
    console.log('📊 Status yang digunakan:', status);

    const proker = {
      id: r.id,
      namaProker: r.namaProker,
      divisi: r.nama_divisi || r.divisi,   // 🧩 UPDATE
      id_divisi: r.id_divisi,              // 🧩 UPDATE
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

    console.log('📝 Request update status - ID:', id, 'Status:', status);

    const validStatus = ["Belum Dimulai", "Sedang Berjalan", "Selesai", "Gagal"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Status tidak valid. Harus salah satu dari: Belum Dimulai, Sedang Berjalan, Selesai, Gagal" 
      });
    }

    // 🔹 Ambil info proker dulu untuk notifikasi
    const [rows] = await db.query(
      `SELECT 
         p.Nama_ProgramKerja AS namaProker, 
         u._iddivisi AS divisi,
         d.id_divisi AS id_divisi,          -- 🧩 UPDATE
         d.nama_divisi AS nama_divisi       -- 🧩 UPDATE
       FROM Program_kerja p
       LEFT JOIN User u ON p.id_anggota = u.id_anggota
       LEFT JOIN divisi d ON u.id_divisi = d.id_divisi   -- 🧩 UPDATE
       WHERE p.id_ProgramKerja = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: "Program kerja tidak ditemukan" 
      });
    }

    const proker = rows[0];

    // ✅ Update status di database
    const [result] = await db.query(
      "UPDATE Program_kerja SET Status = ? WHERE id_ProgramKerja = ?",
      [status, id]
    );

    console.log('✅ Update result - Rows affected:', result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Program kerja tidak ditemukan atau tidak ada perubahan" 
      });
    }

    // 🔴 Hapus notifikasi lama sebelum menambah yang baru
    await deleteOldProkerNotif(id);

    // 🟠 Tambahkan notifikasi ke HMSI divisi terkait
    const idNotifikasi = uuidv4();
    const pesan = `DPA telah mengubah status Program Kerja "${proker.namaProker}" milik divisi ${proker.nama_divisi || proker.divisi} menjadi ${status}`;
    
    // 🧩 UPDATE: gunakan id_divisi, bukan string divisi
    await db.query(
      `INSERT INTO Notifikasi (id_notifikasi, pesan, role, id_divisi, status_baca, id_ProgramKerja, created_at)
       VALUES (?, ?, 'HMSI', ?, 0, ?, NOW())`,
      [idNotifikasi, pesan, proker.id_divisi, id]
    );

    console.log('✅ Status berhasil diubah dan notifikasi terkirim');

    res.json({ 
      success: true, 
      message: `Status program kerja berhasil diubah menjadi ${status}` 
    });

  } catch (err) {
    console.error("❌ Error updateStatusProker:", err.message);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Gagal mengubah status program kerja: " + err.message 
    });
  }
};
