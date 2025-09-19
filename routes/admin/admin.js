const express = require("express");
const router = express.Router();

// 🔑 Import middleware auth
const { requireLogin, requireRole } = require("../../middleware/auth");

// =====================================================
// 🏠 Dashboard Admin
// =====================================================
router.get("/dashboard", requireLogin, requireRole(["Admin"]), (req, res) => {
  res.render("admin/adminDashboard", {
    title: "Admin Dashboard",
    user: req.session.user || { name: "Admin" },
    activeNav: "Dashboard"
  });
});

// =====================================================
// 💰 Kelola Kas
// =====================================================
router.get("/kelola-kas", requireLogin, requireRole(["Admin"]), (req, res) => {
  res.render("admin/kelolaKas", {
    title: "Kelola Kas",
    user: req.session.user || { name: "Admin" },
    activeNav: "Kelola Kas"
  });
});

// =====================================================
// 👤 Kelola User
// =====================================================
router.get("/kelola-user", requireLogin, requireRole(["Admin"]), (req, res) => {
  res.render("admin/kelolaUser", {
    title: "Kelola User",
    user: req.session.user || { name: "Admin" },
    activeNav: "Kelola User"
  });
});

module.exports = router;
