const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // perhatikan path, karena file ada di routes/auth/

// GET login page
router.get('/login', (req, res) => {
  res.render('auth/login', { title: "Login" });
});

// POST login process
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  db.query("SELECT * FROM User WHERE email = ? AND role = ?", [email, role], (err, results) => {
    if (err) return res.status(500).send("DB Error");
    if (results.length === 0) return res.status(401).send("User tidak ditemukan");

    const user = results[0];
    if (user.password !== password) return res.status(401).send("Password salah");

    req.session.user = {
      id: user.id_anggota,
      name: user.nama,
      role: user.role
    };

    // Redirect sesuai role
    if (user.role === "HMSI") return res.redirect("/hmsi/dashboard");
    if (user.role === "DPA") return res.redirect("/dpa/dashboard");
    if (user.role === "Admin") return res.redirect("/admin/dashboard");
  });
});

module.exports = router;
