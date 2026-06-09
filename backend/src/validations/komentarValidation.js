'use strict';

const Joi = require('joi');

const createKomentarSchema = Joi.object({
  isi: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Komentar tidak boleh kosong',
    'string.max': 'Komentar maksimal 2000 karakter',
    'any.required': 'Isi komentar wajib diisi',
  }),
});

const updateKomentarSchema = Joi.object({
  isi: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Komentar tidak boleh kosong',
    'string.max': 'Komentar maksimal 2000 karakter',
    'any.required': 'Isi komentar wajib diisi',
  }),
});

module.exports = { createKomentarSchema, updateKomentarSchema };
