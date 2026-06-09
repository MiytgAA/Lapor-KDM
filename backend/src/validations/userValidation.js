'use strict';

const Joi = require('joi');

const createUserSchema = Joi.object({
  nama: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama minimal 2 karakter',
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
  role: Joi.string().valid('user', 'admin', 'super_admin').default('user').messages({
    'any.only': 'Role harus salah satu dari: user, admin, super_admin',
  }),
});

const updateUserSchema = Joi.object({
  nama: Joi.string().min(2).max(100).messages({
    'string.min': 'Nama minimal 2 karakter',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Format email tidak valid',
  }),
  password: Joi.string().min(6).max(100).messages({
    'string.min': 'Password minimal 6 karakter',
  }),
  role: Joi.string().valid('user', 'admin', 'super_admin').messages({
    'any.only': 'Role harus salah satu dari: user, admin, super_admin',
  }),
  is_active: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});

const filterUserSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  role: Joi.string().valid('user', 'admin', 'super_admin').optional(),
  search: Joi.string().max(100).optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = { createUserSchema, updateUserSchema, filterUserSchema };
