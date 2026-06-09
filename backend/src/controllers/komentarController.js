'use strict';

const { Komentar, Laporan, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/laporan/:id/komentar
const getKomentar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    const komentar = await Komentar.findAll({
      where: { laporan_id: id },
      include: [
        { model: User, as: 'penulis', attributes: ['id', 'nama', 'avatar_url', 'role'] },
      ],
      order: [['created_at', 'ASC']],
    });

    return successResponse(res, komentar, 'Komentar berhasil diambil');
  } catch (error) {
    next(error);
  }
};

// POST /api/laporan/:id/komentar
const createKomentar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isi } = req.body;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    const komentar = await Komentar.create({
      laporan_id: id,
      user_id: req.user.id,
      isi,
    });

    const result = await Komentar.findByPk(komentar.id, {
      include: [{ model: User, as: 'penulis', attributes: ['id', 'nama', 'avatar_url', 'role'] }],
    });

    return successResponse(res, result, 'Komentar berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/komentar/:id
const updateKomentar = async (req, res, next) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id);
    if (!komentar) return errorResponse(res, 'Komentar tidak ditemukan', 404);

    if (komentar.user_id !== req.user.id) {
      return errorResponse(res, 'Anda tidak berhak mengubah komentar ini', 403);
    }

    await komentar.update({ isi: req.body.isi });

    const result = await Komentar.findByPk(komentar.id, {
      include: [{ model: User, as: 'penulis', attributes: ['id', 'nama', 'avatar_url', 'role'] }],
    });

    return successResponse(res, result, 'Komentar berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/komentar/:id
const deleteKomentar = async (req, res, next) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id);
    if (!komentar) return errorResponse(res, 'Komentar tidak ditemukan', 404);

    const isOwner = komentar.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Anda tidak berhak menghapus komentar ini', 403);
    }

    await komentar.destroy();
    return successResponse(res, null, 'Komentar berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getKomentar, createKomentar, updateKomentar, deleteKomentar };
