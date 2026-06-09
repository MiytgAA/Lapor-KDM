'use strict';

const jwt = require('jsonwebtoken');

/**
 * Format response sukses standar
 */
const successResponse = (res, data, message = 'Berhasil', statusCode = 200, pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

/**
 * Format response error standar
 */
const errorResponse = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Hitung pagination metadata
 */
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / perPage);
  const offset = (currentPage - 1) * perPage;

  return {
    meta: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages,
    },
    offset,
    limit: perPage,
  };
};

/**
 * Buat custom error dengan status code
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Bangun URL publik untuk file upload
 */
const buildFileUrl = (req, filename) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

module.exports = {
  successResponse,
  errorResponse,
  generateAccessToken,
  generateRefreshToken,
  getPagination,
  createError,
  buildFileUrl,
};
