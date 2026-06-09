'use strict';

const { Gambar } = require('../models');
const { successResponse, errorResponse, buildFileUrl } = require('../utils/helpers');

// POST /api/upload
// Upload satu atau lebih gambar (tanpa terikat laporan tertentu)
const uploadGambar = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Tidak ada file yang diupload', 400);
    }

    const uploaded = req.files.map((file) => ({
      url: buildFileUrl(req, file.filename),
      filename: file.filename,
      originalname: file.originalname,
      size_bytes: file.size,
      mimetype: file.mimetype,
    }));

    return successResponse(res, uploaded, `${uploaded.length} gambar berhasil diupload`, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadGambar };
