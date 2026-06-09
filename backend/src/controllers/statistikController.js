'use strict';

const { sequelize, Laporan, User, Kategori } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/statistik/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // ── Total keseluruhan ──────────────────────────────────────────────────────
    const totalLaporan = await Laporan.count();
    const totalUser = await User.count({ where: { role: 'user', is_active: true } });
    const totalKategori = await Kategori.count();

    // ── Per status ────────────────────────────────────────────────────────────
    const [pending, approved, rejected] = await Promise.all([
      Laporan.count({ where: { status: 'pending' } }),
      Laporan.count({ where: { status: 'approved' } }),
      Laporan.count({ where: { status: 'rejected' } }),
    ]);

    // ── Per kategori ──────────────────────────────────────────────────────────
    const perKategori = await Laporan.findAll({
      attributes: [
        'kategori_id',
        [sequelize.fn('COUNT', sequelize.col('Laporan.id')), 'total'],
      ],
      include: [{ model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna'] }],
      group: ['kategori_id', 'kategori.id', 'kategori.nama', 'kategori.warna'],
      order: [[sequelize.literal('total'), 'DESC']],
    });

    // ── Trend 7 hari terakhir ──────────────────────────────────────────────────
    const trendQuery = `
      SELECT 
        DATE(created_at) as tanggal,
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'approved') as approved,
        SUM(status = 'rejected') as rejected
      FROM laporan
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY tanggal ASC
    `;
    const [trendData] = await sequelize.query(trendQuery);

    // ── Laporan terbaru (5 terakhir) ──────────────────────────────────────────
    const laporanTerbaru = await Laporan.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'pelapor', attributes: ['id', 'nama', 'avatar_url'] },
        { model: Kategori, as: 'kategori', attributes: ['id', 'nama', 'warna'] },
      ],
    });

    return successResponse(res, {
      summary: {
        total_laporan: totalLaporan,
        total_user: totalUser,
        total_kategori: totalKategori,
        pending,
        approved,
        rejected,
      },
      per_kategori: perKategori,
      trend_7_hari: trendData,
      laporan_terbaru: laporanTerbaru,
    }, 'Data statistik berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
