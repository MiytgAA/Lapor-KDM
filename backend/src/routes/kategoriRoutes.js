'use strict';

const express = require('express');
const router = express.Router();
const {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
} = require('../controllers/kategoriController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { createKategoriSchema, updateKategoriSchema } = require('../validations/kategoriValidation');

// GET  /api/kategori       — public
router.get('/', getAllKategori);

// GET  /api/kategori/:id   — public
router.get('/:id', getKategoriById);

// POST /api/kategori       — admin / super_admin
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'super_admin'),
  validate(createKategoriSchema),
  createKategori
);

// PUT  /api/kategori/:id   — admin / super_admin
router.put(
  '/:id',
  verifyToken,
  requireRole('admin', 'super_admin'),
  validate(updateKategoriSchema),
  updateKategori
);

// DELETE /api/kategori/:id — admin / super_admin
router.delete(
  '/:id',
  verifyToken,
  requireRole('admin', 'super_admin'),
  deleteKategori
);

module.exports = router;
