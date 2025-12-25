// routes/index.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  // Redirect langsung ke halaman login
  res.redirect('/auth/login');
});

router.get('/dbtest', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_users FROM `User`');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB Test Error: ' + err.message);
  }
});

module.exports = router;
