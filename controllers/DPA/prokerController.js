// =====================================================
// controllers/dpa/prokerController.js
// Controller khusus DPA untuk Program Kerja
// =====================================================

const db = require("../../config/db");
const { v4: uuidv4 } = require("uuid");
const { deleteOldProkerNotif } = require("../hmsi/notifikasiController");

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
// helper: hitung status otomatis (DIPERBAIKI - tanpa auto "Selesai")
// =====================================================
function calculateStatus(start, end, status_db = null) {
  // 🔹 Jika status sudah final, gunakan status dari DB
  if (status_db === "Selesai" || status_db === "Tidak Selesai") {
    return status_db;
  }
  
  // 🔹 Jika status dari DB adalah "Sedang Berjalan", tetap gunakan itu
  if (status_db === "Sedang Berjalan") {
    return status_db;
  }
  
  const today = new Date();
  const startDate = start ? new Date(start) : null;

  // 🔹 Hanya cek apakah proker sudah dimulai atau belum
  if (startDate && today < startDate) return "Belum Dimulai";
  if (startDate && today >= startDate) return "Sedang Berjalan";
  
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
        d.nama_divisi AS nama_divisi,
        d.id_divisi AS id_divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      ORDER BY p.Tanggal_mulai DESC
    `);

    const programs = rows.map((r) => {
      let status = r.status_db;
      if (!status || ["Belum Dimulai", "Sedang Berjalan"].includes(status)) {
        status = calculateStatus(r.tanggal_mulai, r.tanggal_selesai, r.status_db);
      }

      return {
        id: r.id,
        namaProker: r.namaProker,
        divisi: r.nama_divisi || r.divisi || "Tidak Diketahui",
        id_divisi: r.id_divisi || null,
        deskripsi: r.deskripsi,
        tanggal_mulai: r.tanggal_mulai,
        tanggal_selesai: r.tanggal_selesai,
        penanggungJawab: r.penanggungJawab,
        dokumen_pendukung: r.dokumen_pendukung,
        tanggalMulaiFormatted: formatTanggal(r.tanggal_mulai),
        tanggalSelesaiFormatted: formatTanggal(r.tanggal_selesai),
        status,
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
    console.error("Stack trace:", err.stack);
    res.render("dpa/lihatProker", {
      title: "Daftar Program Kerja",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Daftar Program Kerja",
      programs: [],
      errorMsg: `Gagal memuat daftar program kerja: ${err.message}`,
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
      `
      SELECT 
        p.id_ProgramKerja AS id,
        p.Nama_ProgramKerja AS namaProker,
        u.id_divisi AS divisi,
        d.nama_divisi AS nama_divisi,
        d.id_divisi AS id_divisi,
        p.Deskripsi AS deskripsi,
        p.Tanggal_mulai AS tanggal_mulai,
        p.Tanggal_selesai AS tanggal_selesai,
        p.Penanggung_jawab AS penanggungJawab,
        p.Dokumen_pendukung AS dokumen_pendukung,
        p.Target_Kuantitatif,
        p.Target_Kualitatif,
        p.Status AS status_db
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE p.id_ProgramKerja = ?
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).send("Program Kerja tidak ditemukan");
    }

    const r = rows[0];

    // 🔹 Hitung status otomatis bila belum final (tanpa auto "Selesai")
    let status = r.status_db;
    if (!status || !["Selesai", "Tidak Selesai"].includes(status)) {
      status = calculateStatus(r.tanggal_mulai, r.tanggal_selesai, r.status_db);
    }

    console.log("📊 Status dari database:", r.status_db);
    console.log("📊 Status yang digunakan:", status);

    const proker = {
      id: r.id,
      namaProker: r.namaProker,
      divisi: r.nama_divisi || r.divisi || "Tidak Diketahui",
      id_divisi: r.id_divisi || null,
      deskripsi: r.deskripsi,
      tanggal_mulai: r.tanggal_mulai,
      tanggal_selesai: r.tanggal_selesai,
      penanggungJawab: r.penanggungJawab,
      dokumen_pendukung: r.dokumen_pendukung,
      Target_Kuantitatif: r.Target_Kuantitatif || "-",
      Target_Kualitatif: r.Target_Kualitatif || "-",
      tanggalMulaiFormatted: formatTanggal(r.tanggal_mulai),
      tanggalSelesaiFormatted: formatTanggal(r.tanggal_selesai),
      status,
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
// 🔄 Ubah status Proker (khusus DPA) - DENGAN VALIDASI LAPORAN
// =====================================================
exports.updateStatusProker = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("📝 Request update status - ID:", id, "Status:", status);

    // ✅ Validasi status yang diperbolehkan
    const validStatus = ["Belum Dimulai", "Sedang Berjalan", "Selesai", "Tidak Selesai"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Harus salah satu dari: " + validStatus.join(", "),
      });
    }

    // 🔹 Ambil info proker untuk validasi dan notifikasi
    const [rows] = await db.query(
      `
      SELECT 
        p.Nama_ProgramKerja AS namaProker,
        p.Status AS status_sekarang,
        u.id_divisi AS divisi,
        d.id_divisi AS id_divisi,
        d.nama_divisi AS nama_divisi
      FROM Program_kerja p
      LEFT JOIN User u ON p.id_anggota = u.id_anggota
      LEFT JOIN Divisi d ON u.id_divisi = d.id_divisi
      WHERE p.id_ProgramKerja = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Program kerja tidak ditemukan",
      });
    }

    const proker = rows[0];

    // 🔹 Validasi: Jika status sudah final (Selesai/Tidak Selesai), tidak boleh diubah
    if (proker.status_sekarang === "Selesai" || proker.status_sekarang === "Tidak Selesai") {
      return res.status(400).json({
        success: false,
        message: "Status program kerja sudah final dan tidak dapat diubah kembali.",
      });
    }

    // 🔹 VALIDASI BARU: Jika status yang diminta adalah "Selesai", cek apakah ada laporan yang diterima
    if (status === "Selesai") {
      const [laporanRows] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM Laporan l
        JOIN Evaluasi e ON e.id_laporan = l.id_laporan
        WHERE l.id_ProgramKerja = ? AND e.status_konfirmasi = 'Selesai'
        `,
        [id]
      );

      const totalLaporanDiterima = laporanRows[0].total;

      if (totalLaporanDiterima < 1) {
        return res.status(400).json({
          success: false,
          message: "Belum ada laporan yang diterima pada proker ini.",
        });
      }
    }

    // ✅ Update status di database
    const [result] = await db.query(
      "UPDATE Program_kerja SET Status = ? WHERE id_ProgramKerja = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Program kerja tidak ditemukan atau tidak ada perubahan",
      });
    }

    // 🔴 Hapus notifikasi lama sebelum menambah yang baru
    await deleteOldProkerNotif(id);

    // 🟠 Tambahkan notifikasi ke HMSI
    const idNotifikasi = uuidv4();
    const divisiNama = proker.nama_divisi || proker.divisi || "Tidak Diketahui";
    const idDivisi = proker.id_divisi || null;
    const pesan = `DPA telah mengubah status Program Kerja "${proker.namaProker}" milik divisi ${divisiNama} menjadi "${status}"`;

    if (idDivisi) {
      await db.query(
        `INSERT INTO Notifikasi 
         (id_notifikasi, pesan, target_role, id_divisi, status_baca, id_ProgramKerja, created_at)
         VALUES (?, ?, 'HMSI', ?, 0, ?, NOW())`,
        [idNotifikasi, pesan, idDivisi, id]
      );
      console.log("✅ Notifikasi dikirim ke divisi:", divisiNama);
    } else {
      console.warn("⚠️ Tidak dapat kirim notifikasi karena id_divisi NULL");
    }

    res.json({
      success: true,
      message: `Status program kerja berhasil diubah menjadi "${status}"`,
    });
  } catch (err) {
    console.error("❌ Error updateStatusProker:", err.message);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah status program kerja: " + err.message,
    });
  }
};

// =====================================================
// 🔍 CEK LAPORAN PENDING (untuk validasi sebelum ubah status)
// =====================================================
exports.checkLaporanPending = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah ada laporan dengan status selain 'Selesai'
    const [rows] = await db.query(
      `
      SELECT COUNT(*) AS pending_count
      FROM Laporan l
      LEFT JOIN Evaluasi e ON e.id_laporan = l.id_laporan
      WHERE l.id_ProgramKerja = ? 
      AND (e.status_konfirmasi IS NULL OR e.status_konfirmasi != 'Selesai')
      `,
      [id]
    );

    const hasPending = rows[0].pending_count > 0;

    res.json({
      success: true,
      hasPending: hasPending,
      message: hasPending 
        ? "Masih ada laporan belum diterima." 
        : "Semua laporan sudah diterima."
    });

  } catch (err) {
    console.error("❌ Error checkLaporanPending:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal memeriksa status laporan: " + err.message
    });
  }
};