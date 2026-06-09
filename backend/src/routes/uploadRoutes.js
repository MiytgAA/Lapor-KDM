'use strict';

const express = require('express');
const router = express.Router();
const { uploadGambar } = require('../controllers/uploadController');
const { verifyToken } = require('../middlewares/auth');
const { uploadMultiple } = require('../config/multer');

// POST /api/upload  — perlu login
router.post('/', verifyToken, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadGambar);

module.exports = router;
