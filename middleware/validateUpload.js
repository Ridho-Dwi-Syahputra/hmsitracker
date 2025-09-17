// =====================================================
// middleware/validateUpload.js
// Middleware validasi upload file (Laporan & Program Kerja)
// =====================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Buat folder upload kalau belum ada
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// =====================================================
// KONFIGURASI MULTER
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filter file: hanya PDF, JPG, JPEG, PNG
function fileFilter(req, file, cb) {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const err = new multer.MulterError("LIMIT_UNSUPPORTED_FILETYPE");
    return cb(err, false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// =====================================================
// Middleware validasi upload
// mode: "create" | "edit"
// type: "laporan" | "proker"
// =====================================================
function validateUpload(mode = "create", type = "laporan") {
  return (req, res, next) => {
    // Field berbeda antara laporan & proker
    const fieldName = type === "laporan" ? "dokumentasi" : "dokumen_pendukung";

    upload.single(fieldName)(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        let errorMsg = "Terjadi kesalahan upload file.";
        if (err.code === "LIMIT_FILE_SIZE") {
          errorMsg = "Ukuran file terlalu besar. Maksimal 5MB.";
        } else if (err.code === "LIMIT_UNSUPPORTED_FILETYPE") {
          errorMsg =
            "Format file tidak didukung. Hanya PDF, JPG, JPEG, dan PNG yang diperbolehkan.";
        }

        try {
          if (type === "laporan") {
            // ambil list proker utk dropdown laporan
            const [programs] = await db.query(
              "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
            );

            if (mode === "create") {
              return res.render("hmsi/laporanForm", {
                title: "Tambah Laporan",
                user: req.session.user || { name: "Dummy User" },
                activeNav: "Laporan",
                programs,
                errorMsg,
                successMsg: null,
                old: req.body,
              });
            } else if (mode === "edit") {
              const [rows] = await db.query(
                "SELECT * FROM Laporan WHERE id_laporan = ?",
                [req.params.id]
              );
              if (!rows.length)
                return res.status(404).send("Laporan tidak ditemukan");
              const laporan = rows[0];

              return res.render("hmsi/editLaporan", {
                title: "Edit Laporan",
                user: req.session.user || { name: "Dummy User" },
                activeNav: "Laporan",
                laporan,
                programs,
                errorMsg,
                successMsg: null,
                old: req.body,
              });
            }
          } else if (type === "proker") {
            if (mode === "create") {
              return res.render("hmsi/tambahProker", {
                title: "Tambah Program Kerja",
                user: req.session.user || { name: "Dummy User" },
                activeNav: "Program Kerja",
                errorMsg,
                successMsg: null,
                old: req.body,
              });
            } else if (mode === "edit") {
              const [rows] = await db.query(
                "SELECT * FROM Program_kerja WHERE id_ProgramKerja = ?",
                [req.params.id]
              );
              if (!rows.length)
                return res.status(404).send("Program Kerja tidak ditemukan");
              const proker = rows[0];

              return res.render("hmsi/editProker", {
                title: "Edit Program Kerja",
                user: req.session.user || { name: "Dummy User" },
                activeNav: "Program Kerja",
                proker,
                errorMsg,
                successMsg: null,
                old: req.body,
              });
            }
          }
        } catch (dbErr) {
          console.error("❌ Error reload form:", dbErr.message);
          return res.status(500).send("Gagal memuat ulang form");
        }
      }

      // Kalau tidak ada error, lanjut
      next();
    });
  };
}

module.exports = validateUpload;
