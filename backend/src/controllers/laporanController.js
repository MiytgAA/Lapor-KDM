'use strict';

const { Op } = require('sequelize');
const { Laporan, User, Kategori, Komentar, Gambar } = require('../models');
const {
  successResponse,
  errorResponse,
  getPagination,
  createError,
  buildFileUrl,
} = require('../utils/helpers');

// GET /api/laporan
const getAllLaporan = async (req, res, next) => {
  try {
    const { page, limit, status, kategori_id, search, sort, user_id } = req.query;
    const { meta, offset, limit: perPage } = getPagination(page, limit, 0);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (kategori_id) where.kategori_id = parseInt(kategori_id);
    if (user_id) where.user_id = parseInt(user_id);
    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } },
      ];
    }

    const order = sort === 'oldest' ? [['created_at', 'ASC']] : [['created_at', 'DESC']];

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: [
        { model: User, as: 'pelapor', attributes: ['id', 'nama', 'email', 'avatar_url'] },
        { model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna'] },
        { model: Gambar, as: 'gambar', attributes: ['id', 'url', 'filename'] },
      ],
      order,
      limit: perPage,
      offset,
      distinct: true,
    });

    const pagination = { ...meta, total: count, totalPages: Math.ceil(count / perPage) };

    return successResponse(res, rows, 'Daftar laporan berhasil diambil', 200, pagination);
  } catch (error) {
    next(error);
  }
};

// GET /api/laporan/:id
const getLaporanById = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'pelapor', attributes: ['id', 'nama', 'email', 'avatar_url'] },
        { model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna', 'deskripsi'] },
        { model: Gambar, as: 'gambar', attributes: ['id', 'url', 'filename', 'size_bytes'] },
        {
          model: Komentar,
          as: 'komentar',
          include: [{ model: User, as: 'penulis', attributes: ['id', 'nama', 'avatar_url', 'role'] }],
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    return successResponse(res, laporan, 'Detail laporan berhasil diambil');
  } catch (error) {
    next(error);
  }
};

// POST /api/laporan
const createLaporan = async (req, res, next) => {
  try {
    const { judul, deskripsi, kategori_id } = req.body;

    // Cek kategori ada
    const kategori = await Kategori.findByPk(kategori_id);
    if (!kategori) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    const laporan = await Laporan.create({
      user_id: req.user.id,
      kategori_id,
      judul,
      deskripsi,
      status: 'pending',
    });

    // Simpan gambar yang diupload (jika ada)
    if (req.files && req.files.length > 0) {
      const gambarData = req.files.map((file) => ({
        laporan_id: laporan.id,
        url: buildFileUrl(req, file.filename),
        filename: file.filename,
        size_bytes: file.size,
      }));
      await Gambar.bulkCreate(gambarData);
    }

    // Fetch ulang dengan relasi
    const result = await Laporan.findByPk(laporan.id, {
      include: [
        { model: User, as: 'pelapor', attributes: ['id', 'nama', 'email'] },
        { model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna'] },
        { model: Gambar, as: 'gambar', attributes: ['id', 'url', 'filename'] },
      ],
    });

    return successResponse(res, result, 'Laporan berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/laporan/:id
const updateLaporan = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    // Hanya pemilik yang bisa edit, dan hanya jika status masih pending
    if (laporan.user_id !== req.user.id) {
      return errorResponse(res, 'Anda tidak berhak mengubah laporan ini', 403);
    }
    if (laporan.status !== 'pending') {
      return errorResponse(res, 'Laporan yang sudah diproses tidak dapat diedit', 400);
    }

    const { judul, deskripsi, kategori_id } = req.body;
    if (kategori_id) {
      const kategori = await Kategori.findByPk(kategori_id);
      if (!kategori) return errorResponse(res, 'Kategori tidak ditemukan', 404);
    }

    await laporan.update({ judul, deskripsi, kategori_id });

    const result = await Laporan.findByPk(laporan.id, {
      include: [
        { model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna'] },
        { model: Gambar, as: 'gambar', attributes: ['id', 'url', 'filename'] },
      ],
    });

    return successResponse(res, result, 'Laporan berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/laporan/:id
const deleteLaporan = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    const isOwner = laporan.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Anda tidak berhak menghapus laporan ini', 403);
    }

    await laporan.destroy();
    return successResponse(res, null, 'Laporan berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/laporan/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    const { status } = req.body;
    await laporan.update({ status });

    return successResponse(
      res,
      { id: laporan.id, status: laporan.status },
      `Status laporan berhasil diubah menjadi "${status}"`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  updateStatus,
};
