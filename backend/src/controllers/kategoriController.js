'use strict';

const { Kategori } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/kategori
const getAllKategori = async (req, res, next) => {
  try {
    const kategoris = await Kategori.findAll({
      order: [['nama', 'ASC']],
    });
    return successResponse(res, kategoris, 'Daftar kategori berhasil diambil');
  } catch (error) {
    next(error);
  }
};

// GET /api/kategori/:id
const getKategoriById = async (req, res, next) => {
  try {
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) return errorResponse(res, 'Kategori tidak ditemukan', 404);
    return successResponse(res, kategori, 'Detail kategori berhasil diambil');
  } catch (error) {
    next(error);
  }
};

// POST /api/kategori
const createKategori = async (req, res, next) => {
  try {
    const { nama, deskripsi, warna } = req.body;

    const existing = await Kategori.findOne({ where: { nama } });
    if (existing) return errorResponse(res, 'Nama kategori sudah ada', 409);

    const kategori = await Kategori.create({ nama, deskripsi, warna });
    return successResponse(res, kategori, 'Kategori berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/kategori/:id
const updateKategori = async (req, res, next) => {
  try {
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    // Cek nama tidak duplikat jika diubah
    if (req.body.nama && req.body.nama !== kategori.nama) {
      const existing = await Kategori.findOne({ where: { nama: req.body.nama } });
      if (existing) return errorResponse(res, 'Nama kategori sudah digunakan', 409);
    }

    await kategori.update(req.body);
    return successResponse(res, kategori, 'Kategori berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/kategori/:id
const deleteKategori = async (req, res, next) => {
  try {
    const kategori = await Kategori.findByPk(req.params.id);
    if (!kategori) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    try {
      await kategori.destroy();
    } catch (err) {
      // Jika ada laporan yang menggunakan kategori ini, tidak bisa dihapus
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return errorResponse(
          res,
          'Kategori tidak dapat dihapus karena masih digunakan oleh laporan',
          409
        );
      }
      throw err;
    }

    return successResponse(res, null, 'Kategori berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllKategori, getKategoriById, createKategori, updateKategori, deleteKategori };
