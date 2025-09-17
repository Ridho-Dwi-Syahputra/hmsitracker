// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('User route works!');
});

module.exports = router; // <- WAJIB
