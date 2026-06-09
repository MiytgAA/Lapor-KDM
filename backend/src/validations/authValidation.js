'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
  nama: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 100 karakter',
    'any.required': 'Nama wajib diisi',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'Refresh token wajib diisi',
  }),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
