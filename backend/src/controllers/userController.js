'use strict';

const { Op } = require('sequelize');
const { User } = require('../models');
const { successResponse, errorResponse, getPagination } = require('../utils/helpers');

// GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, search, is_active } = req.query;
    const { meta, offset, limit: perPage } = getPagination(page, limit, 0);

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: perPage,
      offset,
    });

    const pagination = { ...meta, total: count, totalPages: Math.ceil(count / perPage) };
    return successResponse(res, rows, 'Daftar user berhasil diambil', 200, pagination);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    return successResponse(res, user, 'Data user berhasil diambil');
  } catch (error) {
    next(error);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return errorResponse(res, 'Email sudah terdaftar', 409);

    const user = await User.create({ nama, email, password, role: role || 'user' });

    return successResponse(
      res,
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      'User berhasil dibuat',
      201
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    // Cek email tidak duplikat jika diubah
    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ where: { email: req.body.email } });
      if (existing) return errorResponse(res, 'Email sudah digunakan', 409);
    }

    await user.update(req.body);

    const updated = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    return successResponse(res, updated, 'Data user berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    // Jangan hapus diri sendiri
    if (user.id === req.user.id) {
      return errorResponse(res, 'Tidak dapat menghapus akun sendiri', 400);
    }

    // Nonaktifkan daripada hard delete (agar data laporan tidak hilang)
    await user.update({ is_active: false });
    return successResponse(res, null, 'User berhasil dinonaktifkan');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
