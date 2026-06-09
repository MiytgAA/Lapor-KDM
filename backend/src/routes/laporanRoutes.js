'use strict';

const express = require('express');
const router = express.Router();
const {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  updateStatus,
} = require('../controllers/laporanController');
const { getKomentar, createKomentar } = require('../controllers/komentarController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const {
  createLaporanSchema,
  updateLaporanSchema,
  updateStatusSchema,
  filterLaporanSchema,
} = require('../validations/laporanValidation');
const { createKomentarSchema } = require('../validations/komentarValidation');
const { uploadMultiple } = require('../config/multer');

// GET  /api/laporan         — public (bisa tanpa token, tapi bisa juga dengan token)
router.get('/', validate(filterLaporanSchema, 'query'), getAllLaporan);

// GET  /api/laporan/:id
router.get('/:id', getLaporanById);

// POST /api/laporan         — perlu login + upload gambar (opsional, max 5)
router.post('/', verifyToken, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, validate(createLaporanSchema), createLaporan);

// PUT  /api/laporan/:id     — perlu login (owner only)
router.put('/:id', verifyToken, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, validate(updateLaporanSchema), updateLaporan);

// DELETE /api/laporan/:id   — perlu login (owner atau admin)
router.delete('/:id', verifyToken, deleteLaporan);

// PATCH /api/laporan/:id/status  — admin / super_admin only
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin', 'super_admin'),
  validate(updateStatusSchema),
  updateStatus
);

// GET  /api/laporan/:id/komentar
router.get('/:id/komentar', getKomentar);

// POST /api/laporan/:id/komentar — perlu login
router.post('/:id/komentar', verifyToken, validate(createKomentarSchema), createKomentar);

module.exports = router;
