'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gambar = sequelize.define(
  'Gambar',
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    size_bytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'gambar',
    updatedAt: false, // gambar tidak memiliki updated_at
    indexes: [{ fields: ['laporan_id'] }],
  }
);

module.exports = Gambar;
