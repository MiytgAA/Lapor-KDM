'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  successResponse,
  errorResponse,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/helpers');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nama, email, password } = req.body;

    // Cek email sudah terdaftar
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email sudah terdaftar', 409);
    }

    const user = await User.create({ nama, email, password, role: 'user' });

    return successResponse(
      res,
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      'Registrasi berhasil',
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    if (!user.is_active) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan. Hubungi administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    const tokenPayload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return successResponse(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '24h',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    }, 'Login berhasil');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return errorResponse(res, 'Refresh token tidak valid atau sudah kadaluarsa', 401);
    }

    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      attributes: ['id', 'role'],
    });
    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', 401);
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });

    return successResponse(res, {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '24h',
    }, 'Token berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // Stateless JWT — client cukup buang tokennya
  return successResponse(res, null, 'Logout berhasil');
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    return successResponse(res, user, 'Data profil berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getProfile };
