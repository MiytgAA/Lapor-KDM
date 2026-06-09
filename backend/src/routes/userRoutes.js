'use strict';

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { createUserSchema, updateUserSchema, filterUserSchema } = require('../validations/userValidation');

// Semua route users hanya bisa diakses oleh super_admin
router.use(verifyToken, requireRole('super_admin'));

// GET  /api/users
router.get('/', validate(filterUserSchema, 'query'), getAllUsers);

// GET  /api/users/:id
router.get('/:id', getUserById);

// POST /api/users
router.post('/', validate(createUserSchema), createUser);

// PUT  /api/users/:id
router.put('/:id', validate(updateUserSchema), updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
