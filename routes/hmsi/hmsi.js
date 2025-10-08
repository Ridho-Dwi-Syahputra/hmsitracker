// routes/hmsi/hmsi.js
// =====================================================
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
const prokerCtrl = require("../../controllers/HMSI/prokerController");
const laporanCtrl = require("../../controllers/HMSI/laporanController");
const evaluasiCtrl = require("../../controllers/HMSI/evaluasiController");
const notifikasiCtrl = require("../../controllers/HMSI/notifikasiController");
const profileCtrl = require("../../controllers/HMSI/profileController");
const dashboardCtrl = require("../../controllers/HMSI/dashboardController");

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
router.get("/kelola-proker", prokerCtrl.getAllProker);

router.get("/tambah-proker", (req, res) => {
  res.render("hmsi/tambahProker", {
    title: "Tambah Proker",
    user: req.session.user,
    activeNav: "Program Kerja",
    old: {},
    errorMsg: null,
    successMsg: null,
  });
});

router.post(
  "/tambah-proker",
  rateLimiter,
  validateUpload("create", "proker"),
  prokerCtrl.createProker
);

router.get("/proker/:id", prokerCtrl.getDetailProker);
router.get("/proker/:id/edit", prokerCtrl.getEditProker);

router.post(
  "/proker/:id/edit",
  rateLimiter,
  validateUpload("edit", "proker"),
  prokerCtrl.updateProker
);

router.post("/proker/:id/delete", rateLimiter, prokerCtrl.deleteProker);
router.get("/proker/download/:id", prokerCtrl.downloadDokumenPendukung);

// =====================================================
// LAPORAN
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

// ⚠️ Letakkan paling bawah — karena ini wildcard
router.get("/laporan/:id", laporanCtrl.getDetailLaporan);

// =====================================================
// EVALUASI
// =====================================================
router.get("/evaluasi", evaluasiCtrl.getAllEvaluasi);
router.get("/evaluasi/:id", evaluasiCtrl.getDetailEvaluasi);

// ⚡ HMSI menambahkan komentar evaluasi
router.post("/evaluasi/:id/komentar", rateLimiter, evaluasiCtrl.addKomentar);

// =====================================================
// NOTIFIKASI
// =====================================================
router.get("/notifikasi", notifikasiCtrl.getAllNotifikasi);
router.get("/notifikasi/read/:id", notifikasiCtrl.readAndRedirect);

// =====================================================
// PROFILE
// =====================================================

// 📄 Lihat profil
router.get("/profile", profileCtrl.getProfile);

// ✏️ Form edit profil
router.get("/profile/edit", profileCtrl.getEditProfile);

// ⚡ Konfigurasi Multer untuk upload foto profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profile");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage: storage });

// 💾 Update profil (nama wajib, password & foto opsional)
router.post(
  "/profile/update",
  rateLimiter,
  upload.single("foto_profile"),
  profileCtrl.postEditProfile
);

// 🌙 Toggle Dark/Light Mode
router.post("/profile/toggle-theme", rateLimiter, profileCtrl.toggleTheme);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
