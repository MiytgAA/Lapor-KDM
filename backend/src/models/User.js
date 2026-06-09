'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama tidak boleh kosong' },
        len: { args: [2, 100], msg: 'Nama harus 2–100 karakter' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Email sudah terdaftar' },
      validate: {
        isEmail: { msg: 'Format email tidak valid' },
        notEmpty: { msg: 'Email tidak boleh kosong' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    hooks: {
      // Hash password sebelum disimpan
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Method untuk membandingkan password
User.prototype.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Method untuk data publik (tanpa password)
User.prototype.toPublicJSON = function () {
  const { password, ...publicData } = this.toJSON();
  return publicData;
};

module.exports = User;
