'use strict';

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statistikController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// GET /api/statistik/dashboard  — admin / super_admin
router.get(
  '/dashboard',
  verifyToken,
  requireRole('admin', 'super_admin'),
  getDashboardStats
);

module.exports = router;
