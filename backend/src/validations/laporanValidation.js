'use strict';

const Joi = require('joi');

const createLaporanSchema = Joi.object({
  judul: Joi.string().min(5).max(255).required().messages({
    'string.min': 'Judul minimal 5 karakter',
    'string.max': 'Judul maksimal 255 karakter',
    'any.required': 'Judul laporan wajib diisi',
  }),
  deskripsi: Joi.string().min(10).required().messages({
    'string.min': 'Deskripsi minimal 10 karakter',
    'any.required': 'Deskripsi laporan wajib diisi',
  }),
  kategori_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Kategori harus berupa angka',
    'any.required': 'Kategori wajib dipilih',
  }),
});

const updateLaporanSchema = Joi.object({
  judul: Joi.string().min(5).max(255).messages({
    'string.min': 'Judul minimal 5 karakter',
    'string.max': 'Judul maksimal 255 karakter',
  }),
  deskripsi: Joi.string().min(10).messages({
    'string.min': 'Deskripsi minimal 10 karakter',
  }),
  kategori_id: Joi.number().integer().positive().messages({
    'number.base': 'Kategori harus berupa angka',
  }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'approved', 'rejected')
    .required()
    .messages({
      'any.only': 'Status harus salah satu dari: pending, approved, rejected',
      'any.required': 'Status wajib diisi',
    }),
  komentar: Joi.string().max(500).optional().messages({
    'string.max': 'Komentar status maksimal 500 karakter',
  }),
});

const filterLaporanSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  kategori_id: Joi.number().integer().positive().optional(),
  search: Joi.string().max(100).optional(),
  sort: Joi.string().valid('newest', 'oldest').default('newest'),
  user_id: Joi.number().integer().positive().optional(),
});

module.exports = {
  createLaporanSchema,
  updateLaporanSchema,
  updateStatusSchema,
  filterLaporanSchema,
};
