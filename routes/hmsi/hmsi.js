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

// =====================================================
// IMPORT CONTROLLERS
// =====================================================
const prokerCtrl = require("../../controllers/HMSI/prokerController");
const laporanCtrl = require("../../controllers/HMSI/laporanController");
const evaluasiCtrl = require("../../controllers/HMSI/evaluasiController");
const notifikasiCtrl = require("../../controllers/HMSI/notifikasiController");
const profileCtrl = require("../../controllers/HMSI/profileController");

// =====================================================
// MIDDLEWARE: Semua route di sini harus login + role HMSI
// =====================================================
router.use(requireLogin, requireRole(["HMSI"]));

// =====================================================
// DASHBOARD HMSI
// =====================================================
router.get("/dashboard", (req, res) => {
  res.render("hmsi/hmsiDashboard", {
    title: "Dashboard HMSI",
    user: req.session.user,
    activeNav: "Dashboard",
  });
});

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
  validateUpload("create", "proker"),
  prokerCtrl.createProker
);
router.get("/proker/:id", prokerCtrl.getDetailProker);
router.get("/proker/:id/edit", prokerCtrl.getEditProker);
router.post(
  "/proker/:id/edit",
  validateUpload("edit", "proker"),
  prokerCtrl.updateProker
);
router.post("/proker/:id/delete", prokerCtrl.deleteProker);
router.get("/proker/download/:id", prokerCtrl.downloadDokumenPendukung);

// =====================================================
// LAPORAN
// =====================================================
router.get("/laporan", laporanCtrl.getAllLaporan);
router.get("/laporan/tambah", laporanCtrl.getFormLaporan);
router.post(
  "/laporan/tambah",
  validateUpload("create", "laporan"),
  laporanCtrl.createLaporan
);
router.get("/laporan/:id", laporanCtrl.getDetailLaporan);
router.get("/laporan/edit/:id", laporanCtrl.getEditLaporan);
router.post(
  "/laporan/edit/:id",
  validateUpload("edit", "laporan"),
  laporanCtrl.updateLaporan
);
router.post("/laporan/delete/:id", laporanCtrl.deleteLaporan);
router.get("/laporan/download/:id", laporanCtrl.downloadDokumentasi);

// =====================================================
// EVALUASI
// =====================================================
router.get("/evaluasi", evaluasiCtrl.getAllEvaluasi);
router.get("/evaluasi/:id", evaluasiCtrl.getDetailEvaluasi);

// ⚡ route baru: komentar HMSI → replace komentar lama
router.post("/evaluasi/:id/komentar", evaluasiCtrl.addKomentar);

// =====================================================
// NOTIFIKASI (klik bubble → tandai terbaca + redirect evaluasi)
// =====================================================
router.get("/notifikasi", notifikasiCtrl.getAllNotifikasi);
router.get("/notifikasi/read/:id", notifikasiCtrl.readAndRedirect);

// =====================================================
// PROFILE
// =====================================================

// ⚡ Setup multer untuk foto profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/profile"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// 📄 Tampilkan halaman profil
router.get("/profile", profileCtrl.getProfile);

// ✏️ Update nama & password
router.post("/profile/update", profileCtrl.updateProfile);

// 🖼️ Upload foto profil
router.post("/profile/upload-foto", upload.single("foto"), profileCtrl.uploadFoto);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
