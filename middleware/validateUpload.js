// =====================================================
// middleware/validateUpload.js
// Middleware validasi upload file (Laporan & Program Kerja)
// =====================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// =====================================================
// Helper: pastikan folder upload tipe tertentu ada
// =====================================================
function ensureUploadFolder(type) {
  const baseDir = path.join(__dirname, "../public/uploads");
  const subDir = path.join(baseDir, type);
  if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
  return subDir;
}

// =====================================================
// KONFIGURASI MULTER (dinamis berdasarkan type)
// =====================================================
function getMulterStorage(type) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = ensureUploadFolder(type);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext);
      const uniqueName = `${base}-${uuidv4()}${ext}`;
      cb(null, uniqueName);
    },
  });
}

// =====================================================
// Filter file: hanya PDF, JPG, JPEG, PNG
// =====================================================
function fileFilter(req, file, cb) {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const err = new multer.MulterError("LIMIT_UNSUPPORTED_FILETYPE");
    return cb(err, false);
  }
  cb(null, true);
}

// =====================================================
// Helper: Render ulang form dengan pesan error
// =====================================================
async function handleUploadError(res, req, mode, type, errorMsg) {
  const user = req.session.user || { name: "Unknown User" };
  console.error("❌ Upload Error:", { mode, type, errorMsg, user: user.id_anggota || "?" });

  try {
    if (type === "laporan") {
      const [programs] = await db.query(
        "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
      );

      if (mode === "create") {
        return res.render("hmsi/laporanForm", {
          title: "Tambah Laporan",
          user,
          activeNav: "Laporan",
          programs,
          errorMsg,
          successMsg: null,
          old: req.body,
        });
      } else {
        const [rows] = await db.query("SELECT * FROM Laporan WHERE id_laporan = ?", [
          req.params.id,
        ]);
        if (!rows.length) return res.status(404).send("Laporan tidak ditemukan");

        return res.render("hmsi/editLaporan", {
          title: "Edit Laporan",
          user,
          activeNav: "Laporan",
          laporan: rows[0],
          programs,
          errorMsg,
          successMsg: null,
          old: req.body,
        });
      }
    }

    if (type === "proker") {
      if (mode === "create") {
        return res.render("hmsi/tambahProker", {
          title: "Tambah Program Kerja",
          user,
          activeNav: "Program Kerja",
          errorMsg,
          successMsg: null,
          old: req.body,
        });
      } else {
        const [rows] = await db.query(
          "SELECT * FROM Program_kerja WHERE id_ProgramKerja = ?",
          [req.params.id]
        );
        if (!rows.length) return res.status(404).send("Program Kerja tidak ditemukan");

        return res.render("hmsi/editProker", {
          title: "Edit Program Kerja",
          user,
          activeNav: "Program Kerja",
          proker: rows[0],
          errorMsg,
          successMsg: null,
          old: req.body,
        });
      }
    }
  } catch (err) {
    console.error("❌ Error reload form:", err.message);
    return res.status(500).send("Gagal memuat ulang form setelah error upload");
  }
}

// =====================================================
// Middleware utama: validasi upload
// mode: "create" | "edit"
// type: "laporan" | "proker"
// =====================================================
function validateUpload(mode = "create", type = "laporan") {
  const storage = getMulterStorage(type);
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
  });

  return (req, res, next) => {
    const fieldName = type === "laporan" ? "dokumentasi" : "dokumen_pendukung";

    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        let errorMsg = "Terjadi kesalahan upload file.";
        if (err.code === "LIMIT_FILE_SIZE") {
          errorMsg = "Ukuran file terlalu besar. Maksimal 5MB.";
        } else if (err.code === "LIMIT_UNSUPPORTED_FILETYPE") {
          errorMsg = "Format file tidak didukung. Hanya PDF, JPG, JPEG, dan PNG.";
        }
        return handleUploadError(res, req, mode, type, errorMsg);
      }

      if (err) {
        console.error("❌ validateUpload -> unknown error:", err.message);
        return handleUploadError(res, req, mode, type, "Gagal mengunggah file.");
      }

      // ✅ Upload sukses
      next();
    });
  };
}

module.exports = validateUpload;
