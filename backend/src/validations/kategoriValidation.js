'use strict';

const Joi = require('joi');

const createKategoriSchema = Joi.object({
  nama: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama kategori minimal 2 karakter',
    'string.max': 'Nama kategori maksimal 100 karakter',
    'any.required': 'Nama kategori wajib diisi',
  }),
  deskripsi: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Deskripsi maksimal 500 karakter',
  }),
  warna: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#7a3dff')
    .messages({
      'string.pattern.base': 'Warna harus format hex (contoh: #7a3dff)',
    }),
});

const updateKategoriSchema = Joi.object({
  nama: Joi.string().min(2).max(100).messages({
    'string.min': 'Nama kategori minimal 2 karakter',
  }),
  deskripsi: Joi.string().max(500).optional().allow(''),
  warna: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .messages({
      'string.pattern.base': 'Warna harus format hex (contoh: #7a3dff)',
    }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});

module.exports = { createKategoriSchema, updateKategoriSchema };
