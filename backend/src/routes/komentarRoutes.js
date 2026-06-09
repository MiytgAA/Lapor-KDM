'use strict';

const express = require('express');
const router = express.Router();
const { updateKomentar, deleteKomentar } = require('../controllers/komentarController');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { updateKomentarSchema } = require('../validations/komentarValidation');

// PUT  /api/komentar/:id  — owner only
router.put('/:id', verifyToken, validate(updateKomentarSchema), updateKomentar);

// DELETE /api/komentar/:id — owner atau admin
router.delete('/:id', verifyToken, deleteKomentar);

module.exports = router;
