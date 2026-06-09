'use strict';

/**
 * Factory middleware untuk role-based access control
 * @param {...string} roles - Role yang diizinkan (e.g., 'admin', 'super_admin')
 * 
 * Penggunaan:
 *   router.delete('/...', verifyToken, requireRole('admin', 'super_admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya ${roles.join(' / ')} yang dapat melakukan aksi ini.`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
