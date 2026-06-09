'use strict';

const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validations/authValidation');

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// POST /api/auth/logout
router.post('/logout', verifyToken, logout);

// GET /api/auth/profile
router.get('/profile', verifyToken, getProfile);

module.exports = router;
