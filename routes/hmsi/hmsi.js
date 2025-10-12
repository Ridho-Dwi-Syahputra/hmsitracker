// =====================================================
// routes/hmsi/hmsi.js
// Routing khusus untuk HMSI (Dashboard, Proker, Laporan, Evaluasi, Notifikasi, Profile)
// =====================================================

const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// =====================================================
// IMPORT AUTH & MIDDLEWARE
// =====================================================
const { requireLogin, requireRole } = require("../../middleware/auth");
const validateUpload = require("../../middleware/validateUpload");
const rateLimiter = require("../../middleware/rateLimiter");

// =====================================================
// IMPORT CONTROLLERS
// =====================================================
const prokerCtrl = require("../../controllers/hmsi/prokerController");
const laporanCtrl = require("../../controllers/hmsi/laporanController");
const evaluasiCtrl = require("../../controllers/hmsi/evaluasiController");
const notifikasiCtrl = require("../../controllers/hmsi/notifikasiController");
const profileCtrl = require("../../controllers/hmsi/profileController");
const dashboardCtrl = require("../../controllers/hmsi/dashboardController");

// =====================================================
// MIDDLEWARE: Semua route di sini harus login + role HMSI
// =====================================================
router.use(requireLogin, requireRole(["HMSI"]));

// =====================================================
// DASHBOARD HMSI
// =====================================================
router.get("/dashboard", dashboardCtrl.getDashboardStats);

// =====================================================
// PROGRAM KERJA (PROKER)
// =====================================================

// 📋 Daftar proker
router.get("/kelola-proker", prokerCtrl.getAllProker);

// 🆕 Form tambah proker
router.get("/tambah-proker", (req, res) => {
  res.render("hmsi/tambahProker", {
    title: "Tambah Proker",
    user: req.session.user,
    activeNav: "proker",
    old: {},
    errorMsg: null,
    successMsg: null,
  });
});

// 💾 Tambah proker baru
router.post(
  "/tambah-proker",
  rateLimiter,
  validateUpload("create", "proker"),
  prokerCtrl.createProker
);

// 📄 Detail satu proker
router.get("/proker/:id", prokerCtrl.getDetailProker);

// ✏️ Form edit proker
router.get("/proker/:id/edit", prokerCtrl.getEditProker);

// 💾 Update proker
router.post(
  "/proker/:id/edit",
  rateLimiter,
  validateUpload("edit", "proker"),
  prokerCtrl.updateProker
);

// ❌ Hapus proker
router.post("/proker/:id/delete", rateLimiter, prokerCtrl.deleteProker);

// ⬇️ Download dokumen pendukung proker
router.get("/proker/download/:id", prokerCtrl.downloadDokumenPendukung);

// =====================================================
// LAPORAN (PENGAJUAN)
// =====================================================
router.get("/laporan", laporanCtrl.getAllLaporan);
router.get("/laporan/tambah", laporanCtrl.getFormLaporan);

router.post(
  "/laporan/tambah",
  rateLimiter,
  validateUpload("create", "laporan"),
  laporanCtrl.createLaporan
);

router.get("/laporan/edit/:id", laporanCtrl.getEditLaporan);

router.post(
  "/laporan/edit/:id",
  rateLimiter,
  validateUpload("edit", "laporan"),
  laporanCtrl.updateLaporan
);

router.post("/laporan/delete/:id", rateLimiter, laporanCtrl.deleteLaporan);
router.get("/laporan/download/:id", laporanCtrl.downloadDokumentasi);

// ⚠️ Harus paling bawah karena wildcard
router.get("/laporan/:id", laporanCtrl.getDetailLaporan);

// =====================================================
// EVALUASI LAPORAN (PERLU REVISI)
// =====================================================
router.get("/kelola-evaluasi", evaluasiCtrl.getKelolaEvaluasi);
router.get("/kelola-evaluasi/:id", evaluasiCtrl.getDetailEvaluasi);
router.post(
  "/kelola-evaluasi/:id/komentar",
  rateLimiter,
  evaluasiCtrl.addKomentar
);

// =====================================================
// ✅ BLOK ROUTE BARU YANG DITAMBAHKAN
// LAPORAN DITERIMA (SELESAI)
// =====================================================
router.get("/laporan-selesai", laporanCtrl.getLaporanSelesai);
router.get("/laporan-selesai/:idLaporan/detail", laporanCtrl.getDetailLaporanSelesai);

// =====================================================
// NOTIFIKASI
// =====================================================
router.get("/notifikasi", notifikasiCtrl.getAllNotifikasi);
router.get("/notifikasi/read/:id", notifikasiCtrl.readAndRedirect);

// =====================================================
// PROFIL HMSI
// =====================================================
router.get("/profile", profileCtrl.getProfile);
router.get("/profile/edit", profileCtrl.getEditProfile);

// ⚙️ Konfigurasi Upload foto profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public/uploads/profile"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

// 💾 Update profil HMSI
router.post(
  "/profile/update",
  rateLimiter,
  upload.single("foto_profile"),
  profileCtrl.postEditProfile
);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;