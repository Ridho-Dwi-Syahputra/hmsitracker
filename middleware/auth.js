// middleware/auth.js
// Middleware untuk autentikasi & otorisasi

// ==========================
// Middleware requireLogin
// ==========================
exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login"); // jika belum login, redirect ke login
  }
  next();
};

// ==========================
// Middleware requireRole
// ==========================
// roles = array, contoh: ["HMSI"] atau ["Admin", "DPA"]
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).send("❌ Akses ditolak!");
    }
    next();
  };
};
