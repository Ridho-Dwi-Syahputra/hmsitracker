// =====================================================
// middleware/auth.js
// Middleware untuk autentikasi & otorisasi
// =====================================================

// ==========================
// 🔒 requireLogin
// ==========================
exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login"); // Belum login → redirect ke halaman login
  }
  next();
};

// ==========================
// 🔓 checkNotLogin
// (Opsional) untuk blokir user login buka halaman login lagi
// ==========================
exports.checkNotLogin = (req, res, next) => {
  if (req.session.user) {
    const role = req.session.user.role;
    if (role === "Admin") return res.redirect("/admin/dashboard");
    if (role === "DPA") return res.redirect("/dpa/dashboard");
    if (role === "HMSI") return res.redirect("/hmsi/dashboard");
  }
  next();
};

// ==========================
// 🧠 requireRole
// roles = array, contoh: ["HMSI"] atau ["Admin", "DPA"]
// ==========================
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }

    const userRole = req.session.user.role;
    if (!roles.includes(userRole)) {
      console.warn(`🚫 Akses ditolak: ${userRole} mencoba akses ${req.originalUrl}`);
      return res.status(403).send("❌ Akses ditolak! Anda tidak memiliki izin.");
    }

    next();
  };
};
