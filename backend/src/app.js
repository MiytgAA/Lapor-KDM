'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const userRoutes = require('./routes/userRoutes');
const komentarRoutes = require('./routes/komentarRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const statistikRoutes = require('./routes/statistikRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi dalam 1 menit.',
  },
});
app.use('/api', limiter);

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (uploads) ───────────────────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads'))
);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Lapor KDM API berjalan normal',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/komentar', komentarRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/statistik', statistikRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
