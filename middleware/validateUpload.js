// =====================================================
// middleware/validateUpload.js
// Middleware validasi upload file (Laporan & Program Kerja)
// Dilengkapi logging & perbaikan bug double-next
// =====================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// =====================================================
// Buat folder upload jika belum ada
// =====================================================
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.info(`[INFO] validateUpload -> created upload dir: ${uploadDir}`);
}

// =====================================================
// KONFIGURASI MULTER
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.debug("[DEBUG] validateUpload -> saving to uploadDir:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${baseName}-${uuidv4()}${ext}`;
    console.debug("[DEBUG] validateUpload -> generated filename:", uniqueName);
    cb(null, uniqueName);
  },
});

// =====================================================
// Filter file: hanya PDF, JPG, JPEG, PNG
// =====================================================
function fileFilter(req, file, cb) {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    console.warn("[WARN] validateUpload -> unsupported file type:", file.mimetype);
    const err = new multer.MulterError("LIMIT_UNSUPPORTED_FILETYPE");
    return cb(err, false);
  }
  console.debug("[DEBUG] validateUpload -> accepted file:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
  });
  cb(null, true);
}

// =====================================================
// Inisialisasi upload
// =====================================================
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// =====================================================
// Helper: Render ulang form dengan pesan error
// =====================================================
async function handleUploadError(res, req, mode, type, errorMsg) {
  const user = req.session.user || { name: "Unknown User" };
  console.error("❌ Upload Error:", { mode, type, errorMsg, user: user.id || "?" });

  try {
    if (type === "laporan") {
      const [programs] = await db.query(
        "SELECT id_ProgramKerja AS id, Nama_ProgramKerja AS namaProker FROM Program_kerja"
      );

      if (mode === "create") {
        console.debug("[DEBUG] handleUploadError -> reload laporanForm (create)");
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
        console.debug("[DEBUG] handleUploadError -> reload editLaporan (edit)");
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
        console.debug("[DEBUG] handleUploadError -> reload tambahProker (create)");
        return res.render("hmsi/tambahProker", {
          title: "Tambah Program Kerja",
          user,
          activeNav: "Program Kerja",
          errorMsg,
          successMsg: null,
          old: req.body,
        });
      } else {
        console.debug("[DEBUG] handleUploadError -> reload editProker (edit)");
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
  return (req, res, next) => {
    const fieldName = type === "laporan" ? "dokumentasi" : "dokumen_pendukung";
    console.debug(`[DEBUG] validateUpload(${mode}, ${type}) -> fieldName: ${fieldName}`);

    upload.single(fieldName)(req, res, (err) => {
      // Error dari multer (ukuran, tipe file, dll)
      if (err instanceof multer.MulterError) {
        let errorMsg = "Terjadi kesalahan upload file.";
        if (err.code === "LIMIT_FILE_SIZE") {
          errorMsg = "Ukuran file terlalu besar. Maksimal 5MB.";
        } else if (err.code === "LIMIT_UNSUPPORTED_FILETYPE") {
          errorMsg = "Format file tidak didukung. Hanya PDF, JPG, JPEG, dan PNG.";
        }
        console.warn("[WARN] validateUpload -> multer error:", err.code, errorMsg);
        return handleUploadError(res, req, mode, type, errorMsg);
      }

      // Error lain (misalnya IO error)
      if (err) {
        console.error("❌ validateUpload -> unknown error:", err.message);
        return handleUploadError(res, req, mode, type, "Gagal mengunggah file.");
      }

      // ✅ Upload sukses
      console.debug("[DEBUG] validateUpload -> success", {
        mode,
        type,
        file: req.file ? req.file.filename : "no file uploaded",
      });

      return next(); // <-- ✅ penting: hanya satu kali next()
    });
  };
}

module.exports = validateUpload;
