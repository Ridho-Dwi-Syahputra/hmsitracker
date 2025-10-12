// =====================================================
// routes/dpa/dpa.js
// Routing untuk DPA (Dashboard, Proker, Laporan, Evaluasi, Notifikasi, Profile)
// =====================================================

const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// =====================================================
// IMPORT AUTH & MIDDLEWARE
// =====================================================
const { requireLogin, requireRole } = require("../../middleware/auth");

// =====================================================
// IMPORT CONTROLLERS
// =====================================================
const dpaDashboardController = require("../../controllers/DPA/dpaDashboardController");
const dpaProkerController = require("../../controllers/DPA/prokerController");
const dpaLaporanController = require("../../controllers/DPA/laporanController");
const dpaNotifikasiController = require("../../controllers/DPA/notifikasiController");
const dpaProfileController = require("../../controllers/DPA/profileController");

// =====================================================
// DASHBOARD DPA
// =====================================================
router.get(
  "/dashboard",
  requireLogin,
  requireRole(["DPA"]),
  dpaDashboardController.getDpaDashboardStats
);

// =====================================================
// PROGRAM KERJA (PROKER)
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

// 📌 Alias route untuk konsistensi
router.get(
  "/proker/:id/detail",
  requireLogin,
  requireRole(["DPA"]),
  dpaProkerController.getDetailProkerDPA
);

// 🔄 Update Status Proker (DPA → tandai Selesai / Gagal)
router.post(
  "/proker/:id/status",
  requireLogin,
  requireRole(["DPA"]),
  dpaProkerController.updateStatusProker
);

// =====================================================
// LAPORAN
// =====================================================
// Halaman untuk laporan yang BELUM dievaluasi
router.get(
  "/kelolaLaporan",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getAllLaporanDPA
);

// ✅ BARU: Halaman untuk laporan yang SUDAH dievaluasi (Diterima)
router.get(
  "/laporanDiterima",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getLaporanDiterima
);

// Rute ini sekarang menjadi DETAIL untuk laporan apa pun, terlepas dari statusnya
router.get(
  "/laporan/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getDetailLaporanDPA
);


// =====================================================
// EVALUASI LAPORAN
// =====================================================
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
// KELOLA EVALUASI (list semua evaluasi oleh DPA)
// =====================================================
router.get(
  "/kelolaEvaluasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaLaporanController.getAllEvaluasiDPA
);

// =====================================================
// 🔔 NOTIFIKASI DPA (Gabungan: Proker, Laporan, Evaluasi)
// =====================================================

// 📄 Tampilkan semua notifikasi di satu halaman
router.get(
  "/notifikasi",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.getAllNotifikasi
);

// 📩 Klik notifikasi → tandai dibaca + redirect aman
router.get(
  "/readNotifikasi/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.readAndRedirect
);

// 🟢 Tandai notifikasi sebagai sudah dibaca (manual)
router.get(
  "/notifikasi/mark/:id",
  requireLogin,
  requireRole(["DPA"]),
  dpaNotifikasiController.markAsRead
);

// =====================================================
// PROFILE DPA
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

// 💾 Update profil (nama wajib, password & foto opsional)
router.post(
  "/profile/update",
  requireLogin,
  requireRole(["DPA"]),
  upload.single("foto_profile"),
  dpaProfileController.postEditProfile
);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;