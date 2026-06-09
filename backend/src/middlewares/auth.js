'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware verifikasi JWT token
 * Attach req.user = { id, role, nama, email }
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token kadaluarsa. Silakan login kembali.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.',
      });
    }

    // Cek user masih ada dan aktif
    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      attributes: ['id', 'nama', 'email', 'role', 'avatar_url', 'is_active'],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan atau sudah dinonaktifkan.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken };
