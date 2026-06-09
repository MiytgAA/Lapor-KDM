'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Komentar = sequelize.define(
  'Komentar',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    laporan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'laporan',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isi: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Isi komentar tidak boleh kosong' },
        len: { args: [1, 2000], msg: 'Komentar maksimal 2000 karakter' },
      },
    },
  },
  {
    tableName: 'komentar',
    indexes: [{ fields: ['laporan_id'] }, { fields: ['user_id'] }],
  }
);

module.exports = Komentar;
