'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kategori = sequelize.define(
  'Kategori',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Nama kategori sudah ada' },
      validate: {
        notEmpty: { msg: 'Nama kategori tidak boleh kosong' },
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    warna: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#7a3dff',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Warna harus format hex (contoh: #7a3dff)',
        },
      },
    },
  },
  {
    tableName: 'kategori',
  }
);

module.exports = Kategori;
