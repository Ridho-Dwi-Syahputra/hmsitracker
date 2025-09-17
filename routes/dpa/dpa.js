// =====================================================
// routes/dpa/dpa.js
// Routing untuk DPA (Dashboard DPA, Proker, Laporan, Evaluasi, Notifikasi)
// =====================================================

const express = require("express");
const router = express.Router();
const { requireRole } = require("../../middleware/auth");

// Import controller untuk DPA (Program Kerja & Laporan)
const dpaProkerController = require("../../controllers/DPA/prokerController");
const dpaLaporanController = require("../../controllers/DPA/laporanController");

// =====================================================
// 🏠 Dashboard DPA
// =====================================================
router.get("/dashboard", requireRole("DPA"), (req, res) => {
  res.render("dpa/dpaDashboard", {
    title: "Dashboard DPA",
    user: req.session.user || { name: "Dummy User" },
    activeNav: "Dashboard",
  });
});

// =====================================================
// 📋 Daftar Program Kerja (Read-only)
// =====================================================
router.get(
  "/lihatProker",
  requireRole("DPA"),
  dpaProkerController.getAllProkerDPA
);

// =====================================================
// 📄 Detail Program Kerja (Read-only)
// =====================================================
router.get(
  "/proker/:id/detail",
  requireRole("DPA"),
  dpaProkerController.getDetailProkerDPA
);

// =====================================================
// 📑 Daftar Laporan (Read-only untuk DPA)
// =====================================================
router.get(
  "/kelolaLaporan",
  requireRole("DPA"),
  dpaLaporanController.getAllLaporanDPA
);

// =====================================================
// 📄 Detail Laporan (Read-only + lihat evaluasi)
// =====================================================
router.get(
  "/laporan/:id",
  requireRole("DPA"),
  dpaLaporanController.getDetailLaporanDPA
);

// =====================================================
// 📝 Evaluasi Laporan
// =====================================================
// Form evaluasi
router.get(
  "/laporan/:id/evaluasi",
  requireRole("DPA"),
  dpaLaporanController.getFormEvaluasi
);

// Simpan evaluasi
router.post(
  "/laporan/:id/evaluasi",
  requireRole("DPA"),
  dpaLaporanController.postEvaluasi
);

// =====================================================
// 📋 Kelola Evaluasi (list semua evaluasi yang sudah dibuat)
// =====================================================
router.get(
  "/kelolaEvaluasi",
  requireRole("DPA"),
  dpaLaporanController.getAllEvaluasiDPA
);

// =====================================================
// 🔔 Notifikasi DPA (opsional, nanti buat controller terpisah)
// =====================================================
// router.get("/notifikasi", requireRole("DPA"), dpaNotifikasiController.getAllNotifikasi);

module.exports = router;
