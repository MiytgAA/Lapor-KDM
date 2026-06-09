'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Laporan = sequelize.define(
  'Laporan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    kategori_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kategori',
        key: 'id',
      },
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Judul laporan tidak boleh kosong' },
        len: { args: [5, 255], msg: 'Judul harus 5–255 karakter' },
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Deskripsi laporan tidak boleh kosong' },
        len: { args: [10], msg: 'Deskripsi minimal 10 karakter' },
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'laporan',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['kategori_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);

module.exports = Laporan;
