// =====================================================
// routes/hmsi/hmsi.js
// Routing khusus untuk HMSI (Program Kerja, Laporan, Evaluasi)
// =====================================================

const express = require("express");
const router = express.Router();

const { requireRole } = require("../../middleware/auth");

// =====================================================
// IMPORT CONTROLLERS
// =====================================================
const prokerCtrl = require("../../controllers/HMSI/prokerController");
const laporanCtrl = require("../../controllers/HMSI/laporanController");
const evaluasiCtrl = require("../../controllers/HMSI/evaluasiController");
const notifikasiController = require("../../controllers/HMSI/notifikasiController");

// =====================================================
// IMPORT MIDDLEWARE
// =====================================================
const validateUpload = require("../../middleware/validateUpload");

// =====================================================
// PROGRAM KERJA (PROKER)
// =====================================================

// 📄 Daftar semua proker
router.get("/kelola-proker", prokerCtrl.getAllProker);

// ➕ Form tambah proker
router.get("/tambah-proker", (req, res) => {
  res.render("hmsi/tambahProker", {
    title: "Tambah Proker",
    user: req.session.user || { name: "Ridho Dwi Syhaputra" },
    activeNav: "Program Kerja",
    old: {},
    errorMsg: null,
    successMsg: null,
  });
});

// 💾 Simpan proker baru
router.post("/tambah-proker", validateUpload("create", "proker"), prokerCtrl.createProker);

// 📄 Detail proker
router.get("/proker/:id", prokerCtrl.getDetailProker);

// ✏️ Form edit proker
router.get("/proker/:id/edit", prokerCtrl.getEditProker);

// 💾 Simpan edit proker
router.post("/proker/:id/edit", validateUpload("edit", "proker"), prokerCtrl.updateProker);


router.post("/proker/:id/delete", prokerCtrl.deleteProker);

// ⬇️ Download dokumen pendukung
router.get("/proker/download/:id", prokerCtrl.downloadDokumenPendukung);

// =====================================================
// LAPORAN
// =====================================================

// 📄 Daftar semua laporan
router.get("/laporan", laporanCtrl.getAllLaporan);

// ➕ Form tambah laporan
router.get("/laporan/tambah", laporanCtrl.getFormLaporan);

// 💾 Simpan laporan baru
router.post("/laporan/tambah", validateUpload("create", "laporan"), laporanCtrl.createLaporan);

// 📄 Detail laporan
router.get("/laporan/:id", laporanCtrl.getDetailLaporan);

// ✏️ Form edit laporan
router.get("/laporan/edit/:id", laporanCtrl.getEditLaporan);

// 💾 Simpan edit laporan
router.post("/laporan/edit/:id", validateUpload("edit", "laporan"), laporanCtrl.updateLaporan);

// ❌ Hapus laporan
router.post("/laporan/delete/:id", laporanCtrl.deleteLaporan);

// ⬇️ Download Dokumentasi
router.get("/laporan/download/:id", laporanCtrl.downloadDokumentasi);

// =====================================================
// EVALUASI
// =====================================================

// 📄 Daftar semua evaluasi
router.get("/evaluasi", evaluasiCtrl.getAllEvaluasi);

// 📄 Detail evaluasi
router.get("/evaluasi/:id", evaluasiCtrl.getDetailEvaluasi);

// 💾 Tambah evaluasi
router.post("/evaluasi/create", evaluasiCtrl.createEvaluasi);

// 💾 Update evaluasi
router.post("/evaluasi/update/:id", evaluasiCtrl.updateEvaluasi);

// ❌ Hapus evaluasi
router.post("/evaluasi/delete/:id", evaluasiCtrl.deleteEvaluasi);

// =====================================================
// Notifikasi
// =====================================================

router.get(
  "/notifikasi",
  requireRole("HMSI"),
  notifikasiController.getAllNotifikasi
);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
