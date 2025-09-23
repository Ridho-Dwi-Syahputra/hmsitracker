// =====================================================
// routes/dpa/dpa.js
// Routing untuk DPA (Dashboard, Proker, Laporan, Evaluasi, Notifikasi, Profile)
// =====================================================

const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// 🔑 Middleware auth
const { requireLogin, requireRole } = require("../../middleware/auth");

// 📂 Controllers
const dpaProkerController = require("../../controllers/DPA/prokerController");
const dpaLaporanController = require("../../controllers/DPA/laporanController");
const dpaNotifikasiController = require("../../controllers/DPA/notifikasiController");
const dpaProfileController = require("../../controllers/DPA/profileController");

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
      user: req.session.user,
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

// 📌 Alias untuk konsistensi
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

// versi dari kelolaLaporan
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
// 📊 Kelola Evaluasi (list semua evaluasi yang pernah dibuat DPA)
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

// (opsional) tandai dibaca manual
router.get(
  "/notifikasi/mark/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.markAsRead
);

// =====================================================
// 👤 Profile DPA
// =====================================================

// 📄 Lihat profil
router.get(
  "/profile",
  requireLogin,
  requireRole(["DPA"]),
  dpaProfileController.getProfile
);

// ✏️ Form edit profil
router.get(
  "/profile/edit",
  requireLogin,
  requireRole(["DPA"]),
  dpaProfileController.getEditProfile
);

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

// 💾 Update profil (nama wajib, password & foto opsional via file upload)
router.post(
  "/profile/update",
  requireLogin,
  requireRole(["DPA"]),
  upload.single("foto_profile"),
  dpaProfileController.postEditProfile
);

module.exports = router;
