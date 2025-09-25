// =====================================================
// routes/admin/admin.js
// Router untuk halaman dan fitur Admin HMSI
// =====================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// 🔑 Middleware otentikasi & role
const { requireLogin, requireRole } = require("../../middleware/auth");

// 📦 Controller
const keuanganController = require("../../controllers/Admin/keuanganController");
const profileController = require("../../controllers/Admin/profileController");

// =====================================================
// 🏠 Dashboard Admin (Presidium Inti)
// =====================================================
router.get(
  "/dashboard",
  requireLogin,
  requireRole(["Admin"]),
  (req, res) => {
    res.render("admin/adminDashboard", {
      title: "Dashboard Presidium Inti",
      user: req.session.user || { nama: "Admin" },
      activeNav: "dashboard",
    });
  }
);

// =====================================================
// 💰 Kelola Kas / Pemasukan
// =====================================================

// 📄 List pemasukan
router.get(
  "/keuangan",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.getPemasukan
);

// ➕ Tambah pemasukan
router.get(
  "/keuangan/tambah",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.getTambahPemasukan
);
router.post(
  "/keuangan/tambah",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.postTambahPemasukan
);

// ✏️ Edit pemasukan
router.get(
  "/keuangan/edit/:id",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.getEditPemasukan
);
router.post(
  "/keuangan/edit/:id",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.postEditPemasukan
);

// 🗑️ Hapus pemasukan
router.post(
  "/keuangan/delete/:id",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.deletePemasukan
);

// =====================================================
// 💸 Pengeluaran Kas
// =====================================================
router.get(
  "/pengeluaran",
  requireLogin,
  requireRole(["Admin"]),
  keuanganController.getPengeluaran
);

// =====================================================
// 👤 Kelola User
// =====================================================
router.get(
  "/kelola-user",
  requireLogin,
  requireRole(["Admin"]),
  (req, res) => {
    res.render("admin/kelolaUser", {
      title: "Kelola User",
      user: req.session.user || { nama: "Admin" },
      activeNav: "users",
    });
  }
);

// =====================================================
// 👤 Profil Admin
// =====================================================

// 📄 Lihat profil admin
router.get(
  "/profile",
  requireLogin,
  requireRole(["Admin"]),
  profileController.getProfile
);

// 📄 Form edit profil admin
router.get(
  "/profile/edit",
  requireLogin,
  requireRole(["Admin"]),
  profileController.getEditProfile
);

// 💾 Simpan edit profil (pakai multer untuk foto)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public/uploads/profile"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

router.post(
  "/profile/update",
  requireLogin,
  requireRole(["Admin"]),
  upload.single("foto_profile"),
  profileController.postEditProfile
);

// 🌙 Toggle tema
router.post(
  "/profile/toggle-theme",
  requireLogin,
  requireRole(["Admin"]),
  profileController.toggleTheme
);

module.exports = router;
