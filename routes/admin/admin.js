// =====================================================
// routes/admin/admin.js
// Router untuk halaman dan fitur Admin HMSI (Kode 2 MODIFIKASI)
// =====================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// 🔑 Middleware otentikasi & role
const { requireLogin, requireRole } = require("../../middleware/auth");

// 📦 Controller
const keuanganController = require("../../controllers/admin/keuanganController");
const profileController = require("../../controllers/admin/profileController");
const userController = require("../../controllers/admin/userController");
const divisiController = require("../../controllers/admin/divisiController");

// =====================================================
// 🏠 Dashboard Admin
// =====================================================
router.get(
    "/dashboard",
    requireLogin,
    requireRole(["Admin"]),
    // Menggunakan controller eksternal yang baru diimpor
    adminDashboardController.getDashboard
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

// 📄 Daftar user
router.get(
    "/kelola-user",
    requireLogin,
    requireRole(["Admin"]),
    userController.getAllUsers
);

// ➕ Tambah user
router.get(
    "/user/tambah",
    requireLogin,
    requireRole(["Admin"]),
    userController.getTambahUser
);
router.post(
    "/user/tambah",
    requireLogin,
    requireRole(["Admin"]),
    userController.postTambahUser
);

// ✏️ Edit user
router.get(
    "/user/edit/:id",
    requireLogin,
    requireRole(["Admin"]),
    userController.getEditUser
);
router.post(
    "/user/edit/:id",
    requireLogin,
    requireRole(["Admin"]),
    userController.postEditUser
);

// 🗑️ Hapus user
router.post(
    "/user/delete/:id",
    requireLogin,
    requireRole(["Admin"]),
    userController.deleteUser
);

// =====================================================
// ===> KODE BARU DITAMBAHKAN DI SINI <===
// =====================================================
// 🔍 API untuk cek aktivitas user sebelum hapus (AJAX/Fetch)
router.get(
    "/user/check-activity/:id",
    requireLogin,
    requireRole(["Admin"]),
    userController.checkUserActivity
);

// =====================================================
// 🧩 Kelola Divisi
// =====================================================

// 📄 Halaman kelola divisi
router.get(
    "/kelola-divisi",
    requireLogin,
    requireRole(["Admin"]),
    divisiController.getKelolaDivisi
);

// ➕ Tambah divisi baru (cocok dengan form action="/admin/divisi/tambah")
router.post(
    "/divisi/tambah",
    requireLogin,
    requireRole(["Admin"]),
    divisiController.addDivisi
);

// ✏️ Update divisi
router.post(
    "/divisi/update",
    requireLogin,
    requireRole(["Admin"]),
    divisiController.updateDivisi
);

// 🗑️ Hapus divisi
router.get(
    "/divisi/delete/:id_divisi",
    requireLogin,
    requireRole(["Admin"]),
    divisiController.deleteDivisi
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
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname)
        );
    },
});
const upload = multer({ storage });

// 💾 Update profil admin
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