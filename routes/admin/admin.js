const express = require('express');
const router = express.Router();
const { requireRole } = require('../../middleware/auth');

router.get('/dashboard', requireRole('Admin'), (req, res) => {
  res.render('admin/dashboard', { 
    title: 'Dashboard Admin',
    user: req.session.user
  });
});

module.exports = router;
