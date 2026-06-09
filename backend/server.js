'use strict';

require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Folder uploads dibuat');
}

// Koneksi database & start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Sync model ke database (buat tabel jika belum ada)
    await sequelize.sync({ alter: false });
    console.log('✅ Sinkronisasi database selesai');

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  🚀 LAPOR KDM API — Server Running');
      console.log(`  📡 Port    : ${PORT}`);
      console.log(`  🌍 Mode    : ${process.env.NODE_ENV}`);
      console.log(`  🔗 URL     : http://localhost:${PORT}`);
      console.log('═══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Gagal start server:', error.message);
    process.exit(1);
  }
}

startServer();
