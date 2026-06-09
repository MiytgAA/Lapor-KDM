'use strict';

const sequelize = require('../config/database');
const User = require('./User');
const Kategori = require('./Kategori');
const Laporan = require('./Laporan');
const Komentar = require('./Komentar');
const Gambar = require('./Gambar');

// ─── Asosiasi ─────────────────────────────────────────────────────────────────

// User → Laporan (One-to-Many)
User.hasMany(Laporan, { foreignKey: 'user_id', as: 'laporan', onDelete: 'CASCADE' });
Laporan.belongsTo(User, { foreignKey: 'user_id', as: 'pelapor' });

// Kategori → Laporan (One-to-Many)
Kategori.hasMany(Laporan, { foreignKey: 'kategori_id', as: 'laporan', onDelete: 'RESTRICT' });
Laporan.belongsTo(Kategori, { foreignKey: 'kategori_id', as: 'kategori' });

// Laporan → Komentar (One-to-Many)
Laporan.hasMany(Komentar, { foreignKey: 'laporan_id', as: 'komentar', onDelete: 'CASCADE' });
Komentar.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });

// User → Komentar (One-to-Many)
User.hasMany(Komentar, { foreignKey: 'user_id', as: 'komentar', onDelete: 'CASCADE' });
Komentar.belongsTo(User, { foreignKey: 'user_id', as: 'penulis' });

// Laporan → Gambar (One-to-Many)
Laporan.hasMany(Gambar, { foreignKey: 'laporan_id', as: 'gambar', onDelete: 'CASCADE' });
Gambar.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });

module.exports = {
  sequelize,
  User,
  Kategori,
  Laporan,
  Komentar,
  Gambar,
};
