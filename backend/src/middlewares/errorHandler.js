'use strict';

const { ValidationError: SequelizeValidationError, UniqueConstraintError } = require('sequelize');
const multer = require('multer');

/**
 * Global error handler middleware
 * Harus didaftarkan terakhir di app.js
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // ── Sequelize Validation Error ─────────────────────────────────────────────
  if (err instanceof SequelizeValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validasi database gagal',
      errors,
    });
  }

  // ── Sequelize Unique Constraint Error ──────────────────────────────────────
  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} sudah digunakan`,
    }));
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada',
      errors,
    });
  }

  // ── Multer Error ───────────────────────────────────────────────────────────
  if (err instanceof multer.MulterError) {
    let message = 'Error upload file';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `Ukuran file terlalu besar. Maksimal ${(parseInt(process.env.MAX_FILE_SIZE) / 1024 / 1024).toFixed(0)}MB per file.`;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Terlalu banyak file. Maksimal 5 gambar per laporan.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Field file tidak sesuai.';
    }
    return res.status(400).json({ success: false, message });
  }

  // ── Custom error dengan status code ───────────────────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ── Default 500 Internal Server Error ─────────────────────────────────────
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan internal server'
        : err.message,
  });
};

module.exports = errorHandler;
