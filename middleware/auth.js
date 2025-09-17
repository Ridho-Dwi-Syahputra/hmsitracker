// middleware/auth.js

// Cek apakah user sudah login
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/auth/login');
}

// // Cek role tertentu
// function requireRole(role) {
//   return function (req, res, next) {
//     if (req.session && req.session.user && req.session.user.role === role) {
//       return next();
//     }
//     return res.status(403).send('Forbidden: Anda tidak punya akses');
//   };
// }

function requireRole(role) {
  return (req, res, next) => {
    // 🔴 OFF AUTH: langsung bypass
    req.session.user = { id: 1, name: "Dummy User", role: role };
    return next();
  };
}

module.exports = {
  isLoggedIn,
  requireRole
};
