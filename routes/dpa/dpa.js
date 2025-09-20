// =====================================================
// routes/dpa/dpa.js
// Routing untuk DPA (Dashboard, Proker, Laporan, Evaluasi, Notifikasi)
// =====================================================

const express = require("express");
const router = express.Router();

// 🔑 Middleware auth
const { requireLogin, requireRole } = require("../../middleware/auth");

// 📂 Controllers
const dpaProkerController = require("../../controllers/DPA/prokerController");
const dpaLaporanController = require("../../controllers/DPA/laporanController");
const dpaNotifikasiController = require("../../controllers/DPA/notifikasiController");

// =====================================================
// 🏠 Dashboard DPA
// =====================================================
router.get(
  "/dashboard",
  requireLogin,
  requireRole(["DPA"]),
  (req, res) => {
    res.render("dpa/dpaDashboard", {
      title: "Dashboard DPA",
      user: req.session.user || { name: "Dummy User" },
      activeNav: "Dashboard",
    });
  }
);

// =====================================================
// 📋 Program Kerja
// =====================================================
router.get(
  "/lihatProker",
  requireLogin,
  requireRole(["DPA"]),
  dpaProkerController.getAllProkerDPA
);

router.get(
  "/lihatProker/:id/detail",
  requireLogin,
  requireRole(["DPA"]),
  dpaProkerController.getDetailProkerDPA
);

// 📌 Alias route untuk konsistensi (misal dari notifikasi / view langsung)
router.get(
  "/proker/:id/detail",
  requireLogin,
  requireRole(["DPA"]),
  dpaProkerController.getDetailProkerDPA
);

// =====================================================
// 📑 Laporan
// =====================================================
router.get(
  "/kelolaLaporan",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getAllLaporanDPA
);

router.get(
  "/kelolaLaporan/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getDetailLaporanDPA
);

// 📌 Alias route: /dpa/laporan/:id
router.get(
  "/laporan/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getDetailLaporanDPA
);

// =====================================================
// 📝 Evaluasi Laporan
// =====================================================

// versi kelolaLaporan
router.get(
  "/kelolaLaporan/:id/evaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getFormEvaluasi
);

router.post(
  "/kelolaLaporan/:id/evaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.postEvaluasi
);

// 📌 Alias route: /dpa/laporan/:id/evaluasi
router.get(
  "/laporan/:id/evaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getFormEvaluasi
);

router.post(
  "/laporan/:id/evaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.postEvaluasi
);

// =====================================================
// 📊 Kelola Evaluasi
// =====================================================
router.get(
  "/kelolaEvaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getAllEvaluasiDPA
);

// =====================================================
// 🔔 Notifikasi DPA
// =====================================================
router.get(
  "/dpaNotifikasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.getAllNotifikasi
);

// 📌 Klik notifikasi = otomatis tandai sudah dibaca + redirect
router.get(
  "/notifikasi/read/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.readAndRedirect
);

module.exports = router;
