'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `laporan-${uniqueSuffix}${ext}`);
  },
});

// Filter tipe file (hanya JPG, PNG, WebP)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

// Upload single
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
}).single('gambar');

// Upload multiple (max 5 gambar)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize, files: 5 },
}).array('gambar', 5);

module.exports = { uploadSingle, uploadMultiple };
